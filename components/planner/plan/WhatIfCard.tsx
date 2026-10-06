"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { CompareRow } from "@/components/ui/text";
import { deltaMoney, money } from "@/lib/format";
import { project } from "@/lib/planner/projection";

const SCENARIOS: [label: string, change: number][] = [
  ["Current plan", 0],
  ["Spend $200 less a month", 200],
  ["Spend $200 more a month", -200],
  ["Take-home up $500 (raise)", 500],
  ["Take-home up $1,000 (raise)", 1000],
];

/** Savings at the end of the horizon if one thing changes. */
export default function WhatIfCard() {
  const plan = usePlan();
  const endBalance = (change: number) => project(plan.state, plan.months, plan.left + change)[plan.months - 1].balance;
  const results = SCENARIOS.map(([label, change]) => ({ label, value: endBalance(change) }));
  const base = results[0].value;
  const scale = Math.max(1, ...results.map((r) => Math.abs(r.value)));

  return (
    <Card title="What if?" description={`Savings by ${plan.last.label} if one thing changes and nothing else does.`}>
      {results.map((r, i) => {
        const diff = r.value - base;
        return (
          <CompareRow
            key={r.label}
            current={i === 0}
            label={r.label}
            value={money(r.value)}
            aside={i ? deltaMoney(diff) : "base"}
            asideColor={diff > 0 ? "var(--std)" : diff < 0 ? "var(--neg)" : "var(--mute)"}
            bar={{ value: Math.max(0, r.value) / scale, color: i ? (r.value >= base ? "var(--scotia)" : "var(--promo)") : "var(--std)" }}
          />
        );
      })}
    </Card>
  );
}
