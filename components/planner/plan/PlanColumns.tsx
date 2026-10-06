import { PlannerCheckbox, PlannerSlider } from "@/components/planner/shared/controls";
import ExpensesEditor from "./ExpensesEditor";
import GoalsCard from "./GoalsCard";
import KeyDatesCard from "./KeyDatesCard";
import OneTimeList from "./OneTimeList";
import { PayPackageCard, PayStubCard } from "./PayCards";
import WhatIfCard from "./WhatIfCard";
import YearByYearCard from "./YearByYearCard";

/** Three-column editor: income, one-time money and goals, expenses. */
export default function PlanColumns() {
  return (
    <div className="layout">
      <div className="ca">
        <h3>Income</h3>
        <div className="stack">
          <PlannerSlider k="net" />
          <PlannerSlider k="start" />
          <PayStubCard />
          <PayPackageCard />
        </div>
      </div>

      <div className="cb">
        <h3>One-time payments</h3>
        <div className="stack">
          <PlannerSlider k="lump" />
          <PlannerSlider k="sign" />
          <PlannerSlider k="aipAmt" />
          <PlannerCheckbox k="aip" label="Include the annual incentive bonus" />
          <OneTimeList kind="income" />
          <GoalsCard />
        </div>
      </div>

      <div className="cc">
        <h3>Expenses</h3>
        <div className="exp-col">
          <ExpensesEditor />
          <OneTimeList kind="expense" />
          <KeyDatesCard />
          <WhatIfCard />
          <YearByYearCard />
        </div>
      </div>
    </div>
  );
}
