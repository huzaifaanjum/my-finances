import { money, pctLabel } from "@/lib/format";
import { monthLabel } from "./calendar";

export interface SliderDef {
  label: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  format: (v: number) => string;
}

const slider = (
  label: string,
  min: number,
  max: number,
  step: number,
  initial: number,
  format: (v: number) => string = money,
): SliderDef => ({ label, min, max, step, initial, format });

/** Every slider in the planner. Keys double as the ids stored in the cloud copy, so do not rename them. */
export const SLIDERS = {
  net: slider("Monthly take-home pay", 3000, 8000, 10, 4680),
  start: slider("Savings you already have", 0, 10000, 100, 0),
  lump: slider("One-time extra money you add now", 0, 10000, 100, 0),
  sign: slider("Signing bonus, net per payment", 0, 2500, 50, 1500),
  aipAmt: slider("Annual incentive bonus, net", 0, 5000, 50, 1700),

  home: slider("Home price", 250000, 1200000, 10000, 450000),
  dpp: slider("Down payment", 5, 25, 1, 10, pctLabel),
  hrate: slider("Mortgage rate", 2, 8, 0.05, 4.5, (v) => `${v.toFixed(2)}%`),
  hamort: slider("Amortization", 15, 30, 5, 25, (v) => `${v} years`),
  hextra: slider("Extra you pay each month", 0, 2000, 50, 0),
  hbuy: slider("Buy the home in", 0, 120, 1, 36, (v) => (v === 0 ? "now" : monthLabel(v))),
  target: slider("Millionaire target", 250000, 3000000, 50000, 1000000),
  ret: slider("Yearly investment return (millionaire path only)", 0, 12, 0.5, 6, pctLabel),
  rais: slider("Yearly increase in what you save", 0, 10, 0.5, 3, pctLabel),
  mil_extra: slider("Extra you invest each month", 0, 3000, 50, 0),

  ret_sg: slider("Yearly salary growth", 0, 6, 0.5, 2.5, pctLabel),
  ret_pr: slider("Pension fund return", 2, 9, 0.5, 5, pctLabel),
  ret_wr: slider("Yearly withdrawal in retirement", 3, 6, 0.5, 4, pctLabel),
  ret_inf: slider("Inflation", 1, 4, 0.5, 2, pctLabel),

  rs_raise: slider("Raise or promotion at work", 0, 1500, 25, 0),
  rs_free: slider("Freelance or consulting", 0, 3000, 50, 0),
  rs_side: slider("Side gig (tutoring, delivery, reselling)", 0, 1500, 25, 0),
  rs_dig: slider("Digital products or content", 0, 2000, 25, 0),
  rs_room: slider("Roommate or renting a room", 0, 1500, 50, 0),

  cprice: slider("Car price, before tax", 5000, 100000, 500, 30000),
  cdown: slider("Down payment", 0, 60000, 500, 6000),
  capr: slider("Loan interest rate (APR)", 0, 15, 0.1, 7.5, (v) => `${v.toFixed(1)}%`),
  cterm: slider("Loan length", 12, 96, 12, 60, (v) => `${v} months`),
  cextra: slider("Extra you pay each month", 0, 1000, 25, 100),
  cbuy: slider("Buy the car in", 0, 36, 1, 12, (v) => (v === 0 ? "now" : monthLabel(v))),
} satisfies Record<string, SliderDef>;

export type SliderKey = keyof typeof SLIDERS;

/** Numbers that are not sliders: the chart range and the registered-account room inputs. */
export const OTHER_NUMBERS = { horizon: 12, tfsa: 27500, fhsa: 8000 };
export type NumericKey = SliderKey | keyof typeof OTHER_NUMBERS;

export const FLAGS = { aip: false, ctax: true, mil_rs: false };
export type FlagKey = keyof typeof FLAGS;

export const HORIZONS = [
  { value: 1, label: "1 month", group: "Months" },
  { value: 2, label: "2 months", group: "Months" },
  { value: 3, label: "3 months", group: "Months" },
  { value: 6, label: "6 months", group: "Months" },
  { value: 12, label: "1 year", group: "Years" },
  { value: 24, label: "2 years", group: "Years" },
  { value: 36, label: "3 years", group: "Years" },
  { value: 60, label: "5 years", group: "Years" },
] as const;

export function horizonLabel(months: number): string {
  return HORIZONS.find((h) => h.value === months)?.label ?? `${months} months`;
}

/* ---------- expenses ---------- */

export type ExpenseId =
  | "rent" | "electricity" | "phone" | "transit" | "wifi"
  | "icloud" | "music1" | "music2" | "disney" | "applecare" | "amazon" | "claude"
  | "groceries" | "eatingOut" | "shopping" | "entertainment" | "health" | "other";

export interface ExpenseItem {
  id: ExpenseId;
  label: string;
  /** shorter name used in summaries */
  name: string;
  initial: number;
  /** billed every N months; the monthly cost is amount / every */
  every: number;
  max: number;
  step: number;
  need: boolean;
}

export interface ExpenseGroup {
  title: string;
  color: string;
  note?: string;
  items: ExpenseItem[];
}

const item = (id: ExpenseId, label: string, initial: number, max: number, step: number, need = false, every = 1, name = label): ExpenseItem => ({
  id, label, name, initial, every, max, step, need,
});

export const EXPENSE_GROUPS: ExpenseGroup[] = [
  {
    title: "Fixed expenses",
    color: "var(--std)",
    items: [
      item("rent", "Rent", 2075, 4000, 25, true),
      item("electricity", "Electricity (bill every 2 months)", 90, 400, 5, true, 2, "Electricity"),
      item("phone", "Phone", 135, 300, 5, true),
      item("transit", "Opus Metro pass", 160, 300, 5, true),
      item("wifi", "Wi-Fi", 50, 150, 5, true),
    ],
  },
  {
    title: "Subscriptions",
    color: "var(--scotia)",
    items: [
      item("icloud", "Apple iCloud", 15, 50, 1),
      item("music1", "Apple Music (person 1)", 7, 30, 1),
      item("music2", "Apple Music (person 2)", 7, 30, 1),
      item("disney", "Disney+", 20, 50, 1),
      item("applecare", "AppleCare for Apple Watch", 5, 30, 1),
      item("amazon", "Amazon", 11, 50, 1),
      item("claude", "Claude Pro", 32, 100, 1),
    ],
  },
  {
    title: "Variable expenses",
    color: "var(--promo)",
    note: "These amounts are placeholders. Move the sliders to your real spending.",
    items: [
      item("groceries", "Groceries", 450, 1200, 10, true),
      item("eatingOut", "Eating out", 150, 800, 10),
      item("shopping", "Shopping", 100, 800, 10),
      item("entertainment", "Entertainment & misc", 100, 800, 10),
      item("health", "Health & personal", 70, 500, 10, true),
      item("other", "Other", 100, 800, 10),
    ],
  },
];

/* ---------- extra income streams (Insights) ---------- */

export type StreamKind = "work" | "side" | "housing";
export type StreamKey = "rs_raise" | "rs_free" | "rs_side" | "rs_dig" | "rs_room";

export const STREAM_COLORS: Record<StreamKind, string> = {
  work: "var(--scotia)",
  side: "var(--mix)",
  housing: "var(--promo)",
};

export const INCOME_STREAMS: { key: StreamKey; kind: StreamKind; hint: string }[] = [
  { key: "rs_raise", kind: "work", hint: "A 5% raise on $95,000 is about $234 a month after tax." },
  { key: "rs_free", kind: "side", hint: "10 hours a month at $60 an hour is about $380 after tax." },
  { key: "rs_side", kind: "side", hint: "4 hours a week at $20 an hour is about $220 after tax." },
  { key: "rs_dig", kind: "side", hint: "Templates, courses, writing. Slow to start, so treat it as upside." },
  { key: "rs_room", kind: "housing", hint: "" },
];

/* ---------- facts from the offer letter and pay stub ---------- */

export const SALARY = 95000;
export const EMPLOYER_HEALTH = 2996;
/** Each extra dollar of salary adds about 50¢ to take-home at this tax bracket (incl. 6% pension). */
export const TAKE_HOME_PER_GROSS = 0.5;
/** Combined monthly pension contribution today: your 6% plus Air Canada's 6% match. */
export const PENSION_MONTHLY = 950;
