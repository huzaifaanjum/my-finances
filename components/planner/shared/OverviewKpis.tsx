"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { money, percent } from "@/lib/format";
import { dayLabel } from "@/lib/planner/calendar";
import { savingsMilestones } from "@/lib/planner/milestones";

/** Headline numbers shown on the Overview and Plan pages. */
export default function OverviewKpis() {
  const plan = usePlan();
  const { last, left, rate, eta, seed, bonusTotal } = plan;
  const next = savingsMilestones(plan).find((m) => plan.startBalance < m.amount);
  const added = last.balance - seed;

  return (
    <KpiGrid>
      <Kpi label={`Saved by ${last.label}`} value={money(last.balance)} note={`${money(Math.max(0, added))} added over ${plan.horizonLabel}`} tone="hero" />
      <Kpi
        label="Savings rate"
        value={percent(rate)}
        note="of take-home · guideline 20%"
        tone={left < 0 ? "neg" : rate >= 0.2 ? "pos" : "warn"}
      />
      <Kpi label="Emergency fund" value={eta(plan.exp.total)} note={`1 month · 3 months: ${eta(plan.exp.total * 3)}`} />
      <Kpi label="Next milestone" value={next ? next.name : "All reached"} note={next ? `Expected ${eta(next.amount)}` : "Nice work"} />
      <Kpi
        label="Bonuses and one-time money"
        value={money(bonusTotal)}
        note={added > 0 ? `${percent(bonusTotal / added)} of what you add by ${last.label}` : "None in this period"}
      />
      <Kpi label="Lowest balance" value={money(plan.low.bal)} note={`on ${dayLabel(plan.lowDate)}`} tone={plan.low.bal < 0 ? "neg" : ""} />
    </KpiGrid>
  );
}
