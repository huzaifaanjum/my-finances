"use client";

import Card from "@/components/ui/Card";
import { KeyValue, Note } from "@/components/ui/text";
import { duration } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { simulateInvesting, type InvestmentPlan } from "@/lib/planner/finance";
import type { Plan } from "@/lib/planner/projection";

export default function FasterCard({ plan, invest }: { plan: Plan; invest: InvestmentPlan }) {
  const { ret, rais, target } = plan.state.numbers;
  const { start, monthly } = invest;
  const hit = invest.sim.hit;
  const options: [string, number | null][] = [
    ["Invest $250 more a month", simulateInvesting(start, monthly + 250, ret, rais, target).hit],
    ["Invest $500 more a month", simulateInvesting(start, monthly + 500, ret, rais, target).hit],
    ["Invest $1,000 more a month", simulateInvesting(start, monthly + 1000, ret, rais, target).hit],
    ["Earn 1% more a year (lower fees, more stocks)", simulateInvesting(start, monthly, ret + 1, rais, target).hit],
    ["Grow what you invest 2% faster each year", simulateInvesting(start, monthly, ret, rais + 2, target).hit],
    ["Add a one-time $10,000 now", simulateInvesting(start + 10000, monthly, ret, rais, target).hit],
  ];
  return (
    <Card title="Ways to get there sooner" description="One change at a time, compared with your current plan.">
      {options.map(([label, h]) => {
        const sooner = hit === null || h === null ? null : hit - h;
        return (
          <KeyValue
            key={label}
            label={label}
            className={sooner !== null && sooner > 0 ? "fs" : ""}
            value={h === null ? "still 50+ yrs" : sooner === null ? monthLabel(h) : sooner > 0 ? `${duration(sooner)} sooner` : "no change"}
          />
        );
      })}
      <Note style={{ marginTop: 10 }}>The first years matter most. Money invested early has the longest time to grow.</Note>
    </Card>
  );
}
