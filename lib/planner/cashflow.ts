// The cash-flow ledger: for each month, money in, money out, what was saved, the tightest day,
// the balance and how many months of costs it covers. Month 0 (this month) is the starting point.

import { monthDate } from "./calendar";
import { bonusAt, type Plan } from "./projection";

export interface LedgerEvent {
  label: string;
  kind: "bonus" | "income" | "expense" | "milestone";
}

export interface LedgerRow {
  /** first plan month in the row */
  i: number;
  label: string;
  /** "2027", "Q1 2027", "Jan 2027" */
  period: string;
  start: boolean;
  /** take-home pay */
  pay: number;
  /** signing bonus, incentive and one-time income */
  extraIn: number;
  income: number;
  /** regular monthly expenses */
  expenses: number;
  /** one-time expenses */
  extraOut: number;
  spending: number;
  saved: number;
  /** saved / income */
  rate: number;
  /** lowest chequing balance on any day in the period */
  lowest: number;
  balance: number;
  change: number;
  /** months of expenses the balance covers */
  cover: number;
  /** the next milestone above the balance, and how far along you are */
  next: { name: string; target: number; progress: number } | null;
  events: LedgerEvent[];
}

export type Grouping = "month" | "quarter" | "year";

const MILESTONES = (exp: number): [string, number][] =>
  (
    [
      ["1 month of expenses", exp],
      ["3 months of expenses", exp * 3],
      ["$10k", 10_000],
      ["$25k", 25_000],
      ["$50k", 50_000],
      ["$100k", 100_000],
    ] as [string, number][]
  ).filter(([, v]) => v > 0);

/** One row per plan month. */
export function monthlyLedger(plan: Plan): LedgerRow[] {
  const { rows, exp, net, state, days } = plan;
  const lowByMonth = new Map<number, number>();
  for (const d of days) lowByMonth.set(d.i, Math.min(lowByMonth.get(d.i) ?? Infinity, d.bal));
  const items = (kind: "income" | "expense", i: number) => state.oneTime[kind].filter((o) => o.month === i);
  const milestones = MILESTONES(exp.total);

  return rows.map((r, k) => {
    const start = r.i === 0;
    const bonus = bonusAt(state, r.i);
    const oneIn = items("income", r.i).reduce((t, o) => t + o.amount, 0);
    const oneOut = items("expense", r.i).reduce((t, o) => t + o.amount, 0);
    const pay = start ? 0 : net;
    const extraIn = start ? 0 : bonus + oneIn;
    const expenses = start ? 0 : exp.total;
    const extraOut = oneOut;
    const prev = k === 0 ? r.balance - r.deposit : rows[k - 1].balance;

    const events: LedgerEvent[] = [];
    const month = monthDate(r.i).getMonth();
    for (const o of state.income)
      if (o.every === 12 && o.month === month && o.amount > 0) events.push({ label: o.name || "Yearly income", kind: "bonus" });
    for (const o of items("income", r.i))
      events.push({ label: o.tag === "signing" ? "Signing bonus" : o.name || "One-time income", kind: o.tag ? "bonus" : "income" });
    for (const o of items("expense", r.i)) events.push({ label: o.name || "One-time expense", kind: "expense" });
    for (const [name, v] of milestones) if (prev < v && r.balance >= v) events.push({ label: name, kind: "milestone" });

    const income = pay + extraIn;
    return {
      i: r.i,
      label: r.label,
      period: r.label,
      start,
      pay,
      extraIn,
      income,
      expenses,
      extraOut,
      spending: expenses + (start ? 0 : extraOut),
      saved: r.deposit,
      rate: income > 0 ? r.deposit / income : 0,
      lowest: lowByMonth.get(r.i) ?? r.balance,
      balance: r.balance,
      change: r.balance - prev,
      cover: exp.total ? r.balance / exp.total : 0,
      next: nextMilestone(milestones, r.balance),
      events,
    };
  });
}

function nextMilestone(list: [string, number][], balance: number): LedgerRow["next"] {
  const hit = [...list].sort((a, b) => a[1] - b[1]).find(([, v]) => v > balance);
  return hit ? { name: hit[0], target: hit[1], progress: Math.max(0, balance) / hit[1] } : null;
}

/** "Signing bonus", "Signing bonus" -> "Signing bonus ×2" */
function collapse(events: LedgerEvent[]): LedgerEvent[] {
  const seen = new Map<string, { e: LedgerEvent; n: number }>();
  for (const e of events) {
    const hit = seen.get(e.label);
    if (hit) hit.n++;
    else seen.set(e.label, { e, n: 1 });
  }
  return [...seen.values()].map(({ e, n }) => (n > 1 ? { ...e, label: `${e.label} ×${n}` } : e));
}

/** Months combined into quarters or years; sums for flows, the last balance, the lowest day. */
export function groupLedger(rows: LedgerRow[], by: Grouping, monthlyExpenses: number): LedgerRow[] {
  if (by === "month") return rows;
  const keyOf = (r: LedgerRow) => {
    const d = monthDate(r.i);
    return by === "year" ? `${d.getFullYear()}` : `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  };
  const groups = new Map<string, LedgerRow[]>();
  for (const r of rows) groups.set(keyOf(r), [...(groups.get(keyOf(r)) ?? []), r]);
  return [...groups.entries()].map(([key, g]) => {
    const sum = (f: (r: LedgerRow) => number) => g.reduce((t, r) => t + f(r), 0);
    const last = g[g.length - 1];
    const income = sum((r) => r.income);
    const saved = sum((r) => r.saved);
    const first = g[0];
    return {
      ...last,
      i: first.i,
      label: key,
      period: g.length > 1 ? `${first.label} – ${last.label}` : first.label,
      start: g.every((r) => r.start),
      pay: sum((r) => r.pay),
      extraIn: sum((r) => r.extraIn),
      income,
      expenses: sum((r) => r.expenses),
      extraOut: sum((r) => (r.start ? 0 : r.extraOut)),
      spending: sum((r) => r.spending),
      saved,
      rate: income > 0 ? saved / income : 0,
      lowest: Math.min(...g.map((r) => r.lowest)),
      change: last.balance - (first.balance - first.change),
      cover: monthlyExpenses ? last.balance / monthlyExpenses : 0,
      events: collapse(g.flatMap((r) => r.events)),
    };
  });
}

/** CSV of the ledger, for a spreadsheet. */
export function ledgerCsv(rows: LedgerRow[]): string {
  const head = ["Period", "Take-home", "Bonuses and one-time income", "Expenses", "One-time costs", "Saved", "Savings rate", "Lowest cash", "Balance", "Change", "Months covered", "Events"];
  const n = (v: number) => v.toFixed(2);
  const lines = rows.map((r) =>
    [r.label, n(r.pay), n(r.extraIn), n(r.expenses), n(r.extraOut), n(r.saved), `${Math.round(r.rate * 100)}%`, n(r.lowest), n(r.balance), n(r.change), Math.max(0, r.cover).toFixed(1), r.events.map((e) => e.label).join("; ")]
      .map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c))
      .join(","),
  );
  return [head.join(","), ...lines].join("\n");
}
