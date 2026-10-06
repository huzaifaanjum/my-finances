"use client";

import { HorizonSelect } from "@/components/planner/shared/controls";
import { deltaMoney, money, percent, signedMoney } from "@/lib/format";
import type { Plan } from "@/lib/planner/projection";
import ProjectionChart from "./ProjectionChart";

/** One headline number with how far it moved since the page opened. */
function Tile({ label, value, delta, note }: { label: string; value: string; delta?: number; note?: string }) {
  const d = delta === undefined ? 0 : Math.round(delta);
  return (
    <div className="pj-tile">
      <span>{label}</span>
      <b>{value}</b>
      {d !== 0 ? <em className={d > 0 ? "up" : "down"}>{deltaMoney(d)}</em> : note && <em>{note}</em>}
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

/** Live projection that follows every slider on the page. */
export default function ProjectionPanel({ plan, before, changed, onUndo, onKeep }: Props) {
  const fiveYears = plan.far[59].balance;
  const emergency = plan.eta(plan.exp.total * 3);
  const emergencyWas = before.eta(before.exp.total * 3);
  const hundredK = plan.eta(100_000);
  const hundredKWas = before.eta(100_000);

  return (
    <section className="pj" aria-live="polite">
      <div className="tabs">
        <h2>Your projection</h2>
        <HorizonSelect />
      </div>

      <div className="pj-tiles">
        <Tile label="Left over each month" value={signedMoney(plan.left)} delta={plan.left - before.left} note={`${percent(plan.rate)} of take-home`} />
        <Tile label={`Saved by ${plan.last.label}`} value={money(plan.last.balance)} delta={plan.last.balance - before.last.balance} />
        <Tile label="Saved in 5 years" value={money(fiveYears)} delta={fiveYears - before.far[59].balance} note="no raises, no returns" />
        <Tile label="3-month emergency fund" value={emergency} note={etaChange(emergency, emergencyWas)} />
        <Tile label="First $100k" value={hundredK} note={etaChange(hundredK, hundredKWas)} />
        <Tile
          label="Lowest balance"
          value={money(plan.low.bal)}
          delta={plan.low.bal - before.low.bal}
          note={plan.low.bal < 0 ? "you would overdraw" : undefined}
        />
      </div>

      <ProjectionChart rows={plan.rows} before={before.rows} changed={changed} />

      <div className="pj-act">
        <span>{changed ? "Compared with the plan you opened this page with." : "Move any slider and the projection updates here."}</span>
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
