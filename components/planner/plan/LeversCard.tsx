"use client";

import { useMemo } from "react";
import { usePlanner } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { money } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import { findLevers, leverApplied, withLever } from "@/lib/planner/levers";
import { buildPlan } from "@/lib/planner/projection";
import type { PlannerState } from "@/lib/planner/types";

const sooner = (was: number, now: number) => {
  if (was < 0 && now >= 0) return `reached ${monthLabel(now)}`;
  if (now < 0 || was < 0 || was === now) return null;
  const n = Math.abs(was - now);
  return `${monthLabel(now)}, ${n} month${n === 1 ? "" : "s"} ${now < was ? "sooner" : "later"}`;
};

/**
 * The changes to your own spending that would add the most by the end of the range. Levers come from the
 * plan you opened the page with, so they stay put while you try them.
 */
export default function LeversCard({ start }: { start: PlannerState }) {
  const { state, plan, replaceState } = usePlanner();
  const levers = useMemo(() => findLevers(start), [start]);

  const rows = useMemo(
    () =>
      levers.map((l) => {
        const on = buildPlan(withLever(state, l, true));
        const off = buildPlan(withLever(state, l, false));
        return {
          lever: l,
          applied: leverApplied(state, l),
          gain: on.last.balance - off.last.balance,
          fund: sooner(off.reachIndex(off.exp.total * 3), on.reachIndex(on.exp.total * 3)),
          low: on.low.bal - off.low.bal,
        };
      }),
    [levers, state],
  );
  const scale = Math.max(1, ...rows.map((r) => r.gain));

  if (!rows.length) return null;
  return (
    <Card title="Biggest levers" description={`Changes to your own spending that would add the most by ${plan.last.label}. Try one and the projection shows it against the dashed line.`}>
      <ol className="lv">
        {rows.map(({ lever, applied, gain, fund, low }) => (
          <li key={lever.id} className={applied ? "on" : undefined}>
            <div className="lv-main">
              <b>{lever.title}</b>
              <small>
                {money(lever.monthly)} a month
                {fund && ` · 3-month emergency fund ${fund}`}
                {low >= 1 && ` · lowest balance +${money(low)}`}
              </small>
              <span className="lv-bar" aria-hidden="true">
                <i style={{ width: `${(gain / scale) * 100}%` }} />
              </span>
            </div>
            <div className="lv-gain">
              <b>+{money(gain)}</b>
              <small>by {plan.last.label}</small>
            </div>
            <button type="button" className="lv-btn" onClick={() => replaceState(withLever(state, lever, !applied))} aria-pressed={applied}>
              {applied ? "Put back" : "Try it"}
            </button>
          </li>
        ))}
      </ol>
    </Card>
  );
}
