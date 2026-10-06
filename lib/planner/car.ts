import { amortize, type Loan } from "./finance";
import type { Plan } from "./projection";
import type { MonthRow } from "./types";

/** GST 5% + QST 9.975% */
export const QC_SALES_TAX = 0.14975;

export interface CarPlan {
  price: number;
  tax: number;
  down: number;
  principal: number;
  apr: number;
  term: number;
  extra: number;
  /** plan month you buy in */
  buy: number;
  regular: Loan;
  withExtra: Loan;
  /** projected savings in the month you buy */
  savedAtBuy: number;
  /** first month savings cover the down payment */
  downReady: MonthRow | undefined;
}

export function carPlan(plan: Plan): CarPlan {
  const { cprice, cdown, capr, cterm, cextra, cbuy } = plan.state.numbers;
  const tax = plan.state.flags.ctax ? cprice * QC_SALES_TAX : 0;
  const down = Math.min(cdown, cprice + tax);
  const principal = Math.max(0, cprice + tax - down);
  return {
    price: cprice,
    tax,
    down,
    principal,
    apr: capr,
    term: cterm,
    extra: cextra,
    buy: cbuy,
    regular: amortize(principal, capr, cterm),
    withExtra: amortize(principal, capr, cterm, cextra),
    savedAtBuy: plan.far[cbuy].balance,
    downReady: plan.far.find((r) => r.balance >= down),
  };
}

export const yearsLabel = (months: number) => (months % 12 === 0 ? `${months / 12} yr` : `${(months / 12).toFixed(1)} yr`);
