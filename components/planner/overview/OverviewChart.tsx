"use client";

import { useState } from "react";
import { HorizonSelect } from "@/components/planner/shared/controls";
import ProjectionChart from "@/components/planner/plan/ProjectionChart";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import CashBalanceChart from "./CashBalanceChart";

type View = "savings" | "cash";

/** One graph for the Overview: savings growing, or cash in chequing day by day. */
export default function OverviewChart() {
  const plan = usePlan();
  const [view, setView] = useState<View>("savings");
  return (
    <Card
      className="ov-chart"
      header={
        <div className="ps-head">
          <div>
            <h3>{view === "savings" ? "Your savings over time" : "Cash in chequing, day by day"}</h3>
            <p className="d">
              {view === "savings"
                ? "Balance at the end of each month, with pay, expenses and bonuses from your plan."
                : "Bills leave on the 1st, spending through the month, pay lands on the last banking day."}
            </p>
          </div>
          <div className="ps-row">
            <div className="ps-seg sm" role="group" aria-label="Graph">
              <button type="button" aria-pressed={view === "savings"} onClick={() => setView("savings")}>
                Savings
              </button>
              <button type="button" aria-pressed={view === "cash"} onClick={() => setView("cash")}>
                Cash
              </button>
            </div>
            <HorizonSelect className="ov-hz" />
          </div>
        </div>
      }
    >
      {view === "savings" ? <ProjectionChart rows={plan.rows} before={plan.rows} changed={false} /> : <CashBalanceChart plan={plan} compact />}
    </Card>
  );
}
