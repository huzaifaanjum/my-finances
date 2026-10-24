"use client";

import { G } from "@/components/glossary/GlossaryText";
import { useReferencePayslip } from "@/components/payslips/useReferencePayslip";
import { usePlanner } from "@/components/providers/PlannerProvider";
import MoneyInput from "@/components/ui/MoneyInput";
import { money } from "@/lib/format";
import { usualNet } from "@/lib/payslips/analysis";
import { isoPlanIndex, longDate, MONTH_NAMES, todayIso } from "@/lib/planner/calendar";
import { SLIDERS } from "@/lib/planner/config";
import { currentStep, sortedPay } from "@/lib/planner/projection";
import type { PayStep } from "@/lib/planner/types";
import { RemoveButton } from "./OneTimeList";

/** Plan months (with the day as a fraction) since October 2026; negative before. */
const at = (iso: string) => isoPlanIndex(iso) + (Number(iso.slice(8, 10)) - 1) / 31;

const W = 480;
const H = 118;
const PAD = { l: 6, r: 6, t: 22, b: 22 };

/** Take-home pay over time as steps: earlier pay muted, today's in green, upcoming dashed. */
function PayChart({ steps, current }: { steps: PayStep[]; current: PayStep }) {
  const today = at(todayIso());
  const x0 = Math.min(at(steps[0].date), today) - 1;
  const x1 = Math.max(at(steps[steps.length - 1].date) + 4, today + 6);
  const amounts = steps.map((p) => p.amount);
  const lo = Math.min(...amounts);
  const hi = Math.max(...amounts);
  const span = hi - lo || hi * 0.1 || 1;
  const y0 = lo - span * 0.6;
  const y1 = hi + span * 0.25;
  const X = (v: number) => PAD.l + ((v - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const Y = (v: number) => PAD.t + (1 - (v - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);

  // year ticks along the bottom
  const years: number[] = [];
  for (let m = Math.ceil(x0); m <= x1; m++) if ((m + 9) % 12 === 0) years.push(m);

  return (
    <svg className="ph-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Take-home pay over time: ${steps.map((p) => `${money(p.amount)} from ${longDate(p.date)}`).join(", ")}`}>
      {years.map((m) => (
        <g key={m}>
          <line x1={X(m)} x2={X(m)} y1={PAD.t - 6} y2={H - PAD.b} className="ph-grid" />
          <text x={X(m) + 3} y={H - 6} className="ph-axis">
            {2026 + (m + 9) / 12}
          </text>
        </g>
      ))}
      <line x1={X(today)} x2={X(today)} y1={PAD.t - 10} y2={H - PAD.b} className="ph-today" />
      <text x={X(today)} y={PAD.t - 13} textAnchor="middle" className="ph-axis">
        today
      </text>
      {steps.map((p, k) => {
        const from = X(at(p.date));
        const to = k < steps.length - 1 ? X(at(steps[k + 1].date)) : X(x1);
        const kind = p.id === current.id ? "now" : p.date > todayIso() ? "next" : "was";
        const prev = steps[k - 1];
        const label = `${money(p.amount)}${prev ? ` ${p.amount >= prev.amount ? "+" : "−"}${money(Math.abs(p.amount - prev.amount))}` : ""}`;
        return (
          <g key={p.id} className={`ph-${kind}`}>
            {prev && <line x1={from} x2={from} y1={Y(prev.amount)} y2={Y(p.amount)} className="ph-rise" />}
            <line x1={from} x2={to} y1={Y(p.amount)} y2={Y(p.amount)} className="ph-step" />
            <circle cx={from} cy={Y(p.amount)} r={4}>
              <title>{`${label} from ${longDate(p.date)}`}</title>
            </circle>
            {/* short steps put their label under the line so it clears the next step */}
            <text x={Math.min(from + 6, W - 90)} y={to - from < 90 ? Y(p.amount) + 15 : Y(p.amount) - 7} className="ph-val">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StepRow({ step, status, canRemove }: { step: PayStep; status: "now" | "was" | "next"; canRemove: boolean }) {
  const { updatePay, removePay } = usePlanner();
  return (
    <div className={`bd-row ot ph-row ${status}`}>
      <span className="ph-tag">{status === "now" ? "now" : status === "next" ? "upcoming" : "earlier"}</span>
      <input className="ot-date" type="date" value={step.date} aria-label="Starts on" onChange={(e) => e.target.value && updatePay(step.id, { date: e.target.value })} />
      <MoneyInput label={`Take-home pay from ${longDate(step.date)}`} value={step.amount} max={SLIDERS.net.max * 3} step={SLIDERS.net.step} onChange={(amount) => updatePay(step.id, { amount })} />
      {canRemove ? <RemoveButton name={`pay from ${longDate(step.date)}`} onClick={() => removePay(step.id)} /> : <span className="ot-x" aria-hidden="true" />}
    </div>
  );
}

/**
 * Take-home pay as a history: when pay changes you add the new amount and its date. Earlier paydays keep
 * the old pay, so the projection and the chart show both.
 */
export default function PayHistory() {
  const { state, setNumber, addPay } = usePlanner();
  const ref = useReferencePayslip();
  const payslipNet = usualNet(ref.data);
  const suggested = Math.round(payslipNet / SLIDERS.net.step) * SLIDERS.net.step;
  const steps = sortedPay(state.pay);
  const current = currentStep(state) ?? steps[0];
  const today = todayIso();
  const off = Math.abs(current.amount - payslipNet) >= SLIDERS.net.step;
  const d = new Date();
  const thisMonth = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

  const payslipHint = off ? (
    <>
      {ref.source} says {money(payslipNet, 2)} ·{" "}
      <button type="button" className="bd-link" onClick={() => setNumber("net", suggested)}>
        use {money(suggested)}
      </button>
    </>
  ) : (
    <>matches {ref.source}</>
  );

  return (
    <div className="ph">
      <div className="bd-row">
        <div className="bd-l">
          <b>
            <G>Take-home pay</G>
          </b>
          <small>
            every month{steps.length > 1 && ` · since ${longDate(current.date)}`} · {payslipHint}
          </small>
        </div>
        {steps.length === 1 ? (
          <MoneyInput label="Take-home pay" value={current.amount} max={SLIDERS.net.max * 3} step={SLIDERS.net.step} onChange={(v) => setNumber("net", v)} />
        ) : (
          <b className="ph-now">{money(current.amount)}</b>
        )}
      </div>

      {steps.length > 1 && (
        <>
          <PayChart steps={steps} current={current} />
          {[...steps].reverse().map((p) => (
            <StepRow key={p.id} step={p} status={p.id === current.id ? "now" : p.date > today ? "next" : "was"} canRemove />
          ))}
        </>
      )}

      <button className="ot-add" type="button" onClick={() => addPay()} title={`Starts today (${thisMonth}); change the date if it starts later`}>
        + New pay (raise or promotion)
      </button>
    </div>
  );
}
