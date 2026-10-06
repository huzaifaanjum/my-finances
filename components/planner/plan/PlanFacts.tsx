"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { money, signedMoney } from "@/lib/format";

/** Live one-line budget under the Plan title: what comes in, what goes out, what is left. */
export default function PlanFacts() {
  const plan = usePlan();
  const facts = [
    { k: "Take-home", v: money(plan.net) },
    { k: "Expenses", v: money(plan.exp.total) },
    { k: "Left over", v: signedMoney(plan.left), tone: plan.left < 0 ? "neg" : "pos" },
    { k: "Starting savings", v: money(plan.seed) },
  ];
  return (
    <dl className="facts">
      {facts.map((f) => (
        <div key={f.k} className={f.tone}>
          <dt>{f.k}</dt>
          <dd>
            {f.v}
            {f.k !== "Starting savings" && <small>/mo</small>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
