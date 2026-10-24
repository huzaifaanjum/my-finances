// Current public figures behind the retirement estimates. Update these when the government publishes new ones.

export const RETIREMENT_FACTS = {
  /** Canada CPI, year over year (Statistics Canada, released Oct 19, 2026) */
  inflation: { value: 3.1, asOf: "Sep 2026", source: "Statistics Canada" },
  /** what the Bank of Canada aims for over time */
  inflationTarget: 2,
  /** maximum QPP retirement pension at 65, base + additional plan (Retraite Québec) */
  qppMax65: { value: 1507.65, asOf: "2026", source: "Retraite Québec" },
  /** maximum OAS pension, ages 65 to 74 (Canada.ca, Oct to Dec 2026) */
  oasMax: { value: 762.5, asOf: "Oct–Dec 2026", source: "Canada.ca" },
} as const;
