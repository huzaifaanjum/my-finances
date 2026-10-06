import { amortize, type Loan } from "./finance";
import type { Plan } from "./projection";

/** Closing costs as a share of the price: welcome tax, notary, inspection and the rest. */
export const CLOSING_RATE = 0.03;
/** Quebec charges 9% sales tax on the mortgage insurance premium, paid in cash at closing. */
export const QC_PREMIUM_TAX = 0.09;

/** CMHC mortgage insurance premium, as a share of the loan, by down payment percent. */
export function cmhcRate(dppPct: number): number {
  if (dppPct >= 20) return 0;
  if (dppPct >= 15) return 0.028;
  if (dppPct >= 10) return 0.031;
  return 0.04;
}

/** Legal minimum down payment: 5% of the first $500k and 10% of the rest. */
export function minDown(price: number): number {
  return Math.min(price, 500_000) * 0.05 + Math.max(0, price - 500_000) * 0.1;
}

/** Canadian fixed mortgages compound twice a year; this is the matching monthly-compounded rate. */
export const monthlyEquivalent = (ratePct: number) => (Math.pow(1 + ratePct / 200, 1 / 6) - 1) * 1200;

export interface HousePlan {
  price: number;
  dppPct: number;
  down: number;
  minDown: number;
  belowMin: boolean;
  premium: number;
  premiumTax: number;
  closing: number;
  /** down payment + closing costs + tax on the premium */
  cash: number;
  /** what you borrow, premium included */
  mortgage: number;
  rate: number;
  years: number;
  loan: Loan;
  /** extra paid on top of the regular payment each month */
  extra: number;
  withExtra: Loan;
  /** plan month you plan to buy */
  buy: number;
  savedAtBuy: number;
  /** first plan month savings cover the cash needed, or -1 */
  ready: number;
}

export function housePlan(plan: Plan, dppPct = plan.state.numbers.dpp): HousePlan {
  const { home: price, hrate: rate, hamort: years, hbuy: buy, hextra: extra } = plan.state.numbers;
  const down = (price * dppPct) / 100;
  const base = price - down;
  const premium = base * cmhcRate(dppPct);
  const premiumTax = premium * QC_PREMIUM_TAX;
  const closing = price * CLOSING_RATE;
  const cash = down + closing + premiumTax;
  const mortgage = base + premium;
  const min = minDown(price);
  return {
    price,
    dppPct,
    down,
    minDown: min,
    belowMin: down + 0.5 < min,
    premium,
    premiumTax,
    closing,
    cash,
    mortgage,
    rate,
    years,
    loan: amortize(mortgage, monthlyEquivalent(rate), years * 12),
    extra,
    withExtra: amortize(mortgage, monthlyEquivalent(rate), years * 12, extra),
    buy,
    savedAtBuy: plan.far[Math.min(buy, plan.far.length - 1)].balance,
    ready: plan.reachIndex(cash),
  };
}
