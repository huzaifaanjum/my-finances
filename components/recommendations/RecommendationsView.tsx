"use client";

import NextActionsCard from "@/components/planner/insights/NextActionsCard";
import { TaxRoomCard } from "@/components/planner/insights/SpendingCards";
import WhereCard from "@/components/planner/millionaire/WhereCard";
import KeyDatesCard from "@/components/planner/plan/KeyDatesCard";
import { usePlan } from "@/components/providers/PlannerProvider";
import { SectionHeading } from "@/components/ui/text";
import Checklist from "./Checklist";

/** Every recommendation in the app, in one place: what to do now, where the money goes, and a checklist. */
export default function RecommendationsView() {
  const plan = usePlan();
  return (
    <div className="rec">
      <section className="rec-sec">
        <SectionHeading title="Do next">The steps worth most to you right now, worked out from your plan, and the dates coming up.</SectionHeading>
        <div className="irow">
          <NextActionsCard />
          <KeyDatesCard />
        </div>
      </section>

      <section className="rec-sec">
        <SectionHeading title="Where to put your money">
          The order to fill accounts in, and how much tax-sheltered room your savings would use.
        </SectionHeading>
        <div className="irow">
          <WhereCard plan={plan} />
          <TaxRoomCard />
        </div>
      </section>

      <Checklist />
    </div>
  );
}
