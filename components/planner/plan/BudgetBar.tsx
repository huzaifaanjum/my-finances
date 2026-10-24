"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { money, percent } from "@/lib/format";

/** Your month in one bar: take-home split into fixed costs, subscriptions, day-to-day spending and what is left. The 50/30/20 check sits under Expenses. */
export default function BudgetBar() {
  const { net, exp, left } = usePlan();
  const over = left < 0;
  const base = over ? exp.total : net || 1;
  const parts = [
    { label: "Fixed", value: exp.groups[0] ?? 0, color: "var(--scotia)" },
    { label: "Subscriptions", value: exp.groups[1] ?? 0, color: "var(--mix)" },
    { label: "Day-to-day", value: exp.groups[2] ?? 0, color: "var(--promo)" },
    { label: over ? "Over budget" : "Left over", value: Math.abs(left), color: over ? "var(--neg)" : "var(--std)" },
  ];
  return (
    <section className="bb">
      <div className="bb-h">
        <span>Each month</span>
        <b>
          {money(net)} <em>take-home</em>
        </b>
      </div>
      <div className="bb-bar" role="img" aria-label={parts.map((p) => `${p.label} ${money(p.value)}`).join(", ")}>
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <i key={p.label} style={{ width: `${(p.value / base) * 100}%`, background: p.color }} />
          ))}
      </div>
      <div className="bb-keys">
        {parts.map((p) => (
          <span key={p.label} className={p.label === "Left over" ? "lo" : p.label === "Over budget" ? "ob" : undefined}>
            <i style={{ background: p.color }} />
            {p.label} <b>{money(p.value)}</b> <em>{percent(p.value / (net || 1))}</em>
          </span>
        ))}
      </div>
    </section>
  );
}
