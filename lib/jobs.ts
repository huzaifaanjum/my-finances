// Your previous job, from its payslips, so the Air Canada offer can be compared with it.
// FlexSpring paid every two weeks with no pension, group insurance or perks on the payslips.

import { COMP, OFFER } from "@/lib/offer";
import { PAY, payMarginal } from "@/lib/pay";
import { grossFromNet } from "@/lib/tax2026";

/** Net pay every two weeks at FlexSpring's last rate (July to August 2026). */
const FLEX_NET_BIWEEKLY = 1_962.7;
const flexGross = grossFromNet(FLEX_NET_BIWEEKLY);

export interface JobSide {
  name: string;
  role: string;
  /** base pay a year */
  salary: number;
  /** yearly incentive at target, or a typical yearly bonus */
  bonus: number;
  bonusNote: string;
  /** employer pension contribution a year */
  pension: number;
  /** employer-paid health and dental a year */
  health: number;
  /** spending account a year */
  lsa: number;
  /** pay before taxes and deductions in a normal month */
  grossMonthly: number;
  /** money you can actually spend in a year, after tax: take-home, bonus and spending account (not pension or insurance) */
  usableYearly: number;
  usableNote: string;
  /** take-home in a normal month */
  netMonthly: number;
  netNote: string;
  vacation: string;
  insurance: string;
  perks: string;
  where: string;
}

export const FLEXSPRING: JobSide = {
  name: "FlexSpring Solutions",
  role: "Software Developer",
  salary: Math.round(flexGross * 26),
  bonus: 0,
  bonusNote: "none",
  pension: 0,
  health: 0,
  lsa: 0,
  // a normal month had two paycheques
  grossMonthly: flexGross * 2,
  usableYearly: FLEX_NET_BIWEEKLY * 26,
  usableNote: "26 cheques",
  netMonthly: FLEX_NET_BIWEEKLY * 2,
  netNote: `two cheques of ${FLEX_NET_BIWEEKLY.toLocaleString("en-CA", { style: "currency", currency: "CAD" })} at the last rate`,
  vacation: "Quebec minimum (4%); unused days paid out as vacation pay ($2,897 by June)",
  insurance: "None on your payslips",
  perks: "None",
  where: "Lévis employer, Jan 1 to Aug 17, 2026",
};

export const AIRCANADA: JobSide = {
  name: OFFER.employer,
  role: OFFER.role,
  salary: OFFER.salary,
  bonus: COMP.aip,
  bonusNote: "8% incentive at target each March (up to 16%), plus $5,000 signing in year one",
  pension: COMP.match,
  health: COMP.health,
  lsa: COMP.lsa,
  grossMonthly: PAY.monthlyBase,
  // the first incentive (March 2027) is prorated for Aug 17 to Dec 31, 2026
  usableYearly: PAY.usualNet * 12 + PAY.firstAipNet + COMP.lsa * (1 - payMarginal().rate),
  usableNote: `${Math.round(PAY.usualNet * 12).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })} pay + ${PAY.firstAipNet.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })} first incentive (prorated) + ${Math.round(COMP.lsa * (1 - payMarginal().rate)).toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 })} spending account, after tax`,
  netMonthly: PAY.usualNet,
  netNote: "after 6% to your pension and your insurance premiums",
  vacation: `${OFFER.vacationWeeks} weeks + ${OFFER.catchUpDays} catch-up days`,
  insurance: "Disability, life, health, drugs and dental (Manulife)",
  perks: "Travel privileges, 15,000 Aeroplan points a year, ESOP match",
  where: `Montréal, from Aug 17, 2026`,
};

/** Everything each job pays you or for you in a normal year (no signing bonus). */
export const yearlyTotal = (j: JobSide) => j.salary + j.bonus + j.pension + j.health + j.lsa;
