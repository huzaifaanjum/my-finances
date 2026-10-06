// Facts from the Air Canada offer (Aug 3, 2026) and the September 2026 pay stub.
// Personal identifiers (address, employee ID, bank account) are left out on purpose.

export const OFFER = {
  employer: "Air Canada",
  role: "Full-stack Developer",
  band: "Band D",
  city: "Montréal",
  offerDate: "Aug 3, 2026",
  start: "2026-08-17",
  salary: 95_000,
  aipTarget: 0.08,
  aipMax: 0.16,
  signing: [
    { amount: 2_500, after: 6, date: "2027-02-17" },
    { amount: 2_500, after: 12, date: "2027-08-17" },
  ],
  pensionMin: 0.03,
  pensionMax: 0.06,
  vacationWeeks: 3,
  catchUpDays: 5,
  probationMonths: 6,
  travelAfterWeeks: 28,
  aeroplanPoints: 15_000,
} as const;

/** Employer-paid health and dental each month, from the stub. */
export const EMPLOYER_HEALTH = 37.11 + 212.55;

export interface StubLine {
  label: string;
  amount: number;
  /** short explanation shown under the label */
  note?: string;
}

export interface StubGroup {
  id: "pension" | "tax" | "payroll" | "insurance";
  title: string;
  color: string;
  lines: StubLine[];
}

export const STUB = {
  period: "September 2026",
  gross: 7_917,
  net: 4_387.37,
  /** one-time catch-up deductions for August's insurance, also on September's stub */
  retro: 293.53,
  ytdGross: 11_747.81,
  ytdNet: 7_293.78,
};

/** Recurring monthly deductions, retro excluded. */
export const STUB_GROUPS: StubGroup[] = [
  {
    id: "tax",
    title: "Income tax",
    color: "var(--scotia)",
    lines: [
      { label: "Quebec income tax", amount: 1_022.93 },
      { label: "Federal income tax", amount: 795.8, note: "after the 16.5% Quebec abatement" },
    ],
  },
  {
    id: "payroll",
    title: "Government plans",
    color: "var(--mix)",
    lines: [
      { label: "Quebec Pension Plan (QPP)", amount: 511.85, note: "stops once the yearly maximum is reached" },
      { label: "Employment Insurance (EI)", amount: 102.92, note: "stops once the yearly maximum is reached" },
      { label: "Quebec Parental Insurance (QPIP)", amount: 34.05 },
    ],
  },
  {
    id: "pension",
    title: "Your pension",
    color: "var(--promo)",
    lines: [{ label: "DC pension, 6% of salary", amount: 475.02, note: "before tax, so it lowers your income tax" }],
  },
  {
    id: "insurance",
    title: "Insurance",
    color: "#f472b6",
    lines: [
      { label: "Long-term disability", amount: 165.56 },
      { label: "Life insurance", amount: 54.94 },
      { label: "Dental", amount: 46.82 },
      { label: "Short-term disability", amount: 22.72 },
      { label: "AD&D", amount: 3.49 },
    ],
  },
];

export const EMPLOYER_PAID: StubLine[] = [
  { label: "Pension match", amount: 475.02, note: "matches your 6%, the most they will match" },
  { label: "Extended health", amount: 212.55, note: "taxable in Quebec" },
  { label: "Dental", amount: 37.11, note: "taxable in Quebec" },
];

export const groupTotal = (g: StubGroup) => g.lines.reduce((t, l) => t + l.amount, 0);
