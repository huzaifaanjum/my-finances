"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { usePensionStart } from "@/components/payslips/usePensionStart";
import { retirement } from "@/lib/planner/retirement";
import SeeAlso from "@/components/ui/SeeAlso";
import BreakdownCard from "./BreakdownCard";
import PensionKpis from "./PensionKpis";
import RetirementIncomeCard from "./RetirementIncomeCard";

export default function PensionView() {
  const plan = usePlan();
  const start = usePensionStart();
  const r = retirement(plan, start);
  const { ret_pr, ret_sg, ret_wr } = plan.state.numbers;
  return (
    <div className="mil">
      <PensionKpis r={r} fundReturn={ret_pr} />
      <BreakdownCard r={r} net={plan.net} fundReturn={ret_pr} />
      <RetirementIncomeCard r={r} net={plan.net} numbers={{ ret_sg, ret_wr }} />
      <div className="seealso-row">
        <SeeAlso href="/payslips" label="Payslips">
          {`Contributions and salary come from ${start.source}; upload new payslips to keep this current`}
        </SeeAlso>
        <SeeAlso href="/insurance" label="Insurance">
          Name a beneficiary for the pension and life insurance, and see what disability cover pays if you can&apos;t work
        </SeeAlso>
      </div>
    </div>
  );
}
