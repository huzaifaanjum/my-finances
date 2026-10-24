import { horizonLabel } from "./config";
import { daysInPlanMonth, monthDate, monthLabel, planDay } from "./calendar";
import { ONE_TIME_MONTHS } from "./defaults";
import type { DayPoint, IncomeTag, MonthRow, OneTimeItem, PlannerState, RecurringExpense } from "./types";

export interface Category {
  /** built-in lines keep ids like "rent"; ones you add get new ids */
  id: string;
  name: string;
  monthly: number;
  group: number;
  need: boolean;
}

export interface ExpenseSummary {
  total: number;
  /** monthly total per group: fixed, subscriptions, variable */
  groups: number[];
  /** fixed + subscriptions, paid on the 1st */
  fixed: number;
  /** variable spending, spread over the month */
  variable: number;
  categories: Category[];
}

export const GROUP_COUNT = 3;

export function summarizeExpenses(expenses: RecurringExpense[]): ExpenseSummary {
  const groups = Array.from({ length: GROUP_COUNT }, () => 0);
  const categories: Category[] = expenses.map((e) => {
    const monthly = e.amount / (e.every || 1);
    groups[e.group] += monthly;
    return { id: e.id, name: e.name, monthly, group: e.group, need: e.need };
  });
  const fixed = groups[0] + groups[1];
  return { total: fixed + groups[2], groups, fixed, variable: groups[2], categories };
}

/** Plan month and day a one-time item lands on. */
export const landsOn = (o: OneTimeItem) => planDay(o.date, ONE_TIME_MONTHS - 1);

/** Monthly recurring income on top of take-home pay. */
export const monthlyExtra = (s: PlannerState) => s.income.reduce((t, o) => t + (o.every === 1 ? o.amount : 0), 0);

/** Yearly recurring income landing in plan month i (optionally only one tag). */
export function yearlyAt(s: PlannerState, i: number, tag?: IncomeTag): number {
  const month = monthDate(i).getMonth();
  return s.income.reduce((t, o) => t + (o.every === 12 && o.month === month && (!tag || o.tag === tag) ? o.amount : 0), 0);
}

/** One-time income with a tag (the signing bonus) in plan month i. */
export const taggedAt = (s: PlannerState, i: number, tag: IncomeTag) =>
  s.oneTime.income.reduce((t, o) => t + (o.month === i && o.tag === tag ? o.amount : 0), 0);

/** Yearly income in month i: the incentive and anything else you pay yourself once a year. */
export function bonusAt(s: PlannerState, i: number): number {
  return yearlyAt(s, i);
}

/** One-time payments minus one-time expenses that land in month i. */
export function oneTimeNet(s: PlannerState, i: number): number {
  const sum = (list: OneTimeItem[]) => list.reduce((t, o) => t + (o.month === i ? o.amount : 0), 0);
  return sum(s.oneTime.income) - sum(s.oneTime.expense);
}

/** Month-by-month savings. Month 0 only counts what you have now. */
export function project(s: PlannerState, months: number, monthlyDeposit: number): MonthRow[] {
  const rows: MonthRow[] = [];
  let balance = s.numbers.start + s.numbers.lump + oneTimeNet(s, 0);
  for (let i = 0; i < months; i++) {
    const base = i === 0 ? 0 : monthlyDeposit;
    const extra = bonusAt(s, i) + (i ? oneTimeNet(s, i) : 0);
    const deposit = base + extra;
    balance += deposit;
    rows.push({ i, label: monthLabel(i), base, extra, deposit, balance });
  }
  return rows;
}

/**
 * Day-by-day chequing balance: fixed bills leave on the 1st, variable spending drips out daily,
 * and pay plus any bonus lands on the last day of the month.
 */
export function dailyBalance(s: PlannerState, exp: ExpenseSummary, months: number): DayPoint[] {
  const pts: DayPoint[] = [];
  // one-time money lands on its own date
  const onDay = new Map<string, number>();
  const add = (o: OneTimeItem, sign: number) => {
    const { i, d } = landsOn(o);
    onDay.set(`${i}-${d}`, (onDay.get(`${i}-${d}`) ?? 0) + sign * o.amount);
  };
  s.oneTime.income.forEach((o) => add(o, 1));
  s.oneTime.expense.forEach((o) => add(o, -1));
  const pay = s.numbers.net + monthlyExtra(s);

  let bal = exp.total + s.numbers.start + s.numbers.lump;
  for (let i = 0; i < months; i++) {
    const dim = daysInPlanMonth(i);
    const bonus = bonusAt(s, i);
    for (let d = 1; d <= dim; d++) {
      if (d === 1) bal -= exp.fixed;
      bal -= exp.variable / dim;
      bal += onDay.get(`${i}-${d}`) ?? 0;
      if (d === dim) {
        pts.push({ bal, i, d, pay: false });
        bal += pay + bonus;
      }
      pts.push({ bal, i, d, pay: d === dim });
    }
  }
  return pts;
}

/** Numbers almost every page needs, computed once per change. */
export interface Plan {
  state: PlannerState;
  months: number;
  horizonLabel: string;
  net: number;
  exp: ExpenseSummary;
  /** take-home minus expenses */
  left: number;
  /** left / take-home */
  rate: number;
  rows: MonthRow[];
  /** 20-year projection used for milestones and goals */
  far: MonthRow[];
  last: MonthRow;
  /** balance at the end of month 0 */
  startBalance: number;
  /** savings you start with: existing savings plus the lump sum */
  seed: number;
  days: DayPoint[];
  low: DayPoint;
  lowDate: Date;
  /** bonuses and one-time money within the horizon */
  bonusTotal: number;
  /** what you add over the horizon, never negative */
  added: number;
  rent: number;
  needs: number;
  wants: number;
  /** month label when savings first reach v, "Reached" or "Not reached" */
  eta: (v: number) => string;
  /** plan-month index when savings first reach v, or -1 */
  reachIndex: (v: number) => number;
}

export function buildPlan(state: PlannerState): Plan {
  // take-home plus any other monthly income
  const net = state.numbers.net + monthlyExtra(state);
  const months = state.numbers.horizon;
  const exp = summarizeExpenses(state.expenses);
  const left = net - exp.total;
  const rows = project(state, months, left);
  const far = project(state, 240, left);
  const last = rows[rows.length - 1];
  const days = dailyBalance(state, exp, months);
  const low = days.reduce((a, p) => (p.bal < a.bal ? p : a));
  const seed = state.numbers.start + state.numbers.lump;
  const needs = exp.categories.filter((c) => c.need).reduce((t, c) => t + c.monthly, 0);
  const reachIndex = (v: number) => far.findIndex((r) => r.balance >= v);

  return {
    state,
    months,
    horizonLabel: horizonLabel(months),
    net,
    exp,
    left,
    rate: net ? left / net : 0,
    rows,
    far,
    last,
    startBalance: far[0].balance,
    seed,
    days,
    low,
    lowDate: monthDate(low.i, low.d),
    bonusTotal: rows.reduce((t, r) => t + r.extra, 0),
    added: Math.max(0, last.balance - seed),
    rent: exp.categories.find((c) => c.id === "rent")?.monthly ?? 0,
    needs,
    wants: exp.total - needs,
    reachIndex,
    eta: (v) => {
      const k = reachIndex(v);
      return k < 0 ? "Not reached" : k === 0 ? "Reached" : far[k].label;
    },
  };
}

export type Health = { tone: "pos" | "warn" | "neg"; label: string };

export function healthOf(plan: Plan): Health {
  if (plan.left < 0) return { tone: "neg", label: "Over budget" };
  if (plan.rate >= 0.2) return { tone: "pos", label: "On track" };
  return { tone: "warn", label: plan.rate >= 0.1 ? "Tight" : "Low savings" };
}

/**
 * Savings by month with and without a purchase: `upfront` leaves savings in the month you buy,
 * each loan payment comes out of the months after, and `relief` (e.g. rent you stop paying) comes back in.
 */
export function savingsWithPurchase(
  plan: Plan,
  months: number,
  buy: number,
  upfront: number,
  payments: number[],
  relief = 0,
): { without: number[]; withLoan: number[] } {
  const without = project(plan.state, months, plan.left).map((r) => r.balance);
  let out = 0;
  const withLoan = without.map((b, m) => {
    if (m < buy) return b;
    if (m === buy) out = upfront;
    else out += (payments[m - buy - 1] ?? 0) - relief;
    return b - out;
  });
  return { without, withLoan };
}
