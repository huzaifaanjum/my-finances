import type { FlagKey, NumericKey } from "./config";

export type OneTimeKind = "income" | "expense";

/** Marks the bonuses Cash flow can switch on and off. */
export type IncomeTag = "signing" | "incentive";

export interface OneTimeItem {
  id: number;
  name: string;
  amount: number;
  /** "2027-02-28"; the day it lands */
  date: string;
  /** plan-month index of `date`; 0 is now (October 2026) */
  month: number;
  tag?: IncomeTag;
}

/** Take-home pay from a date on; a new step replaces the one before it. */
export interface PayStep {
  id: number;
  amount: number;
  /** "2027-01-01"; paydays on or after this date get the new pay */
  date: string;
}

/** Money that arrives every month, or once a year in a set month, on payday. */
export interface RecurringIncome {
  id: number;
  name: string;
  amount: number;
  /** 1 = every month, 12 = once a year */
  every: 1 | 12;
  /** calendar month (0 = Jan) for yearly items */
  month: number;
  tag?: IncomeTag;
}

/** A bill or budget line. Built-in ones keep their id ("rent", "groceries") so insights can find them. */
export interface RecurringExpense {
  id: string;
  name: string;
  /** what each bill costs */
  amount: number;
  /** billed every N months; the monthly cost is amount / every */
  every: number;
  /** 0 fixed bills, 1 subscriptions, 2 day-to-day */
  group: number;
  need: boolean;
}

/** A goal you add yourself, from a template: save up a target by a date. */
export interface CustomGoal {
  id: number;
  /** template it started from: "trip", "wedding", "custom"… */
  kind: string;
  name: string;
  target: number;
  /** "2027-08-31" */
  date: string;
  /** already set aside for it */
  saved: number;
  /** what you put toward it each month */
  monthly: number;
}

/** Everything the user can change. All derived numbers are computed from this. */
export interface PlannerState {
  numbers: Record<NumericKey, number>;
  flags: Record<FlagKey, boolean>;
  /** take-home pay over time, oldest first; numbers.net mirrors the step in force today */
  pay: PayStep[];
  /** extra income on top of take-home pay */
  income: RecurringIncome[];
  expenses: RecurringExpense[];
  oneTime: Record<OneTimeKind, OneTimeItem[]>;
  /** goals beyond the built-in home and car */
  goals: CustomGoal[];
}

export interface MonthRow {
  i: number;
  label: string;
  /** surplus from pay this month */
  base: number;
  /** bonuses and one-time money this month */
  extra: number;
  /** base + extra */
  deposit: number;
  /** savings balance at the end of the month */
  balance: number;
}

export interface DayPoint {
  bal: number;
  /** plan month */
  i: number;
  /** day of the month */
  d: number;
  /** true on the point right after pay lands */
  pay: boolean;
}
