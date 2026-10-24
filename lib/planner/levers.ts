// "Biggest levers": the changes to your own spending lines that would add the most to your savings.
// Fixed bills are left out; only wants and day-to-day spending are suggested.

import { money } from "@/lib/format";
import type { PlannerState } from "./types";

export interface LeverChange {
  /** expense id */
  id: string;
  from: number;
  to: number;
}

export interface Lever {
  id: string;
  title: string;
  /** what it saves each month */
  monthly: number;
  changes: LeverChange[];
}

const round = (v: number, step: number) => Math.round(v / step) * step;
const listNames = (names: string[]) => (names.length <= 3 ? names.join(", ") : `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`);

/** Up to `max` levers, biggest first, from the lines in `s`. */
export function findLevers(s: PlannerState, max = 5): Lever[] {
  const out: Lever[] = [];
  const lines = s.expenses.filter((e) => e.amount > 0);

  // subscriptions you marked as wants, together
  const subs = lines.filter((e) => e.group === 1 && !e.need);
  if (subs.length) {
    out.push({
      id: "subs",
      title: `Cancel the subscriptions you marked “want” (${listNames(subs.map((e) => e.name || "untitled"))})`,
      monthly: subs.reduce((t, e) => t + e.amount / e.every, 0),
      changes: subs.map((e) => ({ id: e.id, from: e.amount, to: 0 })),
    });
  }

  for (const e of lines.filter((x) => x.group === 2)) {
    const monthly = e.amount / e.every;
    if (!e.need && monthly >= 40) {
      const to = round(e.amount / 2, 5);
      out.push({ id: `half-${e.id}`, title: `Halve ${e.name.toLowerCase() || "this line"}: ${money(e.amount)} → ${money(to)}`, monthly: (e.amount - to) / e.every, changes: [{ id: e.id, from: e.amount, to }] });
    } else if (e.need && monthly >= 300) {
      const to = round(e.amount * 0.85, 10);
      out.push({ id: `trim-${e.id}`, title: `Trim ${e.name.toLowerCase() || "this line"} by 15%: ${money(e.amount)} → ${money(to)}`, monthly: (e.amount - to) / e.every, changes: [{ id: e.id, from: e.amount, to }] });
    }
  }

  return out.filter((l) => l.monthly >= 5).sort((a, b) => b.monthly - a.monthly).slice(0, max);
}

/** `s` with each line set to `to` (or back to `from`). Lines you have since removed are skipped. */
export function withLever(s: PlannerState, lever: Lever, on: boolean): PlannerState {
  const target = new Map(lever.changes.map((c) => [c.id, on ? c.to : c.from]));
  return { ...s, expenses: s.expenses.map((e) => (target.has(e.id) ? { ...e, amount: target.get(e.id)! } : e)) };
}

/** True when every line is already at or below the lever's amount. */
export const leverApplied = (s: PlannerState, lever: Lever) =>
  lever.changes.every((c) => {
    const e = s.expenses.find((x) => x.id === c.id);
    return !e || e.amount <= c.to;
  });
