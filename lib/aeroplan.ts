// Aeroplan facts used on Benefits and Knowledge, as published in Oct 2026. Programs change: check aircanada.com before booking.

export const AEROPLAN = {
  /** what a point is typically worth on flights, in cents (The Points Guy, Sep 2026) */
  centsTypical: 1.5,
  /** what premium partner awards can reach */
  centsPremium: [3, 10] as const,
  /** gift cards and merchandise */
  centsMerch: 0.7,
  /** short flights within North America start here (points, one way) */
  shortHaulFrom: 6_000,
  /** one-way business class to Europe on a partner, from eastern North America */
  europeBusiness: 60_000,
  /** add a stopover to a one-way award */
  stopover: 5_000,
  /** Aeroplan's booking fee on partner awards, per ticket */
  partnerFee: 39,
  /** points expire after this many months with no earning or redeeming */
  expiryMonths: 18,
  /** the pause on expiry ends; the 18-month rule applies again from this date */
  expiryResumes: "2026-11-30",
  /** Family Sharing pool size, and how long you wait after leaving one */
  poolMax: 8,
  poolLockoutMonths: 6,
  /** everyday earning */
  eStoreUpTo: 10,
  starbucks: { points: 100, load: 75 },
  /** new flight reward chart */
  chartChange: "June 1, 2026",
  /** Elite status from 2026 is earned with Status Qualifying Credits */
  status25K: 25_000,
  status35K: 35_000,
  cardSqcCap: 25_000,
} as const;

/** Cents per point a redemption gets: (cash price − taxes and fees you still pay) ÷ points. */
export const centsPerPoint = (cashPrice: number, feesPaid: number, points: number) => (points > 0 ? ((cashPrice - feesPaid) / points) * 100 : 0);
