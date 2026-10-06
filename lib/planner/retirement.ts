import { money } from "@/lib/format";
import { investmentPlan, projectPension, RETIREMENT_MONTH, type InvestmentPlan, type PensionProjection } from "./finance";
import type { Plan } from "./projection";

export type Effort = "auto" | "org" | "act";

export interface IncomeSource {
  name: string;
  /** monthly, today's dollars */
  today: number;
  /** monthly, 2062 dollars */
  nominal: number;
  color: string;
  effort: Effort;
  why: string;
}

/** Rough 2026 estimates, today's dollars a month. */
const QPP_MONTHLY = 1450;
const OAS_MONTHLY = 740;

export interface Retirement {
  pension: PensionProjection;
  invest: InvestmentPlan;
  sources: IncomeSource[];
  /** monthly, today's dollars */
  total: number;
  totalNominal: number;
  /** total / today's take-home */
  replacement: number;
  status: "good" | "ok" | "bad";
}

export function retirement(plan: Plan): Retirement {
  const pension = projectPension(plan);
  const invest = investmentPlan(plan);
  const { ret_wr } = plan.state.numbers;
  const wr = ret_wr / 100;
  const inflation = pension.deflator(RETIREMENT_MONTH);
  const own = Math.max(0, invest.sim.bal[Math.min(RETIREMENT_MONTH, 600)]);

  const sources: IncomeSource[] = [
    {
      name: "Air Canada pension",
      today: (pension.real * wr) / 12,
      nominal: (pension.pot * wr) / 12,
      color: "var(--scotia)",
      effort: "auto",
      why: `Paid from the pot above at ${ret_wr}% a year. Automatic once you set up withdrawals at retirement.`,
    },
    {
      name: "Your own investments",
      today: ((own / inflation) * wr) / 12,
      nominal: (own * wr) / 12,
      color: "var(--std)",
      effort: "act",
      why: `Only exists if you invest about ${money(invest.monthly)} a month yourself, every month until 65, as on the Millionaire page. Skip it and this line is $0.`,
    },
    {
      name: "Quebec Pension Plan (QPP)",
      today: QPP_MONTHLY,
      nominal: QPP_MONTHLY * inflation,
      color: "var(--mix)",
      effort: "auto",
      why: "Already deducted from every paycheque. Apply when you retire; it pays more if you wait past 65.",
    },
    {
      name: "Old Age Security (OAS)",
      today: OAS_MONTHLY,
      nominal: OAS_MONTHLY * inflation,
      color: "var(--promo)",
      effort: "auto",
      why: "Paid by the government with 40 years in Canada after age 18. Usually starts automatically at 65; it shrinks if your retirement income is high.",
    },
  ];

  const total = sources.reduce((t, s) => t + s.today, 0);
  const replacement = plan.net ? total / plan.net : 0;
  return {
    pension,
    invest,
    sources,
    total,
    totalNominal: sources.reduce((t, s) => t + s.nominal, 0),
    replacement,
    status: replacement >= 0.7 ? "good" : replacement >= 0.5 ? "ok" : "bad",
  };
}
