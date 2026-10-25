"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { ProgressBar } from "@/components/ui/bars";
import { money, percent } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { carPlan } from "@/lib/planner/car";
import { customGoalPlan, GOAL_TEMPLATES, GOALS, newGoal, readyLabel, type GoalId } from "@/lib/planner/goals";
import { longDate } from "@/lib/planner/calendar";
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

export function summarize(id: GoalId, plan: Plan): Summary {
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

/** One card per goal with the key numbers, then your own goals, then a card to add one from a template. */
export default function GoalsView() {
  const { plan, state, addGoal } = usePlanner();
  const router = useRouter();
  const saved = plan.startBalance;

  return (
    <div className="goal-wrap">
      <section className="goal-sec" aria-label="Home and car">
        <h2 className="goal-sh">
          Home and car <span>your savings, all going to one goal at a time</span>
        </h2>
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
                    <span>{percent(Math.max(0, Math.min(1, progress)))} saved</span>
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
      </section>

      <section className="goal-sec" aria-label="Your goals">
        <h2 className="goal-sh">
          Your goals <span>a set amount each month toward each one</span>
        </h2>
        <div className="goal-grid">
          {state.goals.map((g) => {
            const p = customGoalPlan(g, plan);
            const progress = g.target ? g.saved / g.target : 1;
            return (
              <Link key={g.id} href={`/goals/g${g.id}`} className="goal-card">
                <div className="goal-h">
                  <h2>{g.name || "Untitled goal"}</h2>
                  <span className={`goal-st ${p.onTrack ? "ok" : "no"}`}>{p.left === 0 ? "Done" : p.onTrack ? "On track" : "Behind"}</span>
                </div>
                <div className="goal-big">
                  <span>Target</span>
                  <b>{money(g.target)}</b>
                </div>
                <div className="goal-prog">
                  <div>
                    <span>{money(g.saved)} set aside</span>
                    <span>{percent(Math.min(1, progress))}</span>
                  </div>
                  <ProgressBar value={progress} color="var(--std)" />
                </div>
                <dl>
                  <div>
                    <dt>Wanted by</dt>
                    <dd>{longDate(g.date)}</dd>
                  </div>
                  <div>
                    <dt>Putting aside</dt>
                    <dd>{money(g.monthly)}/mo</dd>
                  </div>
                  <div>
                    <dt>Ready</dt>
                    <dd>{readyLabel(p.ready)}</dd>
                  </div>
                </dl>
                <div className="goal-ft">
                  <span>{p.onTrack || p.left === 0 ? "On time" : `${money(p.needMonthly)}/mo makes the date`}</span>
                  <span aria-hidden="true">Open →</span>
                </div>
              </Link>
            );
          })}

          <div className="goal-card goal-add">
            <div className="goal-h">
              <h2>Add a goal</h2>
            </div>
            <p>Pick a starting point; you can change the name, amount and date after.</p>
            <ul>
              {GOAL_TEMPLATES.map((t) => (
                <li key={t.kind}>
                  <button
                    type="button"
                    onClick={() => {
                      const id = addGoal(newGoal(t));
                      router.push(`/goals/g${id}`);
                    }}
                  >
                    <b>{t.name || "Something else"}</b>
                    <small>{t.kind === "custom" ? t.hint : `${money(t.target)} · ${t.hint}`}</small>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
