// Your 2026 tax return, estimated from your payslips at both employers, and what each claim adds to the refund.
// The 2026 tax year runs Jan 1 to Dec 31. FlexSpring paid you to Aug 17; Air Canada from Aug 17.
// Everything here can be replaced with the real T4 and RL-1 figures once they arrive (end of February 2027).

import { REFERENCE_PAYSLIP } from "@/lib/pay";
import { federalTax, quebecTax, taxYear, type YearIncome } from "@/lib/payslips/tax";

const P = taxYear(2026);

/** One employer's year, as it will appear on the T4 / RL-1. */
export interface Slip {
  /** employment income (T4 box 14) */
  gross: number;
  /** registered pension plan contributions you made (T4 box 20), a deduction */
  rpp: number;
  /** benefits Quebec taxes but Ottawa doesn't (employer-paid health and dental) */
  qcBenefits: number;
  fedTax: number;
  qcTax: number;
  qpp: number;
  ei: number;
  qpip: number;
}

export const SLIP_FIELDS: { key: keyof Slip; label: string }[] = [
  { key: "gross", label: "Employment income (T4 box 14)" },
  { key: "rpp", label: "Pension contributions (T4 box 20)" },
  { key: "qcBenefits", label: "Quebec-only taxable benefits" },
  { key: "fedTax", label: "Federal tax withheld (T4 box 22)" },
  { key: "qcTax", label: "Quebec tax withheld (RL-1 box E)" },
  { key: "qpp", label: "QPP withheld" },
  { key: "ei", label: "EI withheld" },
  { key: "qpip", label: "QPIP withheld" },
];

/* ---------- FlexSpring: payslips to June 30, net pay after that ---------- */

const fedB: [number, number][] = [[58_523, 0.14], [117_045, 0.205], [181_440, 0.26], [258_482, 0.29], [Infinity, 0.33]];
const qcB: [number, number][] = [[54_345, 0.14], [108_680, 0.19], [132_245, 0.24], [Infinity, 0.2575]];
const brackets = (x: number, b: [number, number][]) => {
  let t = 0;
  let from = 0;
  for (const [upTo, r] of b) {
    if (x <= from) break;
    t += (Math.min(x, upTo) - from) * r;
    from = upTo;
  }
  return t;
};

/** What one bi-weekly paycheque withholds at gross G. Reproduces your April and June FlexSpring payslips to the cent. */
export function biweeklyWithholding(G: number) {
  const A = G * 26;
  const qpp = 0.063 * Math.max(0, G - 3500 / 26);
  const ei = 0.013 * G;
  const qpip = 0.0043 * G;
  const qppBase = (qpp * 26 * 0.053) / 0.063;
  const enhanced = qpp * 26 - qppBase;
  const fedTax = (Math.max(0, brackets(A - enhanced, fedB) - 0.14 * (16_452 + Math.min(1_501, A) + qppBase + ei * 26 + qpip * 26)) * (1 - 0.165)) / 26;
  const qcTax = Math.max(0, brackets(A - enhanced - Math.min(0.06 * A, 1_450), qcB) - 0.14 * 18_952) / 26;
  return { fedTax, qcTax, qpp, ei, qpip, net: G - fedTax - qcTax - qpp - ei - qpip };
}

/** Gross pay that leaves a given net, by bisection. */
export function grossFromNet(net: number): number {
  let lo = net;
  let hi = net * 2;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (biweeklyWithholding(m).net < net) lo = m;
    else hi = m;
  }
  return lo;
}

/** Year-to-date on the June 30 FlexSpring payslip. */
export const FLEX_JUNE_YTD = { gross: 22_637.11, fedTax: 1_487.48, qcTax: 1_793.13, qpp: 1_315.9, ei: 294.28, qpip: 97.34, net: 17_648.98 };
/** Net pay after June: three cheques at the new rate, then the last one after you left on Aug 17. */
export const FLEX_LATER_NETS = [1_962.7, 1_962.7, 1_962.7, 2_224.12];

export function flexSlip(): Slip {
  const s: Slip = { gross: FLEX_JUNE_YTD.gross, rpp: 0, qcBenefits: 0, fedTax: FLEX_JUNE_YTD.fedTax, qcTax: FLEX_JUNE_YTD.qcTax, qpp: FLEX_JUNE_YTD.qpp, ei: FLEX_JUNE_YTD.ei, qpip: FLEX_JUNE_YTD.qpip };
  for (const net of FLEX_LATER_NETS) {
    const g = grossFromNet(net);
    const w = biweeklyWithholding(g);
    s.gross += g;
    s.fedTax += w.fedTax;
    s.qcTax += w.qcTax;
    s.qpp += w.qpp;
    s.ei += w.ei;
    s.qpip += w.qpip;
  }
  return s;
}

/* ---------- Air Canada: October payslip year to date, plus November and December ---------- */

const line = (list: { label: string; current: number; ytd: number }[], re: RegExp) => list.find((l) => re.test(l.label)) ?? { current: 0, ytd: 0 };

/** Paydays left in 2026 after the latest Air Canada payslip (Nov 30 and Dec 31). */
export const AC_PAYDAYS_LEFT = 2;

export function airCanadaSlip(): Slip {
  const d = REFERENCE_PAYSLIP;
  const n = AC_PAYDAYS_LEFT;
  const both = (re: RegExp, list = d.taxes) => {
    const l = line(list, re);
    return l.ytd + l.current * n;
  };
  return {
    gross: d.ytd.gross + d.current.gross * n,
    rpp: both(/pension/i, d.preTax),
    qcBenefits: d.ytd.qitTaxable - d.ytd.citTaxable + (d.current.qitTaxable - d.current.citTaxable) * n,
    fedTax: both(/canadian income tax|federal/i),
    qcTax: both(/quebec income tax/i),
    qpp: both(/pension plan/i),
    ei: both(/employment insurance/i),
    qpip: both(/parental/i),
  };
}

/* ---------- the return ---------- */

export interface Claims {
  rrsp: number;
  fhsa: number;
  moving: number;
  medical: number;
  donations: number;
  tuition: number;
  homeOffice: number;
  loanInterest: number;
  /** tuition fees carried forward from past returns, used this year */
  qcTuitionCarry: number;
  fedTuitionCarry: number;
  /** Canada training credit you can still use (from your CRA notice) */
  ctcLimit: number;
}

export const NO_CLAIMS: Claims = { rrsp: 0, fhsa: 0, moving: 0, medical: 0, donations: 0, tuition: 0, homeOffice: 0, loanInterest: 0, qcTuitionCarry: 0, fedTuitionCarry: 0, ctcLimit: 0 };

/** Federal medical expense threshold cap (2025 figure; indexed a little each year). */
const MED_FED_CAP = 2_834;
const ABATE = 1 - P.fed.abatement;

export interface TaxReturn {
  gross: number;
  netIncome: number;
  fedTax: number;
  qcTax: number;
  fedWithheld: number;
  qcWithheld: number;
  /** contributions withheld above the yearly maximum, refunded on the return */
  overpaid: { qpp: number; ei: number; qpip: number };
  fedRefund: number;
  qcRefund: number;
  refund: number;
}

export function estimateReturn(slips: Slip[], c: Claims): TaxReturn {
  const sum = (k: keyof Slip) => slips.reduce((t, s) => t + s[k], 0);
  const gross = sum("gross");
  const deductions = sum("rpp") + c.rrsp + c.fhsa + c.moving + c.homeOffice;
  const fedTaxable = Math.max(0, gross - deductions);
  const income: YearIncome = { gross, fedTaxable, qcTaxable: fedTaxable + sum("qcBenefits") };
  const netIncome = fedTaxable;

  // non-refundable credits: medical above 3% of net income, donations, tuition, student loan interest
  const medFed = Math.max(0, c.medical - Math.min(0.03 * netIncome, MED_FED_CAP));
  const medQc = Math.max(0, c.medical - 0.03 * income.qcTaxable);
  const donFed = 0.14 * Math.min(200, c.donations) + 0.29 * Math.max(0, c.donations - 200);
  const donQc = 0.2 * Math.min(200, c.donations) + 0.24 * Math.max(0, c.donations - 200);
  // the Canada training credit refunds half of this year's fees up to your limit; those fees then can't also earn the tuition credits
  const ctc = Math.min(0.5 * c.tuition, c.ctcLimit);
  const tuition = c.tuition - ctc;
  const fedCredits = (0.14 * (medFed + tuition + c.fedTuitionCarry + c.loanInterest) + donFed) * ABATE;
  const qcCredits = 0.2 * medQc + donQc + 0.08 * (tuition + c.qcTuitionCarry) + 0.2 * c.loanInterest;

  const fedTax = Math.max(0, federalTax(income, P) - fedCredits);
  const qcTax = Math.max(0, quebecTax(income, P) - qcCredits);

  // each employer deducts payroll plans from zero, so changing jobs can take more than the yearly maximum
  const pensionable = gross + sum("qcBenefits");
  const qppDue = P.qpp.rate * Math.min(Math.max(0, pensionable - P.qpp.exemption), P.qpp.ympe - P.qpp.exemption) + P.qpp.rate2 * Math.min(Math.max(0, pensionable - P.qpp.ympe), P.qpp.yampe - P.qpp.ympe);
  const overpaid = {
    qpp: Math.max(0, sum("qpp") - qppDue),
    ei: Math.max(0, sum("ei") - P.ei.rate * Math.min(gross, P.ei.maxInsurable)),
    qpip: Math.max(0, sum("qpip") - P.qpip.rate * Math.min(gross, P.qpip.maxInsurable)),
  };
  const fedWithheld = sum("fedTax");
  const qcWithheld = sum("qcTax");
  // EI comes back on the federal return; QPP and QPIP on the Quebec one
  const fedRefund = fedWithheld - fedTax + overpaid.ei + ctc;
  const qcRefund = qcWithheld - qcTax + overpaid.qpp + overpaid.qpip;
  return { gross, netIncome, fedTax, qcTax, fedWithheld, qcWithheld, overpaid, fedRefund, qcRefund, refund: fedRefund + qcRefund };
}

/** What one claim adds to the refund on its own, on top of everything else you entered. */
export function claimValue(slips: Slip[], c: Claims, key: keyof Claims): number {
  return estimateReturn(slips, c).refund - estimateReturn(slips, { ...c, [key]: 0 }).refund;
}
