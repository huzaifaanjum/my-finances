// Your DC pension so far, read from payslips.
// Year-to-date columns reset every January, so each year's last payslip is added up.

import { planIndex } from "@/lib/planner/calendar";
import { PENSION_FROM_OCT_PAYSLIP, type PensionStart } from "@/lib/planner/finance";
import { baseSalary, employerPension, pensionLine, periodLabel } from "./analysis";
import type { PayslipData } from "./types";

const PERIODS: Record<string, number> = { monthly: 12, "semi-monthly": 24, semimonthly: 24, biweekly: 26, "bi-weekly": 26, weekly: 52 };
const FIRST_YEAR = 2026;

/** Oldest first. Returns null when there are no dated payslips. */
export function pensionStartFrom(slips: PayslipData[]): PensionStart | null {
  const dated = slips.filter((d) => /^\d{4}-\d{2}/.test(d.periodEnd)).sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
  const latest = dated[dated.length - 1];
  if (!latest) return null;

  const lastOfYear = new Map<number, PayslipData>();
  for (const d of dated) lastOfYear.set(Number(d.periodEnd.slice(0, 4)), d);
  let mine = 0;
  let match = 0;
  for (const d of lastOfYear.values()) {
    mine += pensionLine(d, "ytd");
    match += employerPension(d, "ytd");
  }
  // no 2026 payslip saved: fall back to what October 2026's showed
  if (!lastOfYear.has(FIRST_YEAR)) {
    mine += PENSION_FROM_OCT_PAYSLIP.mine;
    match += PENSION_FROM_OCT_PAYSLIP.match;
  }

  const base = baseSalary(latest) || 1;
  const perYear = PERIODS[latest.payFrequency.toLowerCase()] ?? 12;
  return {
    salary: base * perYear,
    employeeRate: pensionLine(latest) / base,
    employerRate: employerPension(latest) / base,
    mine,
    match,
    through: planIndex(Number(latest.periodEnd.slice(0, 4)), Number(latest.periodEnd.slice(5, 7)) - 1),
    source: `your ${periodLabel(latest, true)} payslip`,
  };
}
