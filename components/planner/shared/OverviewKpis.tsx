"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { money, percent } from "@/lib/format";
import { dayLabel } from "@/lib/planner/calendar";
import { savingsMilestones } from "@/lib/planner/milestones";

/** The five numbers that matter most, at the top of the Overview. */
export default function OverviewKpis() {
  const plan = usePlan();
  const { last, left, rate, net, eta, seed, exp } = plan;
  const next = savingsMilestones(plan).find((m) => plan.startBalance < m.amount);
  const added = last.balance - seed;

  return (
    <KpiGrid>
      <Kpi label={`Saved by ${last.label}`} value={money(last.balance)} note={`${money(Math.max(0, added))} added over ${plan.horizonLabel}`} tone="hero" />
      <Kpi
        label="Left over each month"
        value={money(left)}
        note={`${percent(rate)} of your ${money(net)} take-home · guideline 20%`}
        tone={left < 0 ? "neg" : rate >= 0.2 ? "pos" : "warn"}
        tip="Take-home pay minus all monthly expenses: what you can save each month before bonuses."
      />
      <Kpi label="Lowest balance" value={money(plan.low.bal)} note={`on ${dayLabel(plan.lowDate)}`} tone={plan.low.bal < 0 ? "neg" : ""} />
      <Kpi label="Emergency fund" value={eta(exp.total)} note={`1 month covered · 3 months: ${eta(exp.total * 3)}`} />
      <Kpi label="Next milestone" value={next ? next.name : "All reached"} note={next ? `Expected ${eta(next.amount)}` : "Nice work"} />
    </KpiGrid>
  );
}
