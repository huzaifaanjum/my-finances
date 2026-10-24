"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Crosshair, linePath, plotHeight, plotWidth, viewBoxX, XLabel, YGrid, fiveTicks, type Frame } from "@/components/charts/axes";
import { PlannerSlider } from "@/components/planner/shared/controls";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { SegmentBar } from "@/components/ui/bars";
import Card from "@/components/ui/Card";
import { COLOR } from "@/lib/colors";
import { compactMoney, duration, money, percent } from "@/lib/format";
import { monthLabel, planIndex } from "@/lib/planner/calendar";
import { SLIDERS, type SliderKey } from "@/lib/planner/config";
import { RETIREMENT_MONTH } from "@/lib/planner/finance";
import type { Retirement } from "@/lib/planner/retirement";
import { RETIREMENT_FACTS } from "@/lib/retirementFacts";

const BIRTH_YEAR = 1997;
const KEYS: SliderKey[] = ["ret_sg", "ret_pr", "ret_wr", "ret_inf"];
const MARK_AGES = [35, 45, 55, 65];
const HEIGHT = 230;

/** Plan month of your birthday at `age` (born July 1997). */
const monthOfAge = (age: number) => Math.min(RETIREMENT_MONTH, planIndex(BIRTH_YEAR + age, 6));

function Assumption({ k, children }: { k: SliderKey; children: ReactNode }) {
  return (
    <div className="rt-as">
      <PlannerSlider k={k} />
      <small>{children}</small>
    </div>
  );
}

/** The pension pot from today to 65 in today's dollars, with the round birthdays marked. Hover for any month. */
function PotChart({ r }: { r: Retirement }) {
  const [hover, setHover] = useState<number | null>(null);
  // draw at the container's real width so labels stay their normal size
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const FRAME: Frame = { width, height: HEIGHT, left: 52, right: 14, top: 26, bottom: 26 };
  const narrow = width < 520;
  const { pots, deflator } = r.pension;
  const n = RETIREMENT_MONTH + 1;
  const real = (m: number) => pots[m] / deflator(m);
  const max = Math.max(1, real(RETIREMENT_MONTH)) * 1.08;
  const pw = plotWidth(FRAME);
  const ph = plotHeight(FRAME);
  const X = (m: number) => FRAME.left + (m / (n - 1)) * pw;
  const Y = (v: number) => FRAME.top + ph - (v / max) * ph;
  const pts: [number, number][] = [];
  for (let m = 0; m < n; m += 3) pts.push([X(m), Y(real(m))]);
  pts.push([X(n - 1), Y(real(n - 1))]);
  const line = linePath(pts);
  const area = `${line} L${X(n - 1).toFixed(1)} ${Y(0).toFixed(1)} L${X(0).toFixed(1)} ${Y(0).toFixed(1)} Z`;
  const m = hover ?? 0;
  // 29 and three months in October 2026
  const age = (mm: number) => Math.floor(29 + (mm + 3) / 12);

  return (
    <div className="rt-pot" ref={box}>
      <div className="rt-read">
        <span>
          {hover === null ? "Today" : `Age ${age(m)}`} · {monthLabel(m)}
        </span>
        <b>{money(real(m))}</b>
        <em>in today&rsquo;s dollars{hover === null && " · hover the chart to see any month"}</em>
      </div>
      <svg
        viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
        role="img"
        aria-label={`Pension pot in today's dollars: ${MARK_AGES.map((a) => `age ${a} ${money(real(monthOfAge(a)))}`).join(", ")}`}
        onPointerMove={(e) => {
          const x = viewBoxX(e, FRAME.width);
          setHover(Math.max(0, Math.min(n - 1, Math.round(((x - FRAME.left) / pw) * (n - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <YGrid frame={FRAME} values={fiveTicks(0, max)} y={Y} format={compactMoney} />
        {(narrow ? [30, 40, 50, 65] : [30, 35, 40, 45, 50, 55, 60, 65]).map((a) => (
          <XLabel key={a} x={X(monthOfAge(a))} frame={FRAME}>
            {a === 30 ? "age 30" : a}
          </XLabel>
        ))}
        <path d={area} fill={COLOR.pension} opacity="0.12" />
        <path d={line} fill="none" stroke={COLOR.pension} strokeWidth="2.25" strokeLinejoin="round" />
        {MARK_AGES.map((a) => {
          const mm = monthOfAge(a);
          return (
            <g key={a}>
              <circle cx={X(mm)} cy={Y(real(mm))} r="4" fill={COLOR.pension} stroke="#09090b" strokeWidth="2" />
              <text x={X(mm)} y={Y(real(mm)) - 10} textAnchor={a === 65 ? "end" : "middle"} className="rt-lbl">
                {compactMoney(real(mm))}
              </text>
            </g>
          );
        })}
        {hover !== null && <Crosshair x={X(m)} y={Y(real(m))} top={FRAME.top} bottom={FRAME.top + ph} />}
      </svg>
    </div>
  );
}

/** What you would live on at 65, the assumptions behind it, and how the pension pot gets there. */
export default function RetirementIncomeCard({ r, net }: { r: Retirement; net: number }) {
  const { state, setNumber, setNumbers } = usePlanner();
  const n = state.numbers;
  const scale = Math.max(r.total, net) * 1.05;
  const custom = KEYS.some((k) => n[k] !== SLIDERS[k].initial);
  const { inflation, inflationTarget, qppMax65, oasMax } = RETIREMENT_FACTS;
  const withoutOwn = r.sources.filter((s) => s.effort !== "act").reduce((t, s) => t + s.today, 0);

  return (
    <Card title="Income when you retire" description={`You turn 65 on July 2, 2062, ${duration(RETIREMENT_MONTH)} from now. Every amount is monthly, in today's dollars, so you can compare it with what you live on now.`}>
      <div className="rtg">
        <section className="rt-side" aria-label="Assumptions">
          <div className="rt-side-h">
            <h3>Assumptions</h3>
            {custom && (
              <button type="button" className="bd-link" onClick={() => setNumbers(Object.fromEntries(KEYS.map((k) => [k, SLIDERS[k].initial])))}>
                Reset to today&rsquo;s figures
              </button>
            )}
          </div>
          <Assumption k="ret_sg">Raises each January. Also used by the Payslips forecast.</Assumption>
          <Assumption k="ret_pr">What the pension fund earns a year. Also used by the Payslips forecast.</Assumption>
          <Assumption k="ret_wr">How much of the pot you take out each year. 4% usually makes savings last about 30 years.</Assumption>
          <Assumption k="ret_inf">
            Canada was at {inflation.value}% in {inflation.asOf} ({inflation.source}); the Bank of Canada aims for {inflationTarget}% over time.
            {n.ret_inf !== inflationTarget && (
              <>
                {" "}
                <button type="button" className="bd-link" onClick={() => setNumber("ret_inf", inflationTarget)}>
                  use {inflationTarget}%
                </button>
              </>
            )}
          </Assumption>
        </section>

        <section className="rt-main" aria-label="Monthly income at 65">
          <p className="rt-head">
            <b>{money(r.total)}</b> a month at 65
          </p>
          <p className="rt-sub">
            {percent(r.replacement)} of your take-home today ({money(net)}). Without investing on your own: {money(withoutOwn)}, or {percent(net ? withoutOwn / net : 0)}.
          </p>
          <SegmentBar variant="thick" segments={r.sources.map((s) => ({ width: (s.today / scale) * 100, color: s.color, title: s.name }))} marker={(net / scale) * 100} />
          <ul className="rt-src">
            {r.sources.map((s) => (
              <li key={s.name}>
                <i style={{ background: s.color }} />
                <span>
                  {s.name}
                  {s.effort === "act" && <em> · only if you invest</em>}
                </span>
                <b>{money(s.today)}</b>
                <small>{percent(r.total ? s.today / r.total : 0)}</small>
              </li>
            ))}
            <li className="rt-tick">
              <i />
              <span>Your take-home today</span>
              <b>{money(net)}</b>
              <small />
            </li>
          </ul>
        </section>
      </div>

      <h3 className="rt-h rt-gap">Your pension pot, today to 65</h3>
      <PotChart r={r} />

      <ul className="rt-notes">
        <li>
          The Air Canada plan is treated as a defined-contribution account: your 6% plus the 6% match ({money(r.pension.monthlyNow.mine + r.pension.monthlyNow.match, 2)} a month on {r.pension.source},{" "}
          {money(r.pension.soFar, 2)} in so far), on a salary reaching about {money(r.pension.finalSalary)} by 2062. If it is defined-benefit, check the formula in your plan booklet on HR Connex.
        </li>
        <li>
          QPP uses the {qppMax65.asOf} maximum at 65 ({money(qppMax65.value, 2)}, {qppMax65.source}), which you get close to by earning above the QPP ceiling for about 39 years. OAS uses the {oasMax.asOf} maximum ({money(oasMax.value, 2)}, {oasMax.source}) and is reduced if your retirement income is high. Both grow with inflation and can start earlier or later.
        </li>
      </ul>
    </Card>
  );
}
