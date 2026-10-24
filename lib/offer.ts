// Facts from the Air Canada offer (Aug 3, 2026) and the September 2026 pay stub.
// Actual payslips live (encrypted) on the Payslips tab; these figures need no unlocking.
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

/** Year-one compensation at target incentive, and its parts. */
export const COMP = (() => {
  const aip = OFFER.salary * OFFER.aipTarget;
  const signing = OFFER.signing.reduce((t, s) => t + s.amount, 0);
  const match = OFFER.salary * OFFER.pensionMax;
  const health = Math.round(EMPLOYER_HEALTH * 12);
  return { aip, signing, match, health, yearOne: OFFER.salary + aip + signing + match + health };
})();
