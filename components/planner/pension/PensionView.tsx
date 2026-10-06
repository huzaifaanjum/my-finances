"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { retirement } from "@/lib/planner/retirement";
import BreakdownCard from "./BreakdownCard";
import PensionKpis from "./PensionKpis";
import RetirementIncomeCard from "./RetirementIncomeCard";

export default function PensionView() {
  const plan = usePlan();
  const r = retirement(plan);
  const { ret_pr, ret_sg, ret_wr } = plan.state.numbers;
  return (
    <div className="mil">
      <PensionKpis r={r} fundReturn={ret_pr} />
      <BreakdownCard r={r} net={plan.net} fundReturn={ret_pr} />
      <RetirementIncomeCard r={r} net={plan.net} numbers={{ ret_sg, ret_wr }} />
    </div>
  );
}
