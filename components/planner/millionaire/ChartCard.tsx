"use client";

import Card from "@/components/ui/Card";
import { Legend } from "@/components/ui/text";
import { money, percent } from "@/lib/format";
import type { InvestmentPlan } from "@/lib/planner/finance";
import type { Plan } from "@/lib/planner/projection";
import MillionaireChart from "./MillionaireChart";

const HORIZON = 600;

export default function ChartCard({ plan, invest }: { plan: Plan; invest: InvestmentPlan }) {
  const { target } = plan.state.numbers;
  const { hit, bal, inn } = invest.sim;
  const T = hit ?? HORIZON;
  return (
    <Card
      title={`The road to ${money(target)}`}
      description={
        hit === null
          ? "At this pace you do not reach the target within 50 years. Try a higher monthly amount."
          : `Blue is your own money; green is what the market adds on top. By year ${Math.ceil(hit / 12)} growth is doing ${percent((bal[T] - inn[T]) / bal[T])} of the work.`
      }
    >
      <MillionaireChart sim={invest.sim} target={target} />
      <Legend
        items={[
          { label: "What you put in", color: "var(--scotia)" },
          { label: "Growth from returns", color: "var(--std)" },
          { label: "Target", kind: "dash" },
          { label: "Milestone", kind: "dot", color: "var(--text)" },
        ]}
      />
    </Card>
  );
}
