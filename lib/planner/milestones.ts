import type { Plan } from "./projection";

export interface Milestone {
  name: string;
  amount: number;
}

/** Savings levels worth celebrating, smallest first. */
export function savingsMilestones(plan: Plan): Milestone[] {
  const e = plan.exp.total;
  return [
    { name: "1 month of expenses", amount: e },
    { name: "3 months of expenses", amount: e * 3 },
    { name: "$10,000", amount: 10000 },
    { name: "$25,000", amount: 25000 },
    { name: "$50,000", amount: 50000 },
    { name: "$100,000", amount: 100000 },
  ]
    .filter((m) => m.amount > 0)
    .sort((a, b) => a.amount - b.amount);
}
