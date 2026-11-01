// Pure maths behind the foundation calculators, kept apart from the UI so the worked examples can be checked.

import { PAY } from "@/lib/pay";
import { federalTax, quebecTax, taxYear } from "@/lib/payslips/tax";

export interface Debt {
  name: string;
  balance: number;
  /** yearly percentage rate */
  rate: number;
  /** fixed monthly minimum */
  min: number;
}

export interface Payoff {
  months: number;
  interest: number;
}

const LIMIT = 1200;

/** Pays a percentage of the balance each month, never less than the floor: how a card's minimum payment works. */
export function minimumPayoff(balance: number, annualPct: number, pct: number, floor = 10): Payoff {
  const r = annualPct / 1200;
  let left = balance;
  let interest = 0;
  let months = 0;
  while (left > 0.005 && months < LIMIT) {
    const charge = left * r;
    interest += charge;
    left += charge - Math.min(left + charge, Math.max(left * pct, floor));
    months += 1;
  }
  return { months, interest };
}

/** Pays one fixed amount every month until the balance is gone. */
export function fixedPayoff(balance: number, annualPct: number, payment: number): Payoff {
  const r = annualPct / 1200;
  let left = balance;
  let interest = 0;
  let months = 0;
  while (left > 0.005 && months < LIMIT) {
    const charge = left * r;
    interest += charge;
    left = Math.max(0, left + charge - payment);
    months += 1;
  }
  return { months, interest };
}

/** Pays every minimum, then sends everything spare to the first debt in the order. The monthly budget stays fixed as debts clear. */
function payDown(debts: Debt[], extra: number, order: (a: Debt, b: Debt) => number): Payoff {
  const live = debts.map((d) => ({ ...d }));
  const budget = live.reduce((sum, d) => sum + d.min, extra);
  let interest = 0;
  let months = 0;
  while (live.some((d) => d.balance > 0.005) && months < LIMIT) {
    months += 1;
    let spare = budget;
    for (const d of live) {
      const charge = (d.balance * d.rate) / 1200;
      d.balance += charge;
      interest += charge;
    }
    for (const d of live) {
      const paid = Math.min(d.balance, d.min);
      d.balance -= paid;
      spare -= paid;
    }
    for (const d of [...live].sort(order)) {
      const paid = Math.min(d.balance, spare);
      d.balance -= paid;
      spare -= paid;
    }
  }
  return { months, interest };
}

/** Highest interest rate first. */
export const avalanche = (debts: Debt[], extra: number) => payDown(debts, extra, (a, b) => b.rate - a.rate);

/** Smallest balance first. Cleared debts sort to the front and take nothing, so the spare money moves on to the next. */
export const snowball = (debts: Debt[], extra: number) => payDown(debts, extra, (a, b) => a.balance - b.balance);

/** Years until savings reach 25 times yearly spending, starting from zero, at a real return. */
export function yearsToIndependence(savingsRate: number, realPct: number): number {
  const r = realPct / 1200;
  const target = 300 * (1 - savingsRate);
  return Math.log(1 + (target * r) / savingsRate) / Math.log(1 + r) / 12;
}

/** Yearly return and a bad-year estimate for a mix of stocks and bonds. */
export function mixOutlook(stockPct: number) {
  const s = stockPct / 100;
  return { yearly: s * 7 + (1 - s) * 3.5, badYear: s * -35 + (1 - s) * -5 };
}

/** Extra income tax on side profit, added on top of your salary and pension. Leaves out QPIP and the health services fund. */
export function sideIncomeTax(profit: number, year = 2026): number {
  const p = taxYear(year);
  const pension = PAY.salary * PAY.pensionRate;
  const fedTaxable = PAY.salary - pension;
  const qcTaxable = fedTaxable + PAY.employerHealth * 12;
  const tax = (extra: number) => {
    const i = { gross: PAY.salary, fedTaxable: fedTaxable + extra, qcTaxable: qcTaxable + extra };
    return federalTax(i, p) + quebecTax(i, p);
  };
  return tax(profit) - tax(0);
}

/** The hourly rate that reaches a yearly profit, once unpaid hours and business costs are counted. */
export const freelanceRate = (profit: number, costs: number, billableHoursPerWeek: number, weeks: number) => (profit + costs) / (billableHoursPerWeek * weeks);

/** Subscribers after some months, adding the same number each month while a share cancels. */
export const subscribersAfter = (monthlyNew: number, churnPct: number, months: number) => {
  const c = churnPct / 100;
  return c === 0 ? monthlyNew * months : (monthlyNew * (1 - Math.pow(1 - c, months))) / c;
};

/** After-tax value of $1,000 of pre-tax income put in a TFSA or an RRSP. */
export function tfsaVsRrsp(amount: number, nowPct: number, laterPct: number, years: number, annualPct: number) {
  const growth = Math.pow(1 + annualPct / 100, years);
  return { tfsa: amount * (1 - nowPct / 100) * growth, rrsp: amount * growth * (1 - laterPct / 100) };
}
