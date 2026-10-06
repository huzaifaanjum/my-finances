"use client";

import { PlannerCheckbox, PlannerSlider } from "@/components/planner/shared/controls";
import Card from "@/components/ui/Card";
import { GroupHeader, KeyValue } from "@/components/ui/text";
import { money } from "@/lib/format";
import type { InvestmentPlan } from "@/lib/planner/finance";
import type { Plan } from "@/lib/planner/projection";

export default function PlanCard({ plan, invest }: { plan: Plan; invest: InvestmentPlan }) {
  return (
    <Card title="Your plan" description="Target, return and raises are shared with the Goals card on the Plan page.">
      <PlannerSlider k="target" label="Target" />
      <PlannerSlider k="ret" label="Yearly investment return" />
      <PlannerSlider k="rais" label="Yearly increase in what you invest" />
      <PlannerSlider k="mil_extra" />
      <PlannerCheckbox k="mil_rs" label="Add my income streams from Insights" variant="inline" />
      <GroupHeader label="Monthly investment" value={money(invest.monthly)} style={{ marginTop: 20 }} />
      <KeyValue label="Surplus from your plan" value={money(Math.max(0, plan.left))} />
      <KeyValue label="Extra you add" value={money(plan.state.numbers.mil_extra)} />
      <KeyValue
        label={<>Income streams from Insights{!plan.state.flags.mil_rs && <em> · off</em>}</>}
        value={money(invest.streams)}
      />
      <KeyValue label="Starting balance" value={money(invest.start)} />
    </Card>
  );
}
