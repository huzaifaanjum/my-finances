// Converts between PlannerState and the shape stored in MongoDB.
// The stored shape predates the React rewrite: `v` is keyed by the old input ids, so existing saves keep loading.
import { isoDate, planDay, todayIso } from "./calendar";
import { EXPENSE_GROUPS, FLAGS, HORIZONS, SLIDERS, type FlagKey, type SliderKey } from "./config";
import { defaultExpenses, incentiveItem, nextId, ONE_TIME_MONTHS, signingItems } from "./defaults";
import { stepOn } from "./projection";
import type { IncomeTag, OneTimeItem, PayStep, PlannerState, RecurringExpense, RecurringIncome } from "./types";

/** Saves before version 2 kept expenses as fixed sliders, the bonuses as numbers and one-time items by month. */
const VERSION = 2;

interface SavedItem {
  id: number;
  n: string;
  a: number;
  /** ISO date (version 2) */
  d?: string;
  /** plan month (version 1) */
  m?: number;
  t?: IncomeTag;
  on?: boolean;
}

interface SavedIncome {
  id: number;
  n: string;
  a: number;
  ev: 1 | 12;
  m: number;
  t?: IncomeTag;
}

interface SavedExpense {
  id: string;
  n: string;
  a: number;
  ev: number;
  g: number;
  nd: boolean;
}

export interface SavedState {
  ver?: number;
  v: Record<string, string | number | boolean>;
  /** pay steps */
  py?: { id: number; a: number; d: string }[];
  ri?: SavedIncome[];
  re?: SavedExpense[];
  oo: SavedItem[];
  ox: SavedItem[];
}

const expenseKey = (g: number, i: number) => `e${g}_${i}`;
const MAX_AMOUNT = 10_000_000;
const amountOf = (raw: unknown) => Math.min(MAX_AMOUNT, Math.max(0, Number(raw) || 0));
const tagOf = (raw: unknown): IncomeTag | undefined => (raw === "signing" || raw === "incentive" ? raw : undefined);

export function toSaved(s: PlannerState): SavedState {
  const v: SavedState["v"] = {};
  (Object.keys(SLIDERS) as SliderKey[]).forEach((k) => (v[k] = s.numbers[k]));
  (Object.keys(FLAGS) as FlagKey[]).forEach((k) => (v[k] = s.flags[k]));
  v.hz = s.numbers.horizon;
  v.tfsa = s.numbers.tfsa;
  v.fhsa = s.numbers.fhsa;
  const out = (o: OneTimeItem): SavedItem => ({ id: o.id, n: o.name, a: o.amount, d: o.date, m: o.month, ...(o.tag && { t: o.tag }) });
  return {
    ver: VERSION,
    v,
    py: s.pay.map((p) => ({ id: p.id, a: p.amount, d: p.date })),
    ri: s.income.map((o) => ({ id: o.id, n: o.name, a: o.amount, ev: o.every, m: o.month, ...(o.tag && { t: o.tag }) })),
    re: s.expenses.map((e) => ({ id: e.id, n: e.name, a: e.amount, ev: e.every, g: e.group, nd: e.need })),
    oo: s.oneTime.income.map(out),
    ox: s.oneTime.expense.map(out),
  };
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

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** A one-time item; version 1 items only had a month, so they land on its payday (the 1st for "now"). */
function readItems(raw: unknown): OneTimeItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((o: Partial<SavedItem>) => {
    let date: string;
    if (typeof o.d === "string" && ISO.test(o.d)) date = o.d;
    else {
      const m = Math.max(0, Math.min(ONE_TIME_MONTHS - 1, Number(o.m) || 0));
      date = m ? isoDate(m) : isoDate(0, 1);
    }
    const { i } = planDay(date, ONE_TIME_MONTHS - 1);
    return { id: Number(o.id) || 0, name: String(o.n ?? ""), amount: amountOf(o.a), date, month: i, ...(tagOf(o.t) && { tag: tagOf(o.t) }) };
  });
}

function readPay(raw: unknown): PayStep[] | null {
  if (!Array.isArray(raw) || !raw.length) return null;
  return raw.map((p: { id?: unknown; a?: unknown; d?: unknown }, k) => ({
    id: Number(p.id) || k + 1,
    amount: amountOf(p.a),
    date: typeof p.d === "string" && ISO.test(p.d) ? p.d : isoDate(0, 1),
  }));
}

function readIncome(raw: unknown): RecurringIncome[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((o: Partial<SavedIncome>) => ({
    id: Number(o.id) || 0,
    name: String(o.n ?? ""),
    amount: amountOf(o.a),
    every: o.ev === 12 ? 12 : 1,
    month: Math.max(0, Math.min(11, Math.round(Number(o.m) || 0))),
    ...(tagOf(o.t) && { tag: tagOf(o.t) }),
  }));
}

function readExpenses(raw: unknown): RecurringExpense[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.map((e: Partial<SavedExpense>, k) => ({
    id: String(e.id ?? `x${k}`),
    name: String(e.n ?? ""),
    amount: amountOf(e.a),
    every: Math.max(1, Math.min(12, Math.round(Number(e.ev) || 1))),
    group: Math.max(0, Math.min(EXPENSE_GROUPS.length - 1, Math.round(Number(e.g) || 0))),
    need: !!e.nd,
  }));
}

/** Applies a saved copy on top of `base`. Unknown or invalid values keep the base value. */
export function fromSaved(raw: unknown, base: PlannerState): PlannerState {
  if (!raw || typeof raw !== "object") return base;
  const saved = raw as Partial<SavedState>;
  const v = saved.v ?? {};
  const next: PlannerState = {
    numbers: { ...base.numbers },
    flags: { ...base.flags },
    pay: base.pay.map((p) => ({ ...p })),
    income: base.income.map((o) => ({ ...o })),
    expenses: base.expenses.map((e) => ({ ...e })),
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

  // saves without pay steps had one take-home figure
  next.pay = readPay(saved.py) ?? [{ id: 1, amount: next.numbers.net, date: isoDate(0, 1) }];
  next.numbers.net = stepOn(next.pay, todayIso())?.amount ?? next.numbers.net;

  if (saved.ver === VERSION) {
    next.income = readIncome(saved.ri) ?? next.income;
    next.expenses = readExpenses(saved.re) ?? next.expenses;
    return next;
  }

  // version 1: expense sliders, the signing bonus and incentive as numbers
  next.expenses = defaultExpenses();
  let k = 0;
  EXPENSE_GROUPS.forEach((g, gi) =>
    g.items.forEach((_, ii) => {
      const n = readNumber(v[expenseKey(gi, ii)]);
      if (n !== null) next.expenses[k].amount = Math.max(0, n);
      k++;
    }),
  );
  next.income = next.flags.aip ? [incentiveItem(next.numbers.aipAmt, 1)] : [];
  if (next.numbers.sign > 0) next.oneTime.income.push(...signingItems(next.numbers.sign, nextId(next.oneTime.income)));
  return next;
}

