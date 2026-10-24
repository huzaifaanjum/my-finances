// One place for the pay facts every tab uses, from your October 2026 payslip and the Manulife
// coverage summary. When payslips are unlocked, the Payslips and Pension tabs use the latest one
// directly; everywhere else (and while locked) these figures are the reference.

import { COSTS, LSA_MONTHLY } from "./benefits";
import { marginalFor } from "./payslips/tax";

export const PAY = {
  source: "your October 2026 payslip",
  /** "Pay Rate: $7,917.00 Monthly" */
  monthlyBase: 7_917,
  salary: 7_917 * 12,
  /** DC pension: 6% from you, matched 6% */
  pensionRate: 0.06,
  matchRate: 0.06,
  /** October's deposit, with no one-time items on it */
  usualNet: 4_742.78,
  /** after-tax insurance deductions: LTD, STD, life, dental, AD&D (Manulife price + 9% premium tax) */
  insurance: COSTS.youTotal,
  /** employer-paid health and dental, Quebec-taxable ("P-" lines on the payslip) */
  employerHealth: COSTS.employerTaxable,
  /** Lifestyle Spending Account, not on payslips */
  lsa: LSA_MONTHLY,
};

/** Marginal tax rate, what you keep of an extra $1,000, and what $1,000 in an RRSP saves, at your payslip's pay. */
export function payMarginal(year = new Date().getFullYear() + 1) {
  return marginalFor({ base: PAY.monthlyBase, pension: PAY.monthlyBase * PAY.pensionRate, benefits: PAY.employerHealth }, year);
}

/** Of each extra dollar of salary, what reaches your account after the 6% pension, tax and payroll plans. */
export function takeHomePerGross(year?: number): number {
  const m = payMarginal(year);
  const payroll = 1 - m.keep / 1000 - m.rate;
  return (1 - PAY.pensionRate) * (1 - m.rate) - payroll;
}

/** A one-time bonus after tax and payroll plans, at your marginal rate. */
export const bonusNet = (gross: number, year?: number) => (gross * payMarginal(year).keep) / 1000;
