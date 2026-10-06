"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { CompareRow, Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import { project } from "@/lib/planner/projection";

const YEARS = [1, 2, 3, 4, 5];

export default function YearByYearCard() {
  const plan = usePlan();
  const rows = project(plan.state, 60, plan.left);
  const max = Math.max(1, rows[59].balance);
  return (
    <Card title="Year by year" description="Savings balance at each September, with what you added during the year.">
      {YEARS.map((y) => {
        const r = rows[12 * y - 1];
        const prev = y === 1 ? rows[0].balance : rows[12 * y - 13].balance;
        return (
          <CompareRow
            key={y}
            label={r.label}
            value={money(r.balance)}
            aside={`+${money(r.balance - prev)}`}
            bar={{ value: r.balance / max, color: "var(--std)" }}
          />
        );
      })}
      <Note>Assumes today&apos;s pay and spending stay the same and no raises.</Note>
    </Card>
  );
}
