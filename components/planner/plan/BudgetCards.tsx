"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { money, percent } from "@/lib/format";

/** Your month in three numbers: what comes in, what goes out, and what you keep. The bar below breaks them down. */
export default function BudgetCards() {
  const { net, exp, left } = usePlan();
  const base = net || 1;
  const rate = left / base;
  const tone = left < 0 ? "neg" : rate >= 0.2 ? "pos" : "warn";
  return (
    <section className="bc" aria-label="This month">
      <article className="bc-card">
        <span>Income</span>
        <b>{money(net)}</b>
        <em>a month</em>
      </article>
      <article className="bc-card">
        <span>Expenses</span>
        <b>{money(exp.total)}</b>
        <em>{percent(exp.total / base)} of pay</em>
      </article>
      <article className={`bc-card ${tone}`}>
        <span>Savings</span>
        <b>{left < 0 ? `−${money(-left)}` : money(left)}</b>
        <em>{left < 0 ? "over budget" : `${percent(rate)} of pay`}</em>
      </article>
    </section>
  );
}
