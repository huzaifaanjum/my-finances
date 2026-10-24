// Turns payslip lines into "where the money goes" groups and a few derived numbers.

import type { LineGroup, PayLine, Payslip, PayslipData } from "./types";

export type Bucket = "takeHome" | "incomeTax" | "govPlans" | "pension" | "insurance" | "other";

export const BUCKETS: Record<Bucket, { label: string; color: string; who: string }> = {
  takeHome: { label: "Take-home", color: "var(--std)", who: "You, now" },
  incomeTax: { label: "Income tax", color: "var(--scotia)", who: "Canada and Quebec" },
  govPlans: { label: "Government plans", color: "var(--mix)", who: "QPP, EI and QPIP" },
  pension: { label: "Your pension", color: "var(--promo)", who: "You, at retirement" },
  insurance: { label: "Insurance", color: "#f472b6", who: "Disability, life and dental cover" },
  other: { label: "Other deductions", color: "#a1a1aa", who: "Everything else" },
};

// neighbours in this order stay distinguishable for colour-blind readers
export const BUCKET_ORDER: Bucket[] = ["takeHome", "incomeTax", "pension", "govPlans", "insurance", "other"];

export const isRetro = (l: PayLine) => /retro/i.test(l.label);

export function bucketOf(group: LineGroup, label: string): Bucket {
  if (group === "taxes") return /income tax/i.test(label) ? "incomeTax" : "govPlans";
  if (group === "preTax") return /pension|rrsp|\bdc\b/i.test(label) ? "pension" : "other";
  if (group === "afterTax") return /disab|ltd|std|life|ad&d|dental|health|vision|insur/i.test(label) ? "insurance" : "other";
  return "other";
}

/** Plain-language name for a payslip line. */
export function friendly(label: string): string {
  const rules: [RegExp, string][] = [
    [/canadian income tax/i, "Federal income tax"],
    [/quebec income tax/i, "Quebec income tax"],
    [/quebec pension plan/i, "Quebec Pension Plan (QPP)"],
    [/employment insurance/i, "Employment Insurance (EI)"],
    [/parental/i, "Quebec Parental Insurance (QPIP)"],
    [/dc pension/i, "DC pension"],
    [/^retro ltd$/i, "Retro long-term disability"],
    [/^retro std$/i, "Retro short-term disability"],
    [/extended hea/i, "Extended health"],
  ];
  const hit = rules.find(([re]) => re.test(label));
  if (!hit) return label;
  return /^retro /i.test(label) && !/^retro /i.test(hit[1]) ? `Retro ${hit[1].toLowerCase()}` : hit[1];
}

const sum = (ls: PayLine[], k: "current" | "ytd" = "current") => ls.reduce((t, l) => t + l[k], 0);

/** Where one payslip's gross pay went, by bucket. Adds up to gross. */
export function slipBuckets(d: PayslipData): Record<Bucket, number> {
  const out: Record<Bucket, number> = { takeHome: d.current.net, incomeTax: 0, govPlans: 0, pension: 0, insurance: 0, other: 0 };
  for (const g of ["preTax", "taxes", "afterTax"] as const) for (const l of d[g]) out[bucketOf(g, l.label)] += l.current;
  return out;
}

/** One-time catch-up deductions on this payslip. */
export const retroDeductions = (d: PayslipData) => sum([...d.preTax, ...d.afterTax].filter(isRetro));

/** What the deposit would have been without one-time catch-ups. */
export const usualNet = (d: PayslipData) => d.current.net + retroDeductions(d);

export const employerPension = (d: PayslipData, k: "current" | "ytd" = "current") => sum(d.employerPaid.filter((l) => /pension/i.test(l.label)), k);
export const employerBenefits = (d: PayslipData) => sum(d.employerPaid.filter((l) => !/pension/i.test(l.label) && !isRetro(l)));
/** Employer-paid benefits Quebec taxes you on (P- and FP- lines), recurring only. */
export const quebecTaxableBenefits = (d: PayslipData) =>
  sum(d.employerPaid.filter((l) => (l.taxable === "P" || l.taxable === "FP") && !isRetro(l)));
export const baseSalary = (d: PayslipData) => sum(d.earnings.filter((l) => /salary|regular|base/i.test(l.label))) || d.current.gross;
export const pensionLine = (d: PayslipData, k: "current" | "ytd" = "current") => sum(d.preTax.filter((l) => /pension/i.test(l.label)), k);
export const insurancePremiums = (d: PayslipData) => sum(d.afterTax.filter((l) => !isRetro(l) && bucketOf("afterTax", l.label) === "insurance"));
export const taxLine = (d: PayslipData, re: RegExp, k: "current" | "ytd" = "current") => sum(d.taxes.filter((l) => re.test(l.label)), k);

export const FED_TAX = /canadian income tax|federal/i;
export const QC_TAX = /quebec income tax/i;
export const QPP = /pension plan/i;
export const EI = /employment insurance/i;
export const QPIP = /parental/i;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "Oct 2026" from the pay period's end date. */
export function periodLabel(d: PayslipData, long = false): string {
  const m = d.periodEnd.match(/^(\d{4})-(\d{2})/);
  if (!m) return "Undated";
  return `${(long ? MONTHS_LONG : MONTHS)[Number(m[2]) - 1]} ${m[1]}`;
}

/** "Sep 29, 2026" */
export function shortDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${MONTHS[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}` : "—";
}

/** Oldest first. */
export const byPeriod = (a: Payslip, b: Payslip) => a.data.periodEnd.localeCompare(b.data.periodEnd) || a.createdAt - b.createdAt;

export interface MergedLine {
  label: string;
  bucket: Bucket;
  /** summed over the payslips */
  total: number;
  /** this period's amount on the latest payslip, so a year-to-date total can show what this payslip added */
  latest: number;
  retro: boolean;
}

/** Deduction lines across payslips, merged by name. `k: "ytd"` reads the year-to-date column instead. */
export function mergedDeductions(slips: PayslipData[], k: "current" | "ytd" = "current"): MergedLine[] {
  const map = new Map<string, MergedLine>();
  slips.forEach((d, n) => {
    for (const g of ["taxes", "preTax", "afterTax"] as const) {
      for (const l of d[g]) {
        const key = `${g}:${l.label.toLowerCase()}`;
        const hit = map.get(key) ?? { label: friendly(l.label), bucket: bucketOf(g, l.label), total: 0, latest: 0, retro: isRetro(l) };
        hit.total += l[k];
        if (n === slips.length - 1) hit.latest += l.current;
        map.set(key, hit);
      }
    }
  });
  return [...map.values()].filter((l) => Math.abs(l.total) >= 0.005);
}

export interface Change {
  label: string;
  diff: number;
}

/** The lines that moved the deposit most between two payslips. Positive = more money for you. */
export function netDrivers(prev: PayslipData, next: PayslipData): Change[] {
  const amounts = (d: PayslipData) => {
    const m = new Map<string, number>();
    for (const l of d.earnings) m.set(`+${friendly(l.label)}`, (m.get(`+${friendly(l.label)}`) ?? 0) + l.current);
    for (const g of ["taxes", "preTax", "afterTax"] as const)
      for (const l of d[g]) {
        // all retro lines collapse into one, they are one event
        const k = isRetro(l) ? "-One-time retro deductions" : `-${friendly(l.label)}`;
        m.set(k, (m.get(k) ?? 0) + l.current);
      }
    return m;
  };
  const a = amounts(prev);
  const b = amounts(next);
  const keys = new Set([...a.keys(), ...b.keys()]);
  return [...keys]
    .map((k) => {
      const d = (b.get(k) ?? 0) - (a.get(k) ?? 0);
      return { label: k.slice(1), diff: k.startsWith("+") ? d : -d };
    })
    .filter((c) => Math.abs(c.diff) >= 0.5)
    .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff));
}
