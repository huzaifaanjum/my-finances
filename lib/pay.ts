// One place for the pay facts every tab uses, from your October 2026 payslip and the Manulife
// coverage summary. When payslips are unlocked, the Payslips and Pension tabs use the latest one
// directly; everywhere else (and while locked) these figures are the reference.

import { COSTS, LSA_MONTHLY } from "./benefits";
import { marginalFor } from "./payslips/tax";
import type { PayslipData } from "./payslips/types";

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
  /** what lands on payday from each $2,500 signing payment (Feb and Aug 2027), per the payslip forecast */
  signingNet: 1_400,
  /** what lands on payday from the first, prorated incentive (March 2027) */
  firstAipNet: 1_550,
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

/**
 * The October 2026 payslip as data (no personal identifiers), so pay can be broken down without
 * unlocking the encrypted Payslips tab. Retro lines with nothing this period are left out.
 */
export const REFERENCE_PAYSLIP: PayslipData = {
  employer: "Air Canada",
  jobTitle: "Full-stack Developer",
  periodStart: "2026-10-01",
  periodEnd: "2026-10-31",
  payDate: "2026-10-30",
  advice: "",
  payRate: 7_917,
  payFrequency: "Monthly",
  earnings: [{ label: "Basic Salary", current: 7_917, ytd: 19_664.81 }],
  preTax: [{ label: "DC Pension Mgmt & Non", current: 475.02, ytd: 1_064.96 }],
  taxes: [
    { label: "Employment Insurance", current: 102.92, ytd: 255.64 },
    { label: "Quebec Parental Ins P", current: 34.04, ytd: 84.56 },
    { label: "Quebec Pension Plan", current: 496.13, ytd: 1_230.95 },
    { label: "Canadian Income Tax", current: 796.61, ytd: 1_835.4 },
    { label: "Quebec Income Tax", current: 975.97, ytd: 2_276.15 },
  ],
  afterTax: [
    { label: "Employee AD&D", current: 3.49, ytd: 6.98 },
    { label: "Dental", current: 46.82, ytd: 93.64 },
    { label: "Long Term Disability", current: 165.56, ytd: 331.12 },
    { label: "Employee Life", current: 54.94, ytd: 109.88 },
    { label: "Short Term Disability", current: 22.72, ytd: 45.44 },
  ],
  employerPaid: [
    { label: "DC Pension Mgmt &", current: 475.02, ytd: 1_064.96, taxable: "N" },
    { label: "Dental", current: 37.11, ytd: 74.22, taxable: "P" },
    { label: "Extended Health", current: 212.55, ytd: 425.1, taxable: "P" },
  ],
  current: { gross: 7_917, citTaxable: 7_441.98, qitTaxable: 7_691.64, taxes: 2_405.67, deductions: 768.55, net: 4_742.78 },
  ytd: { gross: 19_664.81, citTaxable: 18_599.85, qitTaxable: 19_348.83, taxes: 5_682.7, deductions: 1_945.55, net: 12_036.56 },
  note: "",
};
