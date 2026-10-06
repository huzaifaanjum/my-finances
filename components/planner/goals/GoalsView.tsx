"use client";

import Link from "next/link";
import { usePlan } from "@/components/providers/PlannerProvider";
import { ProgressBar } from "@/components/ui/bars";
import { money, percent } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { carPlan } from "@/lib/planner/car";
import { GOALS, type GoalId } from "@/lib/planner/goals";
import { housePlan } from "@/lib/planner/house";
import type { Plan } from "@/lib/planner/projection";

interface Summary {
  headline: string;
  headlineLabel: string;
  /** what your savings need to cover */
  need: number;
  needLabel: string;
  facts: [string, string][];
  /** ready by the month you plan to buy */
  onTrack: boolean;
  status: string;
}

const when = (m: number) => (m === 0 ? "now" : monthLabel(m));

function summarize(id: GoalId, plan: Plan): Summary {
  if (id === "house") {
    const h = housePlan(plan);
    return {
      headline: money(h.price),
      headlineLabel: "Home price",
      need: h.cash,
      needLabel: "Cash needed",
      facts: [
        ["Down payment", `${money(h.down)} · ${h.dppPct}%`],
        ["Mortgage payment", `${money(h.loan.payment)}/mo`],
        ["Savings ready", h.ready < 0 ? "Not within 20 years" : when(h.ready)],
      ],
      onTrack: h.savedAtBuy >= h.cash,
      status: `Buying ${when(h.buy)}`,
    };
  }
  const c = carPlan(plan);
  return {
    headline: money(c.price + c.tax),
    headlineLabel: "Car price with tax",
    need: c.down,
    needLabel: "Down payment",
    facts: [
      ["Loan payment", `${money(c.regular.payment)}/mo`],
      ["Interest", money(c.regular.interest)],
      ["Savings ready", c.downReady ? c.downReady.label : "Not within 20 years"],
    ],
    onTrack: c.savedAtBuy >= c.down,
    status: `Buying ${when(c.buy)}`,
  };
}

/** One card per goal with the key numbers. Each opens the goal's own page. */
export default function GoalsView() {
  const plan = usePlan();
  const saved = plan.startBalance;
  return (
    <div className="goal-grid">
      {GOALS.map((g) => {
        const s = summarize(g.id, plan);
        const progress = s.need ? saved / s.need : 1;
        return (
          <Link key={g.id} href={`/goals/${g.id}`} className="goal-card">
            <div className="goal-h">
              <h2>{g.name}</h2>
              <span className={`goal-st ${s.onTrack ? "ok" : "no"}`}>{s.onTrack ? "On track" : "Short at buy date"}</span>
            </div>
            <div className="goal-big">
              <span>{s.headlineLabel}</span>
              <b>{s.headline}</b>
            </div>
            <div className="goal-prog">
              <div>
                <span>
                  {s.needLabel} {money(s.need)}
                </span>
                <span>{percent(Math.min(1, progress))} saved</span>
              </div>
              <ProgressBar value={progress} color="var(--std)" />
            </div>
            <dl>
              {s.facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="goal-ft">
              <span>{s.status}</span>
              <span aria-hidden="true">Open →</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
