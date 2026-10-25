"use client";

import Link from "next/link";
import { useState } from "react";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { ProgressBar } from "@/components/ui/bars";
import { money, percent } from "@/lib/format";
import { templateOf } from "@/lib/planner/goalTemplates";
import { goalHref, summarizeGoal } from "@/lib/planner/goals";
import AddGoalDialog from "./AddGoalDialog";

/** Every saving goal as a card, and a button to add one from a template. */
export default function GoalsView() {
  const { plan, state } = usePlanner();
  const [adding, setAdding] = useState(false);
  const onTrack = state.goals.filter((g) => summarizeGoal(g, plan).onTrack).length;

  return (
    <div className="goal-wrap">
      <div className="goal-bar">
        <p>
          {state.goals.length ? (
            <>
              <b>{onTrack}</b> of {state.goals.length} goals on track. Home and car goals use all your savings; the others set aside a monthly amount.
            </>
          ) : (
            "No goals yet. Add one to see when you'll get there."
          )}
        </p>
        <button type="button" className="ps-btn primary" onClick={() => setAdding(true)}>
          + Add saving goal
        </button>
      </div>

      <div className="goal-grid">
        {state.goals.map((g) => {
          const s = summarizeGoal(g, plan);
          return (
            <Link key={g.id} href={goalHref(g)} className="goal-card">
              <div className="goal-h">
                <div>
                  {g.name && g.name !== templateOf(g.kind).name && <span className="goal-kind">{templateOf(g.kind).name}</span>}
                  <h2>{g.name || "Untitled goal"}</h2>
                </div>
                <span className={`goal-st ${s.onTrack ? "ok" : "no"}`}>{s.badge}</span>
              </div>
              <div className="goal-big">
                <span>{s.headlineLabel}</span>
                <b>{s.headline}</b>
              </div>
              <div className="goal-prog">
                <div>
                  <span>{g.kind === "house" || g.kind === "car" ? `${s.needLabel} ${money(s.need)}` : s.needLabel}</span>
                  <span>{percent(Math.max(0, Math.min(1, s.progress)))}</span>
                </div>
                <ProgressBar value={Math.max(0, s.progress)} color="var(--std)" />
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
        <button type="button" className="goal-card goal-new" onClick={() => setAdding(true)}>
          <b>+ Add saving goal</b>
          <span>Home, car, trip, wedding, ring, baby, moving, pet, course, laptop, emergency fund or anything else</span>
        </button>
      </div>

      {adding && <AddGoalDialog onClose={() => setAdding(false)} />}
    </div>
  );
}
