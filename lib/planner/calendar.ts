// The plan starts in October 2026. Month index 0 is October 2026.
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

const START_YEAR = 2026;
const START_MONTH = 9;

export function monthDate(index: number, day = 1): Date {
  return new Date(START_YEAR, START_MONTH + index, day);
}

/** "Oct 2026" */
export function monthLabel(index: number): string {
  const d = monthDate(index);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Oct" or "Oct ’26", for chart axes. */
export function axisMonthLabel(index: number, withYear: boolean): string {
  const d = monthDate(index);
  const m = MONTH_NAMES[d.getMonth()];
  return withYear ? `${m} ’${String(d.getFullYear()).slice(2)}` : m;
}

/** "Mar 14" */
export function dayLabel(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export function daysInPlanMonth(index: number): number {
  return new Date(START_YEAR, START_MONTH + 1 + index, 0).getDate();
}

/** Plan-month index of a calendar year + month (0-based month). */
export function planIndex(year: number, month: number): number {
  return (year - START_YEAR) * 12 + month - START_MONTH;
}

export const PLAN_START_YEAR = START_YEAR;

/** "2027-02-28" for plan month `index`, day `day` (default: the last day, which is payday). */
export function isoDate(index: number, day = daysInPlanMonth(index)): string {
  const d = monthDate(index, day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Plan month and day of an ISO date, clamped to the plan's first day and to `maxMonth`. */
export function planDay(iso: string, maxMonth: number): { i: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return { i: 0, d: 1 };
  const i = planIndex(y, m - 1);
  if (i < 0) return { i: 0, d: 1 };
  if (i > maxMonth) return { i: maxMonth, d: daysInPlanMonth(maxMonth) };
  return { i, d: Math.min(d, daysInPlanMonth(i)) };
}

/** "Feb 28, 2027" */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}
