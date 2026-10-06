import type { FlagKey, NumericKey } from "./config";

export type OneTimeKind = "income" | "expense";

export interface OneTimeItem {
  id: number;
  name: string;
  amount: number;
  /** plan-month index; 0 is now (October 2026) */
  month: number;
  on: boolean;
}

/** Everything the user can change. All derived numbers are computed from this. */
export interface PlannerState {
  numbers: Record<NumericKey, number>;
  flags: Record<FlagKey, boolean>;
  /** amount per expense slider, indexed [group][item] like EXPENSE_GROUPS */
  expenses: number[][];
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
