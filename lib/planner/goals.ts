// Saving goals: each one is made from a template (lib/planner/goalTemplates.ts).
// Home and car goals use all your savings and a loan; every other goal sets aside a monthly amount.

import { money } from "@/lib/format";
import { isoDate, isoPlanIndex, longDate, monthLabel } from "./calendar";
import { carPlan, type CarValues } from "./car";
import { templateOf, valuesOf, type GoalCost, type GoalTemplate } from "./goalTemplates";
import { housePlan, type HouseValues } from "./house";
import type { Plan } from "./projection";
import type { CustomGoal } from "./types";

export const houseValues = (g: CustomGoal) => valuesOf(templateOf("house"), g.values) as unknown as HouseValues;
export const carValues = (g: CustomGoal) => valuesOf(templateOf("car"), g.values) as unknown as CarValues;

/** What a template goal costs, from its fields. */
export const goalCost = (g: CustomGoal, plan: Plan): GoalCost => templateOf(g.kind).cost(valuesOf(templateOf(g.kind), g.values), plan);

/** "/goals/house" and "/goals/car" open your first goal of that kind; everything else is "g" + id. */
export function findGoalBySlug(goals: CustomGoal[], slug: string): CustomGoal | undefined {
  if (slug === "house" || slug === "car") return goals.find((g) => g.kind === slug);
  const id = Number(slug.replace(/^g/, ""));
  return goals.find((g) => g.id === id);
}

export const goalHref = (g: { id: number }) => `/goals/g${g.id}`;

/** A new goal from a template, with a monthly amount that reaches the typical cost on time. */
export function newGoal(t: GoalTemplate, plan: Plan): Omit<CustomGoal, "id"> {
  const values = valuesOf(t, {});
  const draft = { kind: t.kind, name: t.kind === "custom" ? "" : t.name, values, date: isoDate(t.months), saved: 0, monthly: 0 };
  const target = t.detail ? 0 : t.cost(values, plan).target;
  return { ...draft, monthly: Math.ceil(target / t.months / 10) * 10 };
}

export interface CustomGoalPlan {
  target: number;
  /** plan month of the target date (at least 1) */
  due: number;
  months: number;
  left: number;
  /** a month to reach the target by the date */
  needMonthly: number;
  /** plan month when the target is reached at your monthly amount, or -1 */
  ready: number;
  onTrack: boolean;
  /** balance month by month from now to a little past the later of due and ready */
  series: number[];
  /** share of what you have left over each month */
  share: number;
}

/** Saving toward a template goal: a set amount each month from next month, on top of what is already set aside. */
export function customGoalPlan(g: CustomGoal, plan: Plan): CustomGoalPlan {
  const target = goalCost(g, plan).target;
  const due = Math.max(1, isoPlanIndex(g.date));
  const left = Math.max(0, target - g.saved);
  const needMonthly = left / due;
  const ready = left === 0 ? 0 : g.monthly > 0 ? Math.ceil(left / g.monthly) : -1;
  const end = Math.min(240, Math.max(due, ready < 0 ? due : ready) + 3);
  const series = Array.from({ length: end + 1 }, (_, m) => Math.min(target, g.saved + g.monthly * m));
  return { target, due, months: due, left, needMonthly, ready, onTrack: ready >= 0 && ready <= due, series, share: plan.left > 0 ? g.monthly / plan.left : 0 };
}

export const readyLabel = (m: number) => (m < 0 ? "Never at $0 a month" : m === 0 ? "Already there" : monthLabel(m));

export interface GoalSummary {
  headlineLabel: string;
  headline: string;
  needLabel: string;
  need: number;
  /** share of `need` already there (can be negative when savings start below zero) */
  progress: number;
  facts: [string, string][];
  onTrack: boolean;
  /** "On track", "Behind", "Done", "Short at buy date" */
  badge: string;
  status: string;
  /** one short line for the Overview */
  when: string;
}

const whenLabel = (m: number) => (m === 0 ? "now" : monthLabel(m));

/** The numbers a goal card shows, for any template. */
export function summarizeGoal(g: CustomGoal, plan: Plan): GoalSummary {
  const saved = plan.startBalance;
  if (g.kind === "house") {
    const h = housePlan(plan, houseValues(g));
    const ready = h.ready < 0 ? "Not within 20 years" : whenLabel(h.ready);
    return {
      headlineLabel: "Home price",
      headline: money(h.price),
      needLabel: "Cash needed",
      need: h.cash,
      progress: h.cash ? saved / h.cash : 1,
      facts: [
        ["Down payment", `${money(h.down)} · ${h.dppPct}%`],
        ["Mortgage payment", `${money(h.loan.payment)}/mo`],
        ["Savings ready", ready],
      ],
      onTrack: h.savedAtBuy >= h.cash,
      badge: h.savedAtBuy >= h.cash ? "On track" : "Short at buy date",
      status: `Buying ${whenLabel(h.buy)} · uses all your savings`,
      when: ready,
    };
  }
  if (g.kind === "car") {
    const c = carPlan(plan, carValues(g));
    const ready = c.downReady ? c.downReady.label : "Not within 20 years";
    return {
      headlineLabel: "Car price with tax",
      headline: money(c.price + c.tax),
      needLabel: "Down payment",
      need: c.down,
      progress: c.down ? saved / c.down : 1,
      facts: [
        ["Loan payment", `${money(c.regular.payment)}/mo`],
        ["Interest", money(c.regular.interest)],
        ["Savings ready", ready],
      ],
      onTrack: c.savedAtBuy >= c.down,
      badge: c.savedAtBuy >= c.down ? "On track" : "Short at buy date",
      status: `Buying ${whenLabel(c.buy)} · uses all your savings`,
      when: ready,
    };
  }
  const p = customGoalPlan(g, plan);
  const done = p.left === 0;
  return {
    headlineLabel: "Target",
    headline: money(p.target),
    needLabel: `${money(g.saved)} set aside`,
    need: p.target,
    progress: p.target ? g.saved / p.target : 1,
    facts: [
      ["Wanted by", longDate(g.date)],
      ["Putting aside", `${money(g.monthly)}/mo`],
      ["Ready", readyLabel(p.ready)],
    ],
    onTrack: done || p.onTrack,
    badge: done ? "Done" : p.onTrack ? "On track" : "Behind",
    status: done || p.onTrack ? "On time" : `${money(p.needMonthly)}/mo makes the date`,
    when: done ? "done" : p.onTrack ? "on time" : "behind",
  };
}
