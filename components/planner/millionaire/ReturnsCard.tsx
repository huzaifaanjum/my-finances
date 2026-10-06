"use client";

import Card from "@/components/ui/Card";
import { CompareRow, Note } from "@/components/ui/text";
import { duration } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { simulateInvesting, type InvestmentPlan } from "@/lib/planner/finance";
import type { Plan } from "@/lib/planner/projection";

const HORIZON = 600;

export default function ReturnsCard({ plan, invest }: { plan: Plan; invest: InvestmentPlan }) {
  const { ret, rais, target } = plan.state.numbers;
  const rates = [...new Set([0, 4, 6, 8, 10, ret])].sort((a, b) => a - b);
  const results = rates.map((r) => ({ r, hit: simulateInvesting(invest.start, invest.monthly, r, rais, target).hit }));
  const longest = Math.max(...results.map((x) => x.hit ?? HORIZON));
  return (
    <Card title="How the return changes the timeline" description="Same monthly investment at different yearly returns. Yours is highlighted.">
      {results.map(({ r, hit }) => (
        <CompareRow
          key={r}
          current={r === ret}
          label={`${r}% a year`}
          value={hit === null ? "50+ yrs" : duration(hit)}
          aside={hit === null ? "–" : monthLabel(hit)}
          bar={{ value: (hit ?? HORIZON) / longest, color: r === ret ? "var(--std)" : "var(--scotia)" }}
        />
      ))}
      <Note>Shorter bars are better. 0% is like keeping it all in a regular savings account.</Note>
    </Card>
  );
}
