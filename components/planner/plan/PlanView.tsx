"use client";

import { useMemo, useState } from "react";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { deltaMoney, money } from "@/lib/format";
import { buildPlan } from "@/lib/planner/projection";
import type { PlannerState } from "@/lib/planner/types";
import BudgetBar from "./BudgetBar";
import ExpensesEditor from "./ExpensesEditor";
import IncomeEditor from "./IncomeEditor";
import LeversCard from "./LeversCard";
import NeedsWantsBar from "./NeedsWantsBar";
import ProjectionPanel from "./ProjectionPanel";

/** The chart range is a view setting, not a change to the plan. */
const withHorizon = (s: PlannerState, horizon: number): PlannerState => ({ ...s, numbers: { ...s.numbers, horizon } });

/** Income and expenses on the left, a live projection on the right that compares against where you started. */
export default function PlanView() {
  const { state, plan, replaceState } = usePlanner();
  const [start, setStart] = useState(state);
  const horizon = state.numbers.horizon;

  const before = useMemo(() => buildPlan(withHorizon(start, horizon)), [start, horizon]);
  const changed = useMemo(() => JSON.stringify(withHorizon(start, horizon)) !== JSON.stringify(state), [start, horizon, state]);
  const diff = plan.last.balance - before.last.balance;

  return (
    <div className="planlay">
      <div className="pl-in">
        <BudgetBar />

        <section>
          <h2>Income</h2>
          <IncomeEditor />
        </section>

        <section>
          <h2>Expenses</h2>
          <NeedsWantsBar />
          <ExpensesEditor />
        </section>
      </div>

      <div className="pl-out">
        <ProjectionPanel
          plan={plan}
          before={before}
          changed={changed}
          onUndo={() => replaceState(withHorizon(start, horizon))}
          onKeep={() => setStart(state)}
        />
        <LeversCard start={start} />
      </div>

      <div className="pl-strip" aria-hidden="true">
        <span>Saved by {plan.last.label}</span>
        <b>{money(plan.last.balance)}</b>
        {changed && Math.round(diff) !== 0 && <em className={diff > 0 ? "up" : "down"}>{deltaMoney(diff)}</em>}
      </div>
    </div>
  );
}
