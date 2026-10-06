"use client";

import Card from "@/components/ui/Card";
import { ActionList, Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import type { Plan } from "@/lib/planner/projection";

export default function WhereCard({ plan }: { plan: Plan }) {
  const steps = [
    { title: "Safety net first", body: `Hold three months of costs (${money(plan.exp.total * 3)}) in a high-interest savings account. Do not invest money you might need soon.` },
    { title: "FHSA if you may buy a home", body: "Up to $8,000 a year, $40,000 lifetime. Deductible going in, tax-free coming out for a first home." },
    { title: "TFSA", body: "$7,000 of new room each year. Growth and withdrawals are tax-free, so it suits long-term investing." },
    { title: "RRSP", body: "Up to 18% of last year's income. Best when your tax rate is high; your refund can go straight back in." },
    { title: "Low-cost index funds", body: "An all-in-one index ETF holds thousands of companies for about 0.2% a year in fees. High fees quietly cost years." },
  ];
  return (
    <Card title="Where to put the money" description="A common order for Canadians. Each step uses tax-sheltered room before the next.">
      <ActionList items={steps} />
      <Note style={{ marginTop: 14 }}>
        Returns are not guaranteed. A stock-heavy portfolio has averaged roughly 6 to 8% a year over long periods but can fall 30% or more in a bad year. Stay
        invested through drops and keep your safety net in cash.
      </Note>
    </Card>
  );
}
