import { isoDate, isoPlanIndex, monthLabel } from "./calendar";
import type { Plan } from "./projection";
import type { CustomGoal } from "./types";

/** The two goals with their own detailed pages. */
export const GOALS = [
  { id: "house", name: "House", subtitle: "A first home: the cash you need, when your savings get there, and what the mortgage costs each month." },
  { id: "car", name: "Car", subtitle: "Save a down payment, finance the rest, and compare how long it takes and how much extra you pay." },
] as const;

export type GoalId = (typeof GOALS)[number]["id"];

export const findGoal = (id: string) => GOALS.find((g) => g.id === id);

/** Starting points for your own goals. Amounts and dates are placeholders you change. */
export const GOAL_TEMPLATES: { kind: string; name: string; target: number; months: number; hint: string }[] = [
  { kind: "trip", name: "Trip", target: 3000, months: 10, hint: "Hotels, food and activities; flights are cheap on standby" },
  { kind: "emergency", name: "Extra safety net", target: 5000, months: 12, hint: "Money on top of your emergency fund" },
  { kind: "wedding", name: "Wedding", target: 20000, months: 24, hint: "Venue, food, rings and the rest" },
  { kind: "education", name: "Course or certification", target: 4000, months: 12, hint: "Check the training budget at work first" },
  { kind: "tech", name: "Laptop or phone", target: 2000, months: 6, hint: "Pay cash instead of financing" },
  { kind: "gift", name: "Gift or family support", target: 2500, months: 8, hint: "Holidays, birthdays, sending money home" },
  { kind: "custom", name: "", target: 1000, months: 12, hint: "Anything else" },
];

export const newGoal = (t: (typeof GOAL_TEMPLATES)[number]): Omit<CustomGoal, "id"> => ({
  kind: t.kind,
  name: t.name,
  target: t.target,
  date: isoDate(t.months),
  saved: 0,
  monthly: Math.ceil(t.target / t.months / 10) * 10,
});

export interface CustomGoalPlan {
  /** plan month of the target date (at least 1) */
  due: number;
  /** months of saving until the date */
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

/** Saving toward a custom goal: a set amount each month from next month, on top of what is already set aside. */
export function customGoalPlan(g: CustomGoal, plan: Plan): CustomGoalPlan {
  const due = Math.max(1, isoPlanIndex(g.date));
  const left = Math.max(0, g.target - g.saved);
  const needMonthly = left / due;
  const ready = left === 0 ? 0 : g.monthly > 0 ? Math.ceil(left / g.monthly) : -1;
  const end = Math.min(240, Math.max(due, ready < 0 ? due : ready) + 3);
  const series = Array.from({ length: end + 1 }, (_, m) => Math.min(g.target, g.saved + g.monthly * m));
  return { due, months: due, left, needMonthly, ready, onTrack: ready >= 0 && ready <= due, series, share: plan.left > 0 ? g.monthly / plan.left : 0 };
}

export const readyLabel = (m: number) => (m < 0 ? "Never at $0 a month" : m === 0 ? "Already there" : monthLabel(m));
