// Returns you have already filed, as Revenu Québec and the CRA assessed them. Stored with your plan (not in the code),
// because they are personal. Amounts are the "We determined" figures from the notices of assessment.

export type Gov = "qc" | "fed";

export interface FiledReturn {
  year: number;
  gov: Gov;
  /** total income (line 199 / 15000) */
  income?: number;
  netIncome?: number;
  taxableIncome?: number;
  /** income tax after credits (line 432 / 43500 net of refundable credits) */
  taxPayable?: number;
  /** tax withheld at source */
  withheld?: number;
  /** positive: refund; negative: balance you paid */
  refund: number;
  /** tuition fees left to use in later years, after this return */
  tuitionCarry?: number;
  /** credit that was available this year but not claimed */
  unclaimed?: number;
  /** "Assessed" date or short facts worth keeping */
  notes?: string[];
}

export const GOV_NAME: Record<Gov, string> = { qc: "Quebec (Revenu Québec)", fed: "Federal (CRA)" };

const num = (v: unknown) => (v === undefined || v === null || v === "" ? undefined : Number.isFinite(Number(v)) ? Number(v) : undefined);

/** Reads saved returns, dropping anything malformed. */
export function readHistory(raw: unknown): FiledReturn[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter((r) => r && typeof r === "object" && Number((r as FiledReturn).year) > 1900 && ((r as FiledReturn).gov === "qc" || (r as FiledReturn).gov === "fed"))
    .map((r: FiledReturn) => ({
      year: Number(r.year),
      gov: r.gov,
      income: num(r.income),
      netIncome: num(r.netIncome),
      taxableIncome: num(r.taxableIncome),
      taxPayable: num(r.taxPayable),
      withheld: num(r.withheld),
      refund: Number(r.refund) || 0,
      tuitionCarry: num(r.tuitionCarry),
      unclaimed: num(r.unclaimed),
      notes: Array.isArray(r.notes) ? r.notes.map(String) : undefined,
    }));
}

/** The latest tuition carry-forward on record for one government, or 0. */
export function latestTuitionCarry(history: FiledReturn[], gov: Gov): { amount: number; year: number | null } {
  const last = history.filter((r) => r.gov === gov && r.tuitionCarry !== undefined).sort((a, b) => b.year - a.year)[0];
  return last ? { amount: last.tuitionCarry!, year: last.year } : { amount: 0, year: null };
}

/** Money the governments pay you, separate from your refund: solidarity credit, GST credit and the like. */
export interface GovPayment {
  name: string;
  gov: Gov;
  /** each payment */
  amount: number;
  per: "month" | "quarter" | "once";
  /** "2026-07-01" to "2027-06-30": the period it covers */
  from: string;
  to: string;
  /** the tax year whose income set the amount */
  basedOn?: number;
  /** a known next payment date, when there is one */
  next?: string;
  notes?: string[];
}

export function readPayments(raw: unknown): GovPayment[] | null {
  if (!Array.isArray(raw)) return null;
  return raw
    .filter((p) => p && typeof p === "object" && typeof (p as GovPayment).name === "string")
    .map((p: GovPayment) => ({
      name: String(p.name),
      gov: p.gov === "fed" ? "fed" : "qc",
      amount: Number(p.amount) || 0,
      per: p.per === "quarter" || p.per === "once" ? p.per : "month",
      from: String(p.from ?? ""),
      to: String(p.to ?? ""),
      basedOn: num(p.basedOn),
      next: p.next ? String(p.next) : undefined,
      notes: Array.isArray(p.notes) ? p.notes.map(String) : undefined,
    }));
}

/** Payments still to come in a period, counted from today. */
export function paymentsLeft(p: GovPayment, today = new Date()): { count: number; total: number } {
  const end = new Date(`${p.to}T23:59:59`);
  if (p.per === "once") {
    const d = new Date(`${(p.next ?? p.from)}T12:00:00`);
    return d >= today && d <= end ? { count: 1, total: p.amount } : { count: 0, total: 0 };
  }
  const step = p.per === "month" ? 1 : 3;
  let d = new Date(`${p.from}T12:00:00`);
  let count = 0;
  while (d <= end) {
    if (d >= today) count++;
    d = new Date(d.getFullYear(), d.getMonth() + step, d.getDate(), 12);
  }
  return { count, total: count * p.amount };
}
