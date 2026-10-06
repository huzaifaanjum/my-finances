import { INCOME_STREAMS, PENSION_MONTHLY, SALARY } from "./config";
import { planIndex } from "./calendar";
import type { Plan } from "./projection";

/* ---------- loans ---------- */

export interface Loan {
  payment: number;
  months: number;
  interest: number;
  /** balance after each month, starting with the principal */
  balances: number[];
  /** what you pay each month, extra included; payments[k] is month k + 1 */
  payments: number[];
}

/** Level-payment loan, optionally with a fixed extra payment each month. */
export function amortize(principal: number, aprPct: number, termMonths: number, extra = 0): Loan {
  if (principal <= 0) return { payment: 0, months: 0, interest: 0, balances: [0], payments: [] };
  const r = aprPct / 1200;
  const payment = r ? (principal * r) / (1 - Math.pow(1 + r, -termMonths)) : principal / termMonths;
  let b = principal;
  let months = 0;
  let interest = 0;
  const balances = [principal];
  const payments: number[] = [];
  while (b > 0.005 && months < 600) {
    const i = b * r;
    const pay = Math.min(b + i, payment + extra);
    b = b + i - pay;
    interest += i;
    months++;
    balances.push(Math.max(0, b));
    payments.push(pay);
  }
  return { payment, months, interest, balances, payments };
}

/* ---------- investing ---------- */

export interface Simulation {
  /** balance at the end of each month */
  bal: number[];
  /** your own money put in by each month */
  inn: number[];
  /** first month the target is reached, or null */
  hit: number | null;
}

/** Monthly investing with a yearly increase in the contribution. */
export function simulateInvesting(
  start: number,
  monthly: number,
  returnPct: number,
  raisePct: number,
  target: number,
  months = 600,
): Simulation {
  const r = returnPct / 1200;
  let b = start;
  let c = monthly;
  let put = start;
  const bal = [b];
  const inn = [put];
  let hit: number | null = b >= target ? 0 : null;
  for (let m = 1; m <= months; m++) {
    b = b * (1 + r) + c;
    put += c;
    if (m % 12 === 0) c *= 1 + raisePct / 100;
    bal.push(b);
    inn.push(put);
    if (hit === null && b >= target) hit = m;
  }
  return { bal, inn, hit };
}

export interface InvestmentPlan {
  start: number;
  /** monthly amount invested */
  monthly: number;
  /** from the Insights income streams, 0 when switched off */
  streams: number;
  sim: Simulation;
}

export function investmentPlan(plan: Plan): InvestmentPlan {
  const { numbers, flags } = plan.state;
  const streams = flags.mil_rs ? INCOME_STREAMS.reduce((t, s) => t + numbers[s.key], 0) : 0;
  const start = plan.startBalance;
  const monthly = Math.max(0, plan.left) + numbers.mil_extra + streams;
  return {
    start,
    monthly,
    streams,
    sim: simulateInvesting(start, monthly, numbers.ret, numbers.rais, numbers.target),
  };
}

/* ---------- pension at 65 ---------- */

/** Born 2 Jul 1997, so 65 on 2 Jul 2062. */
export const RETIREMENT_DATE = new Date(2062, 6, 2);
export const RETIREMENT_MONTH = planIndex(RETIREMENT_DATE.getFullYear(), RETIREMENT_DATE.getMonth());

export interface PensionProjection {
  pot: number;
  /** pot in today's dollars */
  real: number;
  mine: number;
  match: number;
  growth: number;
  finalSalary: number;
  /** pot at the end of each month */
  pots: number[];
  deflator: (month: number) => number;
}

export function projectPension(plan: Plan): PensionProjection {
  const { ret_sg, ret_pr, ret_inf } = plan.state.numbers;
  const r = ret_pr / 1200;
  // Aug and Sep 2026 are already in: two months of each side's half.
  let pot = 2 * PENSION_MONTHLY;
  let mine = PENSION_MONTHLY;
  let match = PENSION_MONTHLY;
  let salary = SALARY;
  const pots = [pot];
  for (let m = 1; m <= RETIREMENT_MONTH; m++) {
    const c = (salary / 12) * 0.06;
    pot = pot * (1 + r) + 2 * c;
    mine += c;
    match += c;
    if (m % 12 === 0) salary *= 1 + ret_sg / 100;
    pots.push(pot);
  }
  const deflator = (m: number) => Math.pow(1 + ret_inf / 100, m / 12);
  return {
    pot,
    real: pot / deflator(RETIREMENT_MONTH),
    mine,
    match,
    growth: pot - mine - match,
    finalSalary: salary,
    pots,
    deflator,
  };
}
