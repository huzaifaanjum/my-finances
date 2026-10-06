"use client";

import { useMemo, useState } from "react";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { PlannerCheckbox, PlannerSlider } from "@/components/planner/shared/controls";
import { deltaMoney, money } from "@/lib/format";
import { buildPlan } from "@/lib/planner/projection";
import type { PlannerState } from "@/lib/planner/types";
import ExpensesEditor from "./ExpensesEditor";
import OneTimeList from "./OneTimeList";
import ProjectionPanel from "./ProjectionPanel";
import WhatIfCard from "./WhatIfCard";
import YearByYearCard from "./YearByYearCard";

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
        <section>
          <h2>Income</h2>
          <div className="stack">
            <PlannerSlider k="net" />
            <PlannerSlider k="start" />
            <PlannerSlider k="lump" />
            <PlannerSlider k="sign" />
            <PlannerSlider k="aipAmt" />
            <PlannerCheckbox k="aip" label="Include the annual incentive bonus" />
            <OneTimeList kind="income" />
          </div>
        </section>

        <section className="exp-col">
          <h2>Expenses</h2>
          <ExpensesEditor />
          <OneTimeList kind="expense" />
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
        <WhatIfCard />
        <YearByYearCard />
      </div>

      <div className="pl-strip" aria-hidden="true">
        <span>Saved by {plan.last.label}</span>
        <b>{money(plan.last.balance)}</b>
        {changed && Math.round(diff) !== 0 && <em className={diff > 0 ? "up" : "down"}>{deltaMoney(diff)}</em>}
      </div>
    </div>
  );
}
