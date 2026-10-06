import { EXPENSE_GROUPS, FLAGS, OTHER_NUMBERS, SLIDERS, type NumericKey, type SliderKey } from "./config";
import type { PlannerState } from "./types";

export function createDefaultState(): PlannerState {
  const sliders = Object.fromEntries(
    (Object.keys(SLIDERS) as SliderKey[]).map((k) => [k, SLIDERS[k].initial]),
  ) as Record<SliderKey, number>;
  return {
    numbers: { ...sliders, ...OTHER_NUMBERS } as Record<NumericKey, number>,
    flags: { ...FLAGS },
    expenses: EXPENSE_GROUPS.map((g) => g.items.map((it) => it.initial)),
    oneTime: {
      income: [],
      expense: [{ id: 1, name: "Credit card balance (remaining)", amount: 1000, month: 0, on: true }],
    },
  };
}

export const ONE_TIME_MONTHS = 60;

export const ONE_TIME_DEFAULTS = {
  income: { name: "One-time payment", amount: 1000 },
  expense: { name: "One-time expense", amount: 500 },
} as const;
