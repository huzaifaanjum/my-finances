"use client";

import { useMemo, useState } from "react";
import { fiveTicks, plotHeight, plotWidth, viewBoxX, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { TipRow, TipTitle } from "@/components/charts/TooltipRows";
import Card from "@/components/ui/Card";
import FloatingTip from "@/components/ui/FloatingTip";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import RangeControl from "@/components/ui/RangeControl";
import { Legend, Note, SectionHeading } from "@/components/ui/text";
import { useElementWidth } from "@/hooks/useElementWidth";
import { compactMoney, money, pctLabel } from "@/lib/format";
import { BUCKETS, MONTHS_LONG } from "@/lib/payslips/analysis";
import { forecast, type ForecastMonth, type ForecastSettings } from "@/lib/payslips/forecast";
import { INDEX } from "@/lib/payslips/tax";
import type { PayslipData } from "@/lib/payslips/types";
import { SLIDERS } from "@/lib/planner/config";
import { RETIREMENT_DATE } from "@/lib/planner/finance";
import SalaryBreakdown from "./SalaryBreakdown";

const HORIZONS = [1, 2, 5, 10, 25, 50] as const;
type Horizon = (typeof HORIZONS)[number];

/** Stacked bottom to top. */
const STACK = ["takeHome", "incomeTax", "pension", "govPlans", "insurance"] as const;
type StackKey = (typeof STACK)[number];

const BIRTH_YEAR = 1997;
const BIRTH_MONTH = 6;
const SHORT = MONTHS_LONG.map((m) => m.slice(0, 3));

interface Bar {
  axis: string;
  title: string;
  vals: Record<StackKey, number>;
  gross: number;
  match: number;
  pot: number;
  retired: boolean;
}

const zero = (): Record<StackKey, number> => ({ takeHome: 0, incomeTax: 0, pension: 0, govPlans: 0, insurance: 0 });

const ageAt = (m: ForecastMonth) => m.year - BIRTH_YEAR - (m.month < BIRTH_MONTH ? 1 : 0);

function toBars(months: ForecastMonth[], monthly: boolean, real: boolean, running: boolean): Bar[] {
  const out: Bar[] = [];
  const size = monthly ? 1 : 12;
  for (let k = 0; k < months.length; k += size) {
    const chunk = months.slice(k, k + size);
    const vals = zero();
    let gross = 0;
    let match = 0;
    chunk.forEach((m, j) => {
      const f = real ? Math.pow(1 + INDEX, (k + j) / 12) : 1;
      vals.takeHome += m.net / f;
      vals.incomeTax += m.incomeTax / f;
      vals.pension += m.pension / f;
      vals.govPlans += m.govPlans / f;
      vals.insurance += m.insurance / f;
      gross += m.gross / f;
      match += m.match / f;
    });
    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    const potF = real ? Math.pow(1 + INDEX, (k + chunk.length) / 12) : 1;
    out.push({
      axis: monthly ? (first.month === 0 || k === 0 ? `${SHORT[first.month]} '${String(first.year).slice(2)}` : SHORT[first.month]) : `'${String(last.year).slice(2)}`,
      title: monthly
        ? `${MONTHS_LONG[first.month]} ${first.year}`
        : `${SHORT[first.month]} ${first.year} – ${SHORT[last.month]} ${last.year} · age ${ageAt(first)}–${ageAt(last)}`,
      vals,
      gross,
      match,
      pot: last.pot / potF,
      retired: chunk.every((m) => m.retired),
    });
  }
  if (running) {
    const acc = zero();
    let g = 0;
    let mt = 0;
    for (const b of out) {
      for (const s of STACK) acc[s] += b.vals[s];
      g += b.gross;
      mt += b.match;
      b.vals = { ...acc };
      b.gross = g;
      b.match = mt;
    }
  }
  return out;
}

interface Props {
  latest: PayslipData;
  settings: ForecastSettings;
  onSettings: (s: ForecastSettings) => void;
  /** DC pension contributed so far, all years */
  pensionSoFar: number;
}

/** What your pay adds up to over 1 to 50 years, and where it goes. */
export default function PayForecast({ latest, settings, onSettings, pensionSoFar }: Props) {
  const [years, setYears] = useState<Horizon>(5);
  const [running, setRunning] = useState(false);
  const [real, setReal] = useState(false);
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const [ref, width] = useElementWidth<HTMLDivElement>(720);

  const fc = useMemo(() => forecast(latest, settings, 50, pensionSoFar), [latest, settings, pensionSoFar]);
  const months = useMemo(() => fc.months.slice(0, years * 12), [fc, years]);
  const monthly = years <= 2;
  const bars = useMemo(() => toBars(months, monthly, real, running), [months, monthly, real, running]);

  const frame: Frame = { width: Math.max(320, width), height: 300, left: 52, right: 8, top: 12, bottom: 28 };
  const pw = plotWidth(frame);
  const ph = plotHeight(frame);
  const n = bars.length;
  const slot = pw / n;
  const barW = Math.max(2, slot - (n > 30 ? 2 : 6));
  const total = (b: Bar) => STACK.reduce((t, s) => t + b.vals[s], 0);
  const max = Math.max(1, ...bars.map(total));
  const Y = (v: number) => frame.top + ph - (v / max) * ph;
  const labelEvery = Math.ceil(n / Math.max(4, Math.floor(pw / 64)));
  const retireAt = bars.findIndex((b) => b.retired);

  // horizon totals
  const sums = toBars(months, false, real, true).at(-1)!;
  const lastWorking = [...months].reverse().find((m) => !m.retired);
  const salaryEnd = lastWorking ? lastWorking.base * 12 / (real ? Math.pow(1 + INDEX, months.indexOf(lastWorking) / 12) : 1) : 0;
  const unit = real ? " in today's dollars" : "";
  const retiredInRange = retireAt >= 0;

  const hb = hover ? bars[hover.i] : null;

  return (
    <section className="ps-sec">
      <SectionHeading title="How much you'll make">
        A forecast built from your latest payslip: raises each January, the yearly incentive each March, the signing bonuses, and payroll plans that stop once
        their yearly maximum is reached. Pay stops at 65.
      </SectionHeading>

      <div className="ps-fc">
        <Card
          header={
            <div className="ps-head">
              <div>
                <h3>{running ? "Running total" : monthly ? "Each month" : "Each year"}</h3>
                <p className="d">
                  Gross pay split into where it goes{unit}. {monthly ? "Hover a month" : "Hover a year"} for details.
                </p>
              </div>
              <div className="ps-seg" role="group" aria-label="Forecast length">
                {HORIZONS.map((h) => (
                  <button key={h} type="button" aria-pressed={years === h} onClick={() => setYears(h)}>
                    {h} {h === 1 ? "yr" : "yrs"}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          <div className="ps-opts">
            <div className="ps-seg sm" role="group" aria-label="Show">
              <button type="button" aria-pressed={!running} onClick={() => setRunning(false)}>
                {monthly ? "Per month" : "Per year"}
              </button>
              <button type="button" aria-pressed={running} onClick={() => setRunning(true)}>
                Running total
              </button>
            </div>
            <label className="chk">
              <input type="checkbox" checked={real} onChange={(e) => setReal(e.target.checked)} /> Today&apos;s dollars
            </label>
          </div>

          <div ref={ref} className="ps-chart">
            <svg
              viewBox={`0 0 ${frame.width} ${frame.height}`}
              role="img"
              aria-label={`Forecast of pay over ${years} years`}
              onPointerMove={(e) => {
                const x = viewBoxX(e, frame.width);
                const i = Math.floor((x - frame.left) / slot);
                setHover(i >= 0 && i < n ? { i, x: e.clientX, y: e.clientY } : null);
              }}
              onPointerLeave={() => setHover(null)}
            >
              <YGrid frame={frame} values={fiveTicks(0, max)} y={Y} format={compactMoney} />
              {bars.map((b, i) => {
                const x = frame.left + i * slot + (slot - barW) / 2;
                let acc = 0;
                const dim = hover && hover.i !== i;
                return (
                  <g key={i} opacity={dim ? 0.45 : 1}>
                    {STACK.map((s) => {
                      const v = b.vals[s];
                      if (v <= 0) return null;
                      const y0 = Y(acc);
                      acc += v;
                      const h = y0 - Y(acc);
                      // 1px of surface between stacked segments
                      return h > 0.5 ? (
                        <rect key={s} x={x} y={Y(acc)} width={barW} height={Math.max(0.5, h - (n > 30 ? 0.5 : 1))} fill={BUCKETS[s].color} rx={n > 30 ? 0 : 1.5} />
                      ) : null;
                    })}
                  </g>
                );
              })}
              {retiredInRange && (
                <g pointerEvents="none">
                  <line
                    x1={frame.left + retireAt * slot}
                    x2={frame.left + retireAt * slot}
                    y1={frame.top}
                    y2={frame.top + ph}
                    stroke="#a1a1aa"
                    strokeDasharray="4 4"
                  />
                  <text x={frame.left + retireAt * slot + 6} y={frame.top + 12} fill="#a1a1aa" fontSize="11">
                    Retire at 65 ({SHORT[RETIREMENT_DATE.getMonth()]} {RETIREMENT_DATE.getFullYear()})
                  </text>
                </g>
              )}
              {bars.map((b, i) =>
                i % labelEvery === 0 ? (
                  <XLabel key={i} x={frame.left + i * slot + slot / 2} frame={frame}>
                    {b.axis}
                  </XLabel>
                ) : null,
              )}
            </svg>
          </div>
          <Legend items={STACK.map((s) => ({ label: BUCKETS[s].label, color: BUCKETS[s].color }))} />
          {hb && hover && (
            <FloatingTip point={{ x: hover.x, y: hover.y }}>
              <TipTitle>{running ? `Up to ${hb.title.split(" – ").pop()?.split(" · ")[0]}` : hb.title}</TipTitle>
              {hb.retired && !running ? (
                <div>Retired, no pay</div>
              ) : (
                <>
                  {STACK.map((s) => (
                    <TipRow key={s} label={BUCKETS[s].label} value={hb.vals[s]} color={BUCKETS[s].color} />
                  ))}
                  <TipRow label="Gross pay" value={hb.gross} total />
                  <TipRow label="Employer pension match" value={hb.match} />
                  <TipRow label="Pension balance" value={hb.pot} />
                </>
              )}
            </FloatingTip>
          )}
        </Card>

        <Card title="Assumptions" description="Raise and pension return are shared with the Retirement tab, so both always agree.">
          <div className="stack">
            <RangeControl
              label="Raise each January"
              value={settings.raise * 100}
              min={SLIDERS.ret_sg.min}
              max={SLIDERS.ret_sg.max}
              step={SLIDERS.ret_sg.step}
              format={pctLabel}
              onChange={(v) => onSettings({ ...settings, raise: v / 100 })}
            />
            <RangeControl
              label="Yearly incentive (AIP)"
              value={settings.bonus * 100}
              min={0}
              max={16}
              step={1}
              format={pctLabel}
              onChange={(v) => onSettings({ ...settings, bonus: v / 100 })}
            />
            <RangeControl
              label="Pension fund return"
              value={settings.growth * 100}
              min={SLIDERS.ret_pr.min}
              max={SLIDERS.ret_pr.max}
              step={SLIDERS.ret_pr.step}
              format={pctLabel}
              onChange={(v) => onSettings({ ...settings, growth: v / 100 })}
            />
          </div>
          <Note style={{ marginTop: 12 }}>
            Starts from {money(fc.salary)} a year. Tax uses 2026 federal and Quebec rates with brackets and plan maximums indexed {Math.round(INDEX * 100)}% a
            year, scaled to match what your latest payslip withheld (federal ×{fc.calibration.fed.toFixed(2)}, Quebec ×{fc.calibration.qc.toFixed(2)}).
            Refunds or balances owing at tax time are not included. Insurance grows with salary. Today&apos;s dollars removes {Math.round(INDEX * 100)}% inflation a
            year.
          </Note>
        </Card>
      </div>

      <KpiGrid className="ps-kpis">
        <Kpi label={`Gross pay, ${years} ${years === 1 ? "year" : "years"}`} value={money(sums.gross)} note={`salary and bonuses${unit}`} tip="Everything Air Canada pays you over the period, before deductions." />
        <Kpi label="Take-home" value={money(sums.vals.takeHome)} note={`about ${money(sums.vals.takeHome / Math.max(1, months.filter((m) => !m.retired).length))} a working month`} tone="hero" tip="What reaches your bank account over the period." />
        <Kpi label="Income tax" value={money(sums.vals.incomeTax)} note={`${Math.round((sums.vals.incomeTax / (sums.gross || 1)) * 100)}% of gross`} tip="Federal and Quebec income tax withheld over the period." />
        <Kpi label="Government plans" value={money(sums.vals.govPlans)} note="QPP, EI and QPIP; QPP comes back as a pension" tip="Quebec Pension Plan, Employment Insurance and Quebec Parental Insurance." />
        <Kpi
          label={retiredInRange ? "Pension at 65" : "Pension balance"}
          value={money(retiredInRange ? bars[retireAt - 1]?.pot ?? sums.pot : sums.pot)}
          note={`you and Air Canada at 6% each, growing ${pctLabel(settings.growth * 100)} a year`}
          tone="pos"
          tip="Your DC pension: your contributions, Air Canada's match and investment growth. It ignores fees and any money already in the account beyond this year's contributions."
        />
        <Kpi label="Salary by then" value={money(salaryEnd)} note={`a year, with ${pctLabel(settings.raise * 100)} raises${unit}`} tip="Base salary in the last working month of the period, as a yearly figure." />
      </KpiGrid>

      <SalaryBreakdown salaryNow={fc.salary} months={months} years={years} real={real} />
    </section>
  );
}
