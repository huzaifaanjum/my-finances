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

/** Everything the user can change. All derived numbers are computed from this. */
export interface PlannerState {
  numbers: Record<NumericKey, number>;
  flags: Record<FlagKey, boolean>;
  /** extra income on top of take-home pay (numbers.net) */
  income: RecurringIncome[];
  expenses: RecurringExpense[];
  oneTime: Record<OneTimeKind, OneTimeItem[]>;
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
