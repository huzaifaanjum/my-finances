// Everything worth doing with your pay, offer and savings, as one checklist.
// Ids of steps that existed before are kept, so ticks saved earlier still show; `also` lists ids
// of duplicates folded into a step, which count as done too.

import { money } from "@/lib/format";
import { EMPLOYER_HEALTH, INSURANCE_PREMIUMS, OFFER } from "@/lib/offer";
import { marginalFor } from "@/lib/payslips/forecast";
import type { Plan } from "@/lib/planner/projection";

export type Priority = "now" | "soon" | "later";
export type AreaId = "habits" | "debt" | "tax" | "invest" | "home" | "protect" | "payslips" | "perks";

export interface Step {
  /** saved with the Knowledge progress, so keep it stable */
  id: string;
  also?: string[];
  area: AreaId;
  priority: Priority;
  title: string;
  body: string;
  /** a deadline or timing, shown as a tag */
  when?: string;
  /** rough yearly value in dollars, when it can be worked out */
  impact?: number;
  /** the tab where you act on it */
  link?: { href: string; label: string };
}

export const AREAS: Record<AreaId, { title: string; color: string }> = {
  habits: { title: "Savings habits", color: "var(--std)" },
  debt: { title: "Banking, debt and credit", color: "var(--neg)" },
  tax: { title: "Tax", color: "var(--scotia)" },
  invest: { title: "Pension and investing", color: "var(--promo)" },
  home: { title: "Home and big purchases", color: "var(--mix)" },
  protect: { title: "Health, insurance and estate", color: "#f472b6" },
  payslips: { title: "Your payslips", color: "#a1a1aa" },
  perks: { title: "Perks and extras", color: "#2dd4bf" },
};

export const PRIORITIES: Record<Priority, { title: string; note: string }> = {
  now: { title: "Now", note: "this month" },
  soon: { title: "Soon", note: "next few months" },
  later: { title: "Later", note: "when it comes up" },
};

/** Numbers from your plan that make the advice specific. */
export interface RecContext {
  year: number;
  /** one-time credit card payments in the plan */
  cardDebt: number;
  rent: number;
  net: number;
  /** three months of expenses */
  safetyNet: number;
  /** monthly subscriptions */
  subs: number;
}

export function recContext(plan: Plan): RecContext {
  const card = plan.state.oneTime.expense.filter((o) => o.on && /credit|card/i.test(o.name)).reduce((t, o) => t + o.amount, 0);
  return { year: new Date().getFullYear(), cardDebt: card, rent: plan.rent, net: plan.net, safetyNet: plan.exp.total * 3, subs: plan.exp.groups[1] ?? 0 };
}

/** Typical credit card and savings rates, for rough yearly values. */
const CARD_APR = 0.2099;
const HISA_RATE = 0.025;

/** RRSP room for next year: 18% of this year's earnings minus the pension adjustment (your DC contributions, both sides). */
export function rrspRoomEstimate(year: number) {
  const started = new Date(`${OFFER.start}T00:00:00`);
  const share = year === started.getFullYear() ? (new Date(year, 11, 31).getTime() - started.getTime()) / (365 * 864e5) : 1;
  const earned = OFFER.salary * share;
  const pa = earned * OFFER.pensionMax * 2;
  return { forYear: year + 1, room: Math.max(0, Math.min(earned * 0.18, 32_490) - pa), pa, earned };
}

export function checklist(ctx: RecContext): Step[] {
  const base = OFFER.salary / 12;
  const pension = base * OFFER.pensionMax;
  const m = marginalFor({ base, pension, benefits: EMPLOYER_HEALTH }, ctx.year + 1);
  const match = OFFER.salary * OFFER.pensionMax;
  const rrsp = rrspRoomEstimate(ctx.year);
  const rentShare = ctx.net ? ctx.rent / ctx.net : 0;

  return [
    // savings habits
    {
      id: "rec-automate",
      area: "habits",
      priority: "now",
      title: "Automate the monthly transfer",
      body: "Set a transfer for the day after payday so your surplus leaves chequing before you can spend it. The Plan tab shows the amount.",
      link: { href: "/plan", label: "Plan" },
    },
    {
      id: "rec-spending-cap",
      area: "habits",
      priority: "soon",
      title: "Check two months of spending against the plan",
      body: "Compare what you really spent with the expenses on the Plan tab, and fix the numbers that are off so every projection stays honest.",
      when: "Next 2 months",
      link: { href: "/plan", label: "Plan" },
    },
    {
      id: "rec-subscriptions",
      area: "habits",
      priority: "soon",
      title: "Audit your subscriptions",
      body: `They cost ${money(ctx.subs)} a month, ${money(ctx.subs * 12)} a year. Cancel anything you haven't used in the last month; most can be restarted in a click.`,
    },
    {
      id: "pay-bump-transfer",
      area: "habits",
      priority: "later",
      title: "Schedule a transfer for the late-year bump",
      body: "Once EI and QPP reach their yearly maximums the deposit jumps for the last months of the year. Set a recurring transfer to your TFSA or FHSA from September to December so the extra never reaches spending.",
      when: "Before Sep",
    },
    {
      id: "pay-raise-split",
      area: "habits",
      priority: "later",
      title: "Save half of every raise and incentive",
      body: `When pay goes up, raise your automatic transfer by half of the extra take-home. On a 3% raise that is about ${money((OFFER.salary * 0.03 * m.keep) / 1000 / 12 / 2)} more a month saved, and you still feel the raise.`,
      when: "Each January",
    },
    {
      id: "rec-review",
      area: "habits",
      priority: "later",
      title: "Review the plan every quarter",
      body: "Update take-home from your latest payslip, adjust expenses, and check that the Goals and Millionaire dates still hold.",
      when: "Quarterly",
    },

    // banking, debt and credit
    {
      id: "rec-card-payoff",
      area: "debt",
      priority: "now",
      title: ctx.cardDebt ? `Clear the ${money(ctx.cardDebt)} credit card balance` : "Never carry a credit card balance",
      body: `Card interest runs about ${Math.round(CARD_APR * 100)}% a year, more than any investment reliably earns. Paying it off is a guaranteed return; do it before investing anything.`,
      impact: ctx.cardDebt ? ctx.cardDebt * CARD_APR : undefined,
      when: "This month",
    },
    {
      id: "rec-card-autopay",
      area: "debt",
      priority: "now",
      title: "Set the card to autopay the full statement",
      body: "Autopay of the full balance (not the minimum) means no interest and no late fees, and on-time payments build your credit score.",
    },
    {
      id: "rec-hisa",
      area: "debt",
      priority: "soon",
      title: "Keep the safety net in a high-interest savings account",
      body: `Your three-month safety net is ${money(ctx.safetyNet)}. In a high-interest account at about ${HISA_RATE * 100}% it earns instead of sitting idle in chequing, and stays available the same day.`,
      impact: ctx.safetyNet * HISA_RATE,
    },
    {
      id: "rec-credit-report",
      area: "debt",
      priority: "later",
      title: "Check your credit report once a year",
      body: "Equifax and TransUnion give you your report free. Look for accounts you don't recognise; a clean score matters when you finance a car or a home.",
      when: "Yearly",
    },

    // tax
    {
      id: "rec-open-fhsa",
      area: "tax",
      priority: "now",
      title: "Open an FHSA this year, even with $0",
      body: "FHSA room only starts building once the account exists. Opening one before Dec 31 gives you $8,000 of room for this year that carries forward if you don't use it.",
      when: "By Dec 31",
      link: { href: "/goals/house", label: "House goal" },
    },
    {
      id: "pay-rrsp-fhsa",
      area: "tax",
      priority: "soon",
      title: "Fill the FHSA first, then an RRSP",
      body: `Each $1,000 contributed cuts tax by about ${money(m.rrsp)}, so a full $8,000 FHSA year is worth about ${money(m.rrsp * 8)} back. It is tax-free when used for a first home.`,
      impact: m.rrsp * 8,
      when: "FHSA by Dec 31",
    },
    {
      id: "rec-rrsp-room",
      area: "tax",
      priority: "later",
      title: "Know that your RRSP room is small",
      body: `Your DC pension counts against RRSP room (the pension adjustment). For ${rrsp.forYear} expect about ${money(rrsp.room)} of new room, then about ${money(Math.min(OFFER.salary * 0.18, 32_490) - OFFER.salary * OFFER.pensionMax * 2)} a year after that. Check the exact figure on your Notice of Assessment before contributing.`,
      when: "After filing",
    },
    {
      id: "rec-tax-accounts",
      area: "tax",
      priority: "now",
      title: "Set up CRA My Account and Revenu Québec My Account",
      body: "Both show your TFSA, RRSP and FHSA room, send refunds by direct deposit, and let you file online. Set them up before tax season.",
    },
    {
      id: "pay-source-deductions",
      area: "tax",
      priority: "later",
      title: "Get the refund every month, not once a year",
      body: "If you contribute to an RRSP or FHSA regularly, file form T1213 with the CRA and TP-1016-V with Revenu Québec. Once approved, Air Canada withholds less tax from each payslip.",
    },
    {
      id: "pay-bonus-rrsp",
      area: "tax",
      priority: "soon",
      title: "Route the March incentive into your RRSP",
      body: `Bonuses are taxed at your marginal rate, so you keep only about ${money(m.keep)} of each $1,000. Ask HR whether the incentive can go straight into the Group RRSP, where it is not taxed at source.`,
      when: "Before March",
    },
    {
      id: "pay-claim-amounts",
      area: "tax",
      priority: "later",
      title: "Check your TD1 and TP-1015.3 claim amounts",
      body: 'Your payslip\'s "Net Claim Amt." shows only the basic personal amounts. If you have tuition carry-forwards, a dependant or other credits, updating the forms raises every deposit.',
    },
    {
      id: "rec-moving-expenses",
      area: "tax",
      priority: "later",
      title: "Claim moving expenses if you moved for this job",
      body: "If you moved at least 40 km closer to work to start at Air Canada, moving costs can be deducted from your Montréal income on both returns. Keep the receipts.",
      when: "Tax time",
    },
    {
      id: "offer-medical-credit",
      area: "tax",
      priority: "later",
      title: "Keep receipts for what the plan does not pay",
      body: "Your share of medical, dental and vision costs can count toward the medical expense tax credit on both federal and Quebec returns.",
      when: "Tax time",
    },

    // pension and investing
    {
      id: "offer-keep-6",
      area: "invest",
      priority: "now",
      title: "Keep contributing 6%",
      body: `That gets the full ${money(match)} a year match. Dropping to 3% would cost you ${money(match / 2)} a year of free money.`,
      impact: match,
      link: { href: "/pension", label: "Pension" },
    },
    {
      id: "offer-dc-funds",
      also: ["pay-pension-fund"],
      area: "invest",
      priority: "now",
      title: "Choose your pension investments",
      body: `${money(pension * 2)} goes in every month. Log in to Manulife and check which fund it sits in: with 35+ years to go, a low-fee growth or target-date fund beats a cautious default by hundreds of thousands at 65.`,
      link: { href: "/pension", label: "Pension" },
    },
    {
      id: "rec-tfsa-room",
      area: "invest",
      priority: "now",
      title: "Confirm your TFSA room before contributing",
      body: "TFSA room only builds from the year you turned 18 while resident in Canada. Over-contributing costs 1% a month on the excess, so check the exact room on CRA My Account first.",
    },
    {
      id: "rec-index-etf",
      area: "invest",
      priority: "soon",
      title: "Use one low-cost all-in-one ETF",
      body: "A single all-in-one index ETF holds thousands of companies for about 0.2% a year. A typical 2% mutual fund costs $1,800 more a year on every $100,000 invested.",
      link: { href: "/millionaire", label: "Millionaire" },
    },
    {
      id: "offer-group-rrsp-tfsa",
      area: "invest",
      priority: "soon",
      title: "Look at the Group RRSP and TFSA",
      body: "Payroll deductions make saving automatic, and group plans often have lower fees than a bank. Group RRSP deductions also lower the tax taken off each paycheque.",
    },
    {
      id: "offer-esop",
      area: "invest",
      priority: "later",
      title: "Join the ESOP, but keep it small",
      body: "Air Canada matches part of what you put into its shares, which is free money. Your job already depends on Air Canada, so don't let its shares become a big part of your savings.",
    },
    {
      id: "rec-rebalance",
      area: "invest",
      priority: "later",
      title: "Review your investments once a year",
      body: "Check fees and that the mix still fits your timeline. Don't sell in a downturn; markets have recovered from every drop over long periods.",
      when: "Yearly",
    },

    // home and big purchases
    {
      id: "rec-lease-renewal",
      area: "home",
      priority: "soon",
      title: "Prepare for your lease renewal",
      body: `Rent is ${money(ctx.rent)}, ${Math.round(rentShare * 100)}% of take-home. Most Quebec leases end June 30, and the landlord must send any increase 3 to 6 months before. You can refuse an increase and the Tribunal administratif du logement sets it; or use the renewal to find a cheaper place or a roommate.`,
      when: "Jan to Mar",
    },
    {
      id: "rec-hbp",
      area: "home",
      priority: "later",
      title: "Combine the FHSA with the Home Buyers' Plan",
      body: "For a first home you can use your whole FHSA tax-free plus up to $60,000 from your RRSP under the Home Buyers' Plan, repaid over 15 years.",
      link: { href: "/goals/house", label: "House goal" },
    },
    {
      id: "rec-car-preapproval",
      area: "home",
      priority: "later",
      title: "Get a loan pre-approval before shopping for a car",
      body: "A pre-approval from your bank gives you a rate to beat at the dealer, and keeps the monthly payment inside what the Car goal says you can afford.",
      link: { href: "/goals/car", label: "Car goal" },
    },

    // health, insurance and estate
    {
      id: "rec-tenant-insurance",
      area: "protect",
      priority: "now",
      title: "Get tenant insurance",
      body: "Usually $20 to $30 a month for your belongings and, more importantly, liability if water from your unit damages a neighbour's. Many leases require it.",
    },
    {
      id: "offer-manulife-account",
      area: "protect",
      priority: "now",
      title: "Set up your Manulife member account and app",
      body: "Get your digital benefits card, read the coverage booklet, and add direct deposit so claims are paid straight to your bank.",
    },
    {
      id: "offer-beneficiaries",
      area: "protect",
      priority: "now",
      title: "Name beneficiaries",
      body: "Set a beneficiary for life insurance, AD&D and your DC pension on the Manulife site. Without one, money can get stuck in your estate.",
    },
    {
      id: "offer-dental-checkup",
      area: "protect",
      priority: "soon",
      title: "Book a dental checkup and cleaning",
      body: "Preventive care is usually the best-covered part of a dental plan. Check how often cleanings are covered and book the first one.",
    },
    {
      id: "offer-paramedical",
      also: ["pay-use-benefits"],
      area: "protect",
      priority: "soon",
      title: "Use paramedical and vision coverage before it resets",
      body: `Physio, massage, psychologist, eye exams and glasses have yearly limits that are lost if unused. You already pay Quebec tax on ${money(EMPLOYER_HEALTH * 12)} a year of this coverage.`,
      when: "Before limits reset",
    },
    {
      id: "offer-vision",
      area: "protect",
      priority: "later",
      title: "Check vision coverage",
      body: "If the plan covers eye exams, glasses or contacts, use it when you need a new prescription.",
    },
    {
      id: "offer-telemedicine",
      area: "protect",
      priority: "soon",
      title: "Install LifeWorks telemedicine",
      body: "Talk to a doctor 24/7 by video instead of waiting at a walk-in clinic. Included for you and your immediate family.",
    },
    {
      id: "rec-travel-insurance",
      area: "protect",
      priority: "later",
      title: "Check out-of-country medical cover before you fly",
      body: "Before using travel privileges, look up the emergency travel medical cover in your Manulife booklet: how many days per trip and whether you need to call before treatment.",
      when: "Before Mar 2027",
    },
    {
      id: "rec-will",
      area: "protect",
      priority: "later",
      title: "Make a will and a protection mandate",
      body: "In Quebec a notarial will and a protection mandate (who decides for you if you can't) keep your pension, savings and affairs out of court. A notary can do both in one visit.",
    },
    {
      id: "offer-ltd-tax-free",
      area: "protect",
      priority: "later",
      title: "Know that your disability cover is tax-free",
      body: `You pay ${money(INSURANCE_PREMIUMS, 2)} a month in premiums from after-tax pay, so if you ever claim long-term disability the benefit is generally not taxed. That makes it worth keeping.`,
    },
    {
      id: "offer-optional-life",
      area: "protect",
      priority: "later",
      title: "Skip optional life insurance unless someone depends on you",
      body: "Optional employee, spouse and child life cover costs extra. Only add it if a partner or family relies on your income.",
    },

    // payslips
    {
      id: "pay-upload-monthly",
      area: "payslips",
      priority: "soon",
      title: "Upload each payslip the day it arrives",
      body: "It lands on the last banking day of the month. Uploading it keeps the pay forecast and pension accurate and flags anything that moved.",
      when: "Monthly",
      link: { href: "/payslips", label: "Payslips" },
    },
    {
      id: "pay-check-lines",
      area: "payslips",
      priority: "later",
      title: "Look for new or changed lines",
      body: "The Payslips tab compares each payslip with the one before. New deductions, a changed pay rate or a retro line all deserve a question to HR if you don't recognise them.",
      link: { href: "/payslips", label: "Payslips" },
    },
    {
      id: "pay-year-end",
      area: "payslips",
      priority: "later",
      title: "Match December's year-to-date totals to your T4 and RL-1",
      body: "In February, check that gross, tax, QPP, EI and QPIP on the slips match the year-to-date column of your last payslip of the year.",
      when: "February",
    },

    // perks and extras
    {
      id: "offer-aeroplan-link",
      area: "perks",
      priority: "soon",
      title: "Make sure your Aeroplan account is linked",
      body: "The 15,000-point grant arrives each January, starting January 2027. Confirm on the portal which Aeroplan number it goes to.",
      when: "Before Jan 2027",
    },
    {
      id: "offer-time-off",
      area: "perks",
      priority: "soon",
      title: "Use your vacation and catch-up days",
      body: "Both are prorated for 2026. Look up how many you have left and whether they carry over, so none expire unused.",
      when: "Before Dec 31",
    },
    {
      id: "offer-aip-goals",
      area: "perks",
      priority: "soon",
      title: "Ask how your incentive is scored",
      body: `The incentive ranges from 8% to 16% of salary, ${money(OFFER.salary * 0.08)} to ${money(OFFER.salary * 0.16)}, partly on your own objectives. Ask your manager what they are, so you can aim above target.`,
    },
    {
      id: "offer-travel-rules",
      area: "perks",
      priority: "later",
      title: "Read the Employee Travel Site rules",
      body: "Travel privileges start after 28 weeks, around Mar 1, 2027. You are responsible for anyone using your privileges following the rules, so learn them first.",
      when: "Mar 2027",
    },
    {
      id: "offer-aeroplan-flights",
      area: "perks",
      priority: "later",
      title: "Spend points on flights, not merchandise",
      body: "Points usually go much further on flights than on gift cards or merchandise. 15,000 points can cover a short-haul flight in Canada.",
    },
    {
      id: "offer-plan-trip",
      area: "perks",
      priority: "later",
      title: "Plan a trip around your vacation days",
      body: "Pair standby travel with your three weeks of vacation and catch-up days. Flexible dates and off-peak flights give the best standby odds.",
    },
    {
      id: "offer-expenses",
      area: "perks",
      priority: "later",
      title: "Claim work expenses",
      body: "Read the Travel and Business Expenses policy on HR Connex and claim what you are entitled to instead of paying it yourself.",
    },
    {
      id: "rec-training",
      area: "perks",
      priority: "later",
      title: "Ask about a training or certification budget",
      body: "Many employers pay for courses, conferences or certifications. It raises your next salary review at no cost to you.",
    },
    {
      id: "offer-shine",
      area: "perks",
      priority: "later",
      title: "Redeem Shine points",
      body: "Recognition points from colleagues build up in your Shine balance and can be swapped for gift cards and experiences.",
    },
  ];
}

export const isDone = (s: Step, read: Record<string, number>) => !!read[s.id] || !!s.also?.some((id) => read[id]);
