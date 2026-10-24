// Where gross pay goes over a range of pay periods: income tax, government plans, your pension,
// insurance and take-home. Uses the payroll model behind the Payslips forecast (QPP and EI stop at
// their yearly maximums, bonuses are taxed at your marginal rate), with salary held flat like the budget.

import { OFFER } from "@/lib/offer";
import { employerPension, EI, FED_TAX, insurancePremiums, pensionLine, QC_TAX, QPIP, QPP, taxLine } from "./analysis";
import { forecast } from "./forecast";
import type { PayslipData } from "./types";

export interface BasePayOptions {
  /** the two $2,500 signing payments (Feb and Aug 2027) */
  signing: boolean;
  /** the yearly incentive, at the 8% target, paid each March (the first is prorated) */
  incentive: boolean;
}

export interface BasePayTotals {
  /** pay periods counted */
  months: number;
  /** base salary only */
  salary: number;
  signing: number;
  incentive: number;
  /** salary plus bonuses */
  gross: number;
  federalTax: number;
  quebecTax: number;
  incomeTax: number;
  qpp: number;
  ei: number;
  qpip: number;
  govPlans: number;
  pension: number;
  /** Air Canada's matching contribution, on top of gross */
  match: number;
  insurance: number;
  net: number;
}

const empty = (): BasePayTotals => ({
  months: 0,
  salary: 0,
  signing: 0,
  incentive: 0,
  gross: 0,
  federalTax: 0,
  quebecTax: 0,
  incomeTax: 0,
  qpp: 0,
  ei: 0,
  qpip: 0,
  govPlans: 0,
  pension: 0,
  match: 0,
  insurance: 0,
  net: 0,
});

/** Totals for these pay periods ({ year, month: 0-11 }). Periods up to the payslip itself use its own figures. */
export function basePayFor(ref: PayslipData, months: { year: number; month: number }[], opts: BasePayOptions): BasePayTotals {
  const t = empty();
  if (!months.length) return t;
  const refYear = Number(ref.periodEnd.slice(0, 4));
  const refMonth = Number(ref.periodEnd.slice(5, 7)) - 1;
  const last = months[months.length - 1];
  const years = Math.max(1, last.year - refYear + 1);
  const fc = forecast(ref, { raise: 0, bonus: opts.incentive ? OFFER.aipTarget : 0, growth: 0, signing: opts.signing }, years).months;
  // the model gives income tax as one total; split it like the payslip does
  const fedShare = taxLine(ref, FED_TAX) / (taxLine(ref, FED_TAX) + taxLine(ref, QC_TAX) || 1);

  for (const { year, month } of months) {
    if (year < refYear || (year === refYear && month <= refMonth)) {
      // a period already paid: the payslip's own numbers
      const fed = taxLine(ref, FED_TAX);
      const qc = taxLine(ref, QC_TAX);
      const qpp = taxLine(ref, QPP);
      const ei = taxLine(ref, EI);
      const qpip = taxLine(ref, QPIP);
      const pension = pensionLine(ref);
      const ins = insurancePremiums(ref);
      t.months++;
      t.salary += ref.current.gross;
      t.federalTax += fed;
      t.quebecTax += qc;
      t.qpp += qpp;
      t.ei += ei;
      t.qpip += qpip;
      t.pension += pension;
      t.match += employerPension(ref);
      t.insurance += ins;
      t.net += ref.current.gross - fed - qc - qpp - ei - qpip - pension - ins;
      continue;
    }
    const m = fc.find((x) => x.year === year && x.month === month);
    if (!m) continue;
    t.months++;
    t.salary += m.base;
    if (m.bonus) {
      // March carries the incentive; any other month's bonus is a signing payment
      if (month === 2) t.incentive += m.bonus;
      else t.signing += m.bonus;
    }
    t.federalTax += m.incomeTax * fedShare;
    t.quebecTax += m.incomeTax * (1 - fedShare);
    t.qpp += m.qpp;
    t.ei += m.ei;
    t.qpip += m.qpip;
    t.pension += m.pension;
    t.match += m.match;
    t.insurance += m.insurance;
    t.net += m.net;
  }
  t.gross = t.salary + t.signing + t.incentive;
  t.incomeTax = t.federalTax + t.quebecTax;
  t.govPlans = t.qpp + t.ei + t.qpip;
  return t;
}
