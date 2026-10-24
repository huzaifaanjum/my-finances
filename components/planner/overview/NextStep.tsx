"use client";

import { nextActions } from "@/components/planner/insights/NextActionsCard";
import { usePlan } from "@/components/providers/PlannerProvider";
import SeeAlso from "@/components/ui/SeeAlso";

/** The single most valuable step right now; the rest live on the Recommendations tab. */
export default function NextStep() {
  const top = nextActions(usePlan())[0];
  return (
    <div className="ov-next">
      <SeeAlso href="/recommendations" label="All recommendations">
        {top ? (
          <>
            <em>Top next step</em> {top.title}
          </>
        ) : (
          "Your next steps, where to put your money, and your checklist"
        )}
      </SeeAlso>
    </div>
  );
}
