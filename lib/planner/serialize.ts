// Converts between PlannerState and the shape stored in MongoDB.
// The stored shape predates the React rewrite: `v` is keyed by the old input ids, so existing saves keep loading.
import { EXPENSE_GROUPS, FLAGS, HORIZONS, SLIDERS, type FlagKey, type SliderKey } from "./config";
import { ONE_TIME_MONTHS } from "./defaults";
import type { OneTimeItem, PlannerState } from "./types";

interface SavedItem {
  id: number;
  n: string;
  a: number;
  m: number;
  on: boolean;
}

export interface SavedState {
  v: Record<string, string | number | boolean>;
  oo: SavedItem[];
  ox: SavedItem[];
}

const expenseKey = (g: number, i: number) => `e${g}_${i}`;

export function toSaved(s: PlannerState): SavedState {
  const v: SavedState["v"] = {};
  (Object.keys(SLIDERS) as SliderKey[]).forEach((k) => (v[k] = s.numbers[k]));
  (Object.keys(FLAGS) as FlagKey[]).forEach((k) => (v[k] = s.flags[k]));
  v.hz = s.numbers.horizon;
  v.tfsa = s.numbers.tfsa;
  v.fhsa = s.numbers.fhsa;
  s.expenses.forEach((g, gi) => g.forEach((amt, ii) => (v[expenseKey(gi, ii)] = amt)));
  const out = (o: OneTimeItem): SavedItem => ({ id: o.id, n: o.name, a: o.amount, m: o.month, on: o.on });
  return { v, oo: s.oneTime.income.map(out), ox: s.oneTime.expense.map(out) };
}

/** Snap to the slider's step and range, the way a browser range input would. */
function clampToSlider(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, +snapped.toFixed(6)));
}

function readNumber(raw: unknown): number | null {
  if (raw === "" || raw === null || raw === undefined || typeof raw === "boolean") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function readItems(raw: unknown): OneTimeItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((o: Partial<SavedItem>) => ({
    id: Number(o.id) || 0,
    name: String(o.n ?? ""),
    amount: Math.max(0, Number(o.a) || 0),
    month: Math.max(0, Math.min(ONE_TIME_MONTHS - 1, Number(o.m) || 0)),
    on: !!o.on,
  }));
}

/** Applies a saved copy on top of `base`. Unknown or invalid values keep the base value. */
export function fromSaved(raw: unknown, base: PlannerState): PlannerState {
  const saved = (raw ?? {}) as Partial<SavedState>;
  const v = saved.v ?? {};
  const next: PlannerState = {
    numbers: { ...base.numbers },
    flags: { ...base.flags },
    expenses: base.expenses.map((g) => [...g]),
    oneTime: { income: readItems(saved.oo), expense: readItems(saved.ox) },
  };

  (Object.keys(SLIDERS) as SliderKey[]).forEach((k) => {
    const n = readNumber(v[k]);
    const d = SLIDERS[k];
    if (n !== null) next.numbers[k] = clampToSlider(n, d.min, d.max, d.step);
  });
  (Object.keys(FLAGS) as FlagKey[]).forEach((k) => {
    if (typeof v[k] === "boolean") next.flags[k] = v[k] as boolean;
  });

  const hz = readNumber(v.hz);
  if (hz !== null && HORIZONS.some((h) => h.value === hz)) next.numbers.horizon = hz;
  (["tfsa", "fhsa"] as const).forEach((k) => {
    const n = readNumber(v[k]);
    if (n !== null) next.numbers[k] = Math.max(0, n);
  });

  EXPENSE_GROUPS.forEach((g, gi) =>
    g.items.forEach((it, ii) => {
      const n = readNumber(v[expenseKey(gi, ii)]);
      if (n !== null) next.expenses[gi][ii] = clampToSlider(n, 0, it.max, it.step);
    }),
  );
  return next;
}
