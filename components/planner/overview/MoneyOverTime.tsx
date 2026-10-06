"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { HorizonSelect } from "@/components/planner/shared/controls";
import { Panel } from "@/components/ui/text";
import CashBalanceChart from "./CashBalanceChart";
import SavingsBarsChart from "./SavingsBarsChart";

export default function MoneyOverTime() {
  const plan = usePlan();
  return (
    <Panel className="flush">
      <div className="tabs">
        <h2>Your money over time</h2>
        <HorizonSelect />
      </div>
      <div className="charts">
        <CashBalanceChart plan={plan} />
        <SavingsBarsChart rows={plan.rows} />
      </div>
    </Panel>
  );
}
