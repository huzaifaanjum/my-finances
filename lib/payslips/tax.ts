// 2026 federal and Quebec income tax and payroll figures for a Quebec employee.
// Later years are indexed by INDEX a year, the way the governments index brackets and maximums.
// The forecast scales the tax results to match the tax actually withheld on your latest payslip,
// so small differences from the real withholding tables cancel out.

export const BASE_YEAR = 2026;
export const INDEX = 0.02;

type Brackets = [upTo: number, rate: number][];

const Y2026 = {
  fed: {
    brackets: [
      [58_523, 0.14],
      [117_045, 0.205],
      [181_440, 0.26],
      [258_482, 0.29],
      [Infinity, 0.33],
    ] as Brackets,
    /** basic personal amount, matches "Net Claim Amt." on the payslip */
    bpa: 16_452,
    /** Canada employment amount */
    cea: 1_501,
    credit: 0.14,
    /** Quebec residents get 16.5% off basic federal tax */
    abatement: 0.165,
  },
  qc: {
    brackets: [
      [54_345, 0.14],
      [108_680, 0.19],
      [132_245, 0.24],
      [Infinity, 0.2575],
    ] as Brackets,
    bpa: 18_952,
    credit: 0.14,
    /** deduction for employment income: 6% of pay, capped */
    workRate: 0.06,
    workMax: 1_450,
  },
  qpp: { ympe: 74_600, yampe: 85_000, exemption: 3_500, rate: 0.063, baseRate: 0.053, rate2: 0.04 },
  ei: { maxInsurable: 68_900, rate: 0.013 },
  qpip: { maxInsurable: 103_000, rate: 0.0043 },
};

export type TaxYear = typeof Y2026;

/** The year's figures, indexed from 2026. */
export function taxYear(year: number): TaxYear {
  const f = Math.pow(1 + INDEX, Math.max(0, year - BASE_YEAR));
  const ix = (b: Brackets): Brackets => b.map(([u, r]) => [u * f, r]);
  return {
    fed: { ...Y2026.fed, brackets: ix(Y2026.fed.brackets), bpa: Y2026.fed.bpa * f, cea: Y2026.fed.cea * f },
    qc: { ...Y2026.qc, brackets: ix(Y2026.qc.brackets), bpa: Y2026.qc.bpa * f, workMax: Y2026.qc.workMax * f },
    qpp: { ...Y2026.qpp, ympe: Y2026.qpp.ympe * f, yampe: Y2026.qpp.yampe * f },
    ei: { ...Y2026.ei, maxInsurable: Y2026.ei.maxInsurable * f },
    qpip: { ...Y2026.qpip, maxInsurable: Y2026.qpip.maxInsurable * f },
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function bracketTax(income: number, brackets: Brackets): number {
  let tax = 0;
  let from = 0;
  for (const [upTo, rate] of brackets) {
    if (income <= from) break;
    tax += (Math.min(income, upTo) - from) * rate;
    from = upTo;
  }
  return tax;
}

/** Yearly maximums for QPP (first and second tier), EI and QPIP. */
export function payrollMax(p: TaxYear) {
  return {
    qpp1: p.qpp.rate * (p.qpp.ympe - p.qpp.exemption),
    qpp2: p.qpp.rate2 * (p.qpp.yampe - p.qpp.ympe),
    ei: p.ei.rate * p.ei.maxInsurable,
    qpip: p.qpip.rate * p.qpip.maxInsurable,
  };
}

/** A full year of contributions on a steady income, split into the parts that earn credits and deductions. */
function contributions(gross: number, pensionable: number, p: TaxYear) {
  const first = p.qpp.rate * clamp(pensionable - p.qpp.exemption, 0, p.qpp.ympe - p.qpp.exemption);
  const second = p.qpp.rate2 * clamp(pensionable - p.qpp.ympe, 0, p.qpp.yampe - p.qpp.ympe);
  return {
    qppBase: (first * p.qpp.baseRate) / p.qpp.rate,
    /** the enhanced part of QPP is a deduction, not a credit */
    qppEnhanced: (first * (p.qpp.rate - p.qpp.baseRate)) / p.qpp.rate + second,
    ei: Math.min(gross, p.ei.maxInsurable) * p.ei.rate,
    qpip: Math.min(gross, p.qpip.maxInsurable) * p.qpip.rate,
  };
}

export interface YearIncome {
  /** salary and bonuses */
  gross: number;
  /** gross minus before-tax deductions such as the pension */
  fedTaxable: number;
  /** federal taxable plus benefits Quebec taxes (employer-paid health and dental) */
  qcTaxable: number;
}

const pensionableOf = (i: YearIncome) => i.gross + (i.qcTaxable - i.fedTaxable);

/** Federal tax for a Quebec resident, after the Quebec abatement. */
export function federalTax(i: YearIncome, p: TaxYear): number {
  const c = contributions(i.gross, pensionableOf(i), p);
  const basic = bracketTax(Math.max(0, i.fedTaxable - c.qppEnhanced), p.fed.brackets);
  const credits = p.fed.credit * (p.fed.bpa + Math.min(p.fed.cea, i.gross) + c.qppBase + c.ei + c.qpip);
  return Math.max(0, basic - credits) * (1 - p.fed.abatement);
}

export function quebecTax(i: YearIncome, p: TaxYear): number {
  const c = contributions(i.gross, pensionableOf(i), p);
  const work = Math.min(p.qc.workRate * i.gross, p.qc.workMax);
  const basic = bracketTax(Math.max(0, i.qcTaxable - c.qppEnhanced - work), p.qc.brackets);
  return Math.max(0, basic - p.qc.credit * p.qc.bpa);
}

/** Income tax plus payroll contributions on a full year, before any calibration. */
export function yearlyCost(i: YearIncome, p: TaxYear): number {
  const c = contributions(i.gross, pensionableOf(i), p);
  const max = payrollMax(p);
  const qpp = Math.min(c.qppBase + c.qppEnhanced, max.qpp1 + max.qpp2);
  return federalTax(i, p) + quebecTax(i, p) + qpp + c.ei + c.qpip;
}

function annualised(base: number, pension: number, benefits: number): YearIncome {
  return { gross: base * 12, fedTaxable: (base - pension) * 12, qcTaxable: (base - pension + benefits) * 12 };
}

const plus = (i: YearIncome, extra: number): YearIncome => ({ gross: i.gross + extra, fedTaxable: i.fedTaxable + extra, qcTaxable: i.qcTaxable + extra });

/** The same, from monthly base pay, pension contribution and Quebec-taxable benefits (no payslip needed). */
export function marginalFor(m: { base: number; pension: number; benefits: number }, year: number) {
  const p = taxYear(year);
  const i = annualised(m.base, m.pension, m.benefits);
  const tax = (x: YearIncome) => federalTax(x, p) + quebecTax(x, p);
  const extraTax = tax(plus(i, 1000)) - tax(i);
  // payroll plans only take a cut while you are under their yearly maximums
  const pensionable = i.qcTaxable + (i.gross - i.fedTaxable);
  const payroll =
    1000 *
    ((pensionable < p.qpp.ympe ? p.qpp.rate : pensionable < p.qpp.yampe ? p.qpp.rate2 : 0) +
      (i.gross < p.ei.maxInsurable ? p.ei.rate : 0) +
      (i.gross < p.qpip.maxInsurable ? p.qpip.rate : 0));
  const rrsp = tax(i) - tax({ ...i, fedTaxable: i.fedTaxable - 1000, qcTaxable: i.qcTaxable - 1000 });
  return {
    keep: 1000 - extraTax - payroll,
    /** combined federal + Quebec marginal tax rate */
    rate: extraTax / 1000,
    qcRate: (quebecTax(plus(i, 1000), p) - quebecTax(i, p)) / 1000,
    rrsp,
  };
}
