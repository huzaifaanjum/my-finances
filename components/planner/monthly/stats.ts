import type { MonthRow } from "@/lib/planner/types";

/** Totals for the month-by-month page. The first month is left out of the average (it only holds starting savings). */
export function monthlyStats(rows: MonthRow[]) {
  const paid = rows.filter((r) => r.i > 0);
  return {
    paid,
    total: rows.reduce((t, r) => t + r.deposit, 0),
    extra: rows.reduce((t, r) => t + r.extra, 0),
    average: paid.length ? paid.reduce((t, r) => t + r.deposit, 0) / paid.length : 0,
    best: rows.reduce((b, r) => (r.deposit > b.deposit ? r : b), rows[0]),
    bonusMonths: rows.filter((r) => r.extra > 0).length,
  };
}

/** How many labels fit along the x axis. */
export function labelStep(count: number, plotWidth: number): number {
  return Math.max(1, Math.ceil(count / Math.max(2, Math.floor(plotWidth / (count <= 12 ? 34 : 52)))));
}
