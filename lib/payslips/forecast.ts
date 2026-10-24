// Month-by-month pay forecast built from your latest payslip.
// Each month works like payroll does: QPP, EI and QPIP stop once the year's maximum is reached,
// income tax is withheld on the month's pay as if it were paid all year, and bonuses are taxed
// at your marginal rate. Tax is scaled to match what your latest payslip actually withheld.

import { OFFER } from "@/lib/offer";
import { RETIREMENT_DATE } from "@/lib/planner/finance";
import {
  baseSalary,
  EI,
  employerPension,
  FED_TAX,
  insurancePremiums,
  pensionLine,
  QC_TAX,
  QPIP,
  QPP,
  quebecTaxableBenefits,
  taxLine,
} from "./analysis";
import { federalTax, INDEX, marginalFor, payrollMax, quebecTax, taxYear, type TaxYear, type YearIncome } from "./tax";

export { marginalFor };
import type { PayslipData } from "./types";

export interface ForecastSettings {
  /** yearly raise, e.g. 0.03, applied each January */
  raise: number;
  /** annual incentive as a share of salary, paid each March for the year before */
  bonus: number;
  /** yearly return on the DC pension */
  growth: number;
  /** false leaves out the two signing payments (the incentive is left out with bonus: 0) */
  signing?: boolean;
}

export interface ForecastMonth {
  year: number;
  /** 0-11 */
  month: number;
  base: number;
  bonus: number;
  gross: number;
  incomeTax: number;
  govPlans: number;
  qpp: number;
  ei: number;
  qpip: number;
  pension: number;
  insurance: number;
  net: number;
  /** what your employer adds to the DC pension */
  match: number;
  /** DC pension balance at the end of the month */
  pot: number;
  retired: boolean;
}

export interface Forecast {
  months: ForecastMonth[];
  /** tax-model scale factors, 1 = the model matched your payslip exactly */
  calibration: { fed: number; qc: number };
  /** salary per pay period on the payslip, annualised */
  salary: number;
}

const PERIODS: Record<string, number> = { monthly: 12, "semi-monthly": 24, semimonthly: 24, biweekly: 26, "bi-weekly": 26, weekly: 52 };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function annualised(base: number, pension: number, benefits: number): YearIncome {
  return { gross: base * 12, fedTaxable: (base - pension) * 12, qcTaxable: (base - pension + benefits) * 12 };
}

const plus = (i: YearIncome, extra: number): YearIncome => ({
  gross: i.gross + extra,
  fedTaxable: i.fedTaxable + extra,
  qcTaxable: i.qcTaxable + extra,
});

/** First month after the payslip's period. */
function startAfter(d: PayslipData): { year: number; month: number } {
  const m = d.periodEnd.match(/^(\d{4})-(\d{2})/);
  const y = m ? Number(m[1]) : new Date().getFullYear();
  const mo = m ? Number(m[2]) : new Date().getMonth() + 1;
  return mo === 12 ? { year: y + 1, month: 0 } : { year: y, month: mo };
}

/** Share of the first incentive you earn, by start date (prorated for the first year). */
function firstBonusShare(): { year: number; share: number } {
  const start = new Date(`${OFFER.start}T00:00:00`);
  const end = new Date(start.getFullYear(), 11, 31);
  return { year: start.getFullYear(), share: (end.getTime() - start.getTime()) / (365 * 864e5) };
}

/** `pensionSoFar` is everything contributed to the DC pension across all years (see pensionStartFrom). */
export function forecast(latest: PayslipData, s: ForecastSettings, years = 50, pensionSoFar?: number): Forecast {
  const perYear = PERIODS[latest.payFrequency.toLowerCase()] ?? 12;
  const base0 = (baseSalary(latest) * perYear) / 12;
  const salary = base0 * 12;
  const dc = pensionLine(latest) / (baseSalary(latest) || 1);
  const matchRate = employerPension(latest) / (baseSalary(latest) || 1);
  const benefits0 = quebecTaxableBenefits(latest);
  const insurance0 = insurancePremiums(latest);
  const slipYear = Number(latest.periodEnd.slice(0, 4)) || new Date().getFullYear();

  // scale the model to the tax this payslip withheld
  const p0 = taxYear(slipYear);
  const slipIncome = {
    gross: latest.current.gross * 12,
    fedTaxable: latest.current.citTaxable * 12,
    qcTaxable: latest.current.qitTaxable * 12,
  };
  const fedModel = federalTax(slipIncome, p0) / 12;
  const qcModel = quebecTax(slipIncome, p0) / 12;
  const kFed = fedModel > 0 ? clamp(taxLine(latest, FED_TAX) / fedModel, 0.75, 1.3) : 1;
  const kQc = qcModel > 0 ? clamp(taxLine(latest, QC_TAX) / qcModel, 0.75, 1.3) : 1;

  const start = startAfter(latest);
  const retireYear = RETIREMENT_DATE.getFullYear();
  const retireMonth = RETIREMENT_DATE.getMonth();
  const firstBonus = firstBonusShare();
  const signing = OFFER.signing.map((x) => ({ year: Number(x.date.slice(0, 4)), month: Number(x.date.slice(5, 7)) - 1, amount: x.amount }));
  const monthlyGrowth = Math.pow(1 + s.growth, 1 / 12) - 1;

  // running totals for the payslip's year come from its YTD column
  let ytd = {
    year: slipYear,
    qpp1: taxLine(latest, QPP, "ytd"),
    pensionable: latest.ytd.qitTaxable + pensionLine(latest, "ytd"),
    ei: taxLine(latest, EI, "ytd"),
    qpip: taxLine(latest, QPIP, "ytd"),
  };
  // contributions so far stand in for today's balance
  let pot = pensionSoFar ?? pensionLine(latest, "ytd") + employerPension(latest, "ytd");
  let p: TaxYear = p0;
  let max = payrollMax(p);

  const months: ForecastMonth[] = [];
  for (let k = 0; k < years * 12; k++) {
    const month = (start.month + k) % 12;
    const year = start.year + Math.floor((start.month + k) / 12);
    if (year !== ytd.year) {
      ytd = { year, qpp1: 0, pensionable: 0, ei: 0, qpip: 0 };
      p = taxYear(year);
      max = payrollMax(p);
    }
    const retired = year > retireYear || (year === retireYear && month > retireMonth);
    if (retired) {
      months.push({ year, month, base: 0, bonus: 0, gross: 0, incomeTax: 0, govPlans: 0, qpp: 0, ei: 0, qpip: 0, pension: 0, insurance: 0, net: 0, match: 0, pot, retired });
      continue;
    }

    const raises = year - start.year;
    const grow = Math.pow(1 + s.raise, raises);
    const base = base0 * grow;
    const benefits = benefits0 * Math.pow(1 + INDEX, raises);
    const insurance = insurance0 * grow;

    let bonus = 0;
    if (month === 2 && s.bonus > 0) {
      const prevSalary = base0 * 12 * Math.pow(1 + s.raise, Math.max(0, raises - 1));
      const share = year - 1 === firstBonus.year ? firstBonus.share : year - 1 > firstBonus.year ? 1 : 0;
      bonus += prevSalary * s.bonus * share;
    }
    if (s.signing !== false) for (const sg of signing) if (sg.year === year && sg.month === month) bonus += sg.amount;

    const gross = base + bonus;
    const pension = dc * base;
    const match = matchRate * base;

    // payroll contributions, stopping at the yearly maximums
    const pensionable = gross + benefits;
    const qpp1 = clamp(p.qpp.rate * (pensionable - p.qpp.exemption / 12), 0, Math.max(0, max.qpp1 - ytd.qpp1));
    const qpp2 =
      p.qpp.rate2 * (clamp(ytd.pensionable + pensionable, p.qpp.ympe, p.qpp.yampe) - clamp(ytd.pensionable, p.qpp.ympe, p.qpp.yampe));
    const ei = clamp(p.ei.rate * gross, 0, Math.max(0, max.ei - ytd.ei));
    const qpip = clamp(p.qpip.rate * gross, 0, Math.max(0, max.qpip - ytd.qpip));
    ytd.qpp1 += qpp1;
    ytd.pensionable += pensionable;
    ytd.ei += ei;
    ytd.qpip += qpip;

    // withholding: the month's regular pay as if paid all year, bonuses at the marginal rate
    const regular = annualised(base, pension, benefits);
    let fed = federalTax(regular, p) / 12;
    let qc = quebecTax(regular, p) / 12;
    if (bonus) {
      fed += federalTax(plus(regular, bonus), p) - federalTax(regular, p);
      qc += quebecTax(plus(regular, bonus), p) - quebecTax(regular, p);
    }
    const incomeTax = fed * kFed + qc * kQc;
    const qpp = qpp1 + qpp2;
    const govPlans = qpp + ei + qpip;
    pot = pot * (1 + monthlyGrowth) + pension + match;

    months.push({
      year,
      month,
      base,
      bonus,
      gross,
      incomeTax,
      govPlans,
      qpp,
      ei,
      qpip,
      pension,
      insurance,
      net: gross - incomeTax - govPlans - pension - insurance,
      match,
      pot,
      retired,
    });
  }
  return { months, calibration: { fed: kFed, qc: kQc }, salary };
}

/** On a full year at today's pay: what you keep of an extra $1,000 (a bonus, say) and what a $1,000 RRSP contribution saves. */
export function marginal(latest: PayslipData, year: number) {
  return marginalFor({ base: baseSalary(latest), pension: pensionLine(latest), benefits: quebecTaxableBenefits(latest) }, year);
}
