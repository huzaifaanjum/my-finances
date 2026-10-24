import { PAY } from "@/lib/pay";
import { isoDate } from "./calendar";
import { EXPENSE_GROUPS, FLAGS, OTHER_NUMBERS, SLIDERS, type NumericKey, type SliderKey } from "./config";
import type { OneTimeItem, OneTimeKind, PlannerState, RecurringExpense, RecurringIncome } from "./types";

/** Signing bonus payments: February and August 2027 (plan months 4 and 10), on payday. */
export const SIGNING_MONTHS = [4, 10] as const;
/** The incentive lands in March. */
export const INCENTIVE_MONTH = 2;

/** One-time items can be dated up to five years out. */
export const ONE_TIME_MONTHS = 60;

export function defaultExpenses(): RecurringExpense[] {
  return EXPENSE_GROUPS.flatMap((g, gi) =>
    g.items.map((it) => ({ id: it.id, name: it.name, amount: it.initial, every: it.every, group: gi, need: it.need })),
  );
}

export function signingItems(amount: number, firstId: number): OneTimeItem[] {
  return SIGNING_MONTHS.map((m, k) => ({
    id: firstId + k,
    name: `Signing bonus (${k + 1} of 2)`,
    amount,
    date: isoDate(m),
    month: m,
    tag: "signing",
  }));
}

export function incentiveItem(amount: number, id: number): RecurringIncome {
  return { id, name: "Annual incentive", amount, every: 12, month: INCENTIVE_MONTH, tag: "incentive" };
}

export function createDefaultState(): PlannerState {
  const sliders = Object.fromEntries(
    (Object.keys(SLIDERS) as SliderKey[]).map((k) => [k, SLIDERS[k].initial]),
  ) as Record<SliderKey, number>;
  return {
    numbers: { ...sliders, ...OTHER_NUMBERS } as Record<NumericKey, number>,
    flags: { ...FLAGS },
    pay: [{ id: 1, amount: sliders.net, date: isoDate(0, 1) }],
    income: [],
    expenses: defaultExpenses(),
    oneTime: {
      income: signingItems(PAY.signingNet, 1),
      expense: [{ id: 1, name: "Credit card balance (remaining)", amount: 1000, date: isoDate(0, 1), month: 0 }],
    },
  };
}

export const ONE_TIME_DEFAULTS: Record<OneTimeKind, { name: string; amount: number }> = {
  income: { name: "", amount: 0 },
  expense: { name: "", amount: 0 },
};

export const nextId = (list: { id: number }[]) => Math.max(0, ...list.map((o) => o.id)) + 1;
