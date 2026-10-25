"use client";

import { HorizonSelect } from "@/components/planner/shared/controls";
import { deltaMoney, money } from "@/lib/format";
import type { Plan } from "@/lib/planner/projection";
import ProjectionChart from "./ProjectionChart";

/** A milestone in the strip under the chart: what, when or how much, and how it moved since the page opened. */
function Mark({ label, value, change, tone }: { label: string; value: string; change?: string; tone?: "warn" | "neg" | "pos" }) {
  return (
    <div className={`pj-m ${tone ?? ""}`}>
      <span>{label}</span>
      <b>{value}</b>
      {change && <em className={change.startsWith("+") ? "up" : change.startsWith("−") || change.startsWith("-") ? "down" : undefined}>{change}</em>}
    </div>
  );
}

/** "was Jun 2028" when a goal date moved, nothing when it did not. */
function etaChange(now: string, was: string): string | undefined {
  return now === was ? undefined : `was ${was}`;
}

interface Props {
  plan: Plan;
  /** the plan as it was when you opened the page (or last kept) */
  before: Plan;
  changed: boolean;
  onUndo: () => void;
  onKeep: () => void;
}

/** Live projection that follows every amount on the page. */
export default function ProjectionPanel({ plan, before, changed, onUndo, onKeep }: Props) {
  const fiveYears = plan.far[59].balance;
  const emergency = plan.eta(plan.exp.total * 3);
  const emergencyWas = before.eta(before.exp.total * 3);
  const hundredK = plan.eta(100_000);
  const hundredKWas = before.eta(100_000);

  // where the end balance comes from: what you start with, pay left over, and bonuses or one-time money
  const first = plan.rows[0];
  const start = first.balance - first.deposit;
  const fromPay = plan.rows.reduce((t, r) => t + r.base, 0);
  const extra = plan.rows.reduce((t, r) => t + r.extra, 0);
  const endDelta = Math.round(plan.last.balance - before.last.balance);
  const delta = (v: number) => (Math.round(v) ? deltaMoney(v) : undefined);

  return (
    <section className="pj" aria-live="polite">
      <div className="tabs">
        <h2>Your projection</h2>
        <HorizonSelect />
      </div>

      <div className="pj-hero">
        <span>Saved by {plan.last.label}</span>
        <div>
          <b className={plan.last.balance < 0 ? "neg" : undefined}>{money(plan.last.balance)}</b>
          {changed && endDelta !== 0 && <em className={endDelta > 0 ? "up" : "down"}>{deltaMoney(endDelta)} vs before</em>}
        </div>
        <p>
          You start at <strong>{money(start)}</strong>, add <strong>{money(fromPay)}</strong> from pay over {plan.rows.length - 1} months
          {Math.abs(extra) >= 1 && (
            <>
              {" "}
              and <strong>{extra >= 0 ? money(extra) : `−${money(-extra)}`}</strong> from bonuses and one-time money
            </>
          )}
          . No investment growth is counted.
        </p>
      </div>

      <ProjectionChart rows={plan.rows} before={before.rows} changed={changed} />

      <div className="pj-marks">
        <Mark
          label="Lowest balance"
          value={money(plan.low.bal)}
          change={delta(plan.low.bal - before.low.bal) ?? (plan.low.bal < 0 ? "you'd overdraw" : undefined)}
          tone={plan.low.bal < 0 ? "neg" : plan.low.bal < 500 ? "warn" : undefined}
        />
        <Mark label="3 months of costs saved" value={emergency} change={etaChange(emergency, emergencyWas)} />
        <Mark label="First $100k" value={hundredK} change={etaChange(hundredK, hundredKWas)} />
        <Mark label="In 5 years" value={money(fiveYears)} change={delta(fiveYears - before.far[59].balance) ?? "no raises or returns"} />
      </div>

      <div className="pj-act">
        <span>{changed ? "The dashed line is the plan you opened this page with." : "Change any amount on the left and this updates."}</span>
        {changed && (
          <>
            <button type="button" className="add" onClick={onUndo}>
              Undo my changes
            </button>
            <button type="button" className="add" onClick={onKeep}>
              Keep as the new starting point
            </button>
          </>
        )}
      </div>
    </section>
  );
}
