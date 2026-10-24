// Every Air Canada benefit, what it is worth and the steps to get full use of it.
// Values come from the offer letter, your payslip and the Manulife coverage summary.
// Step ids are shared with the earlier My offer / Recommendations checklists, so saved ticks carry over.

import { benefit, BENEFITS, LSA_YEARLY, PREMIUM_TAX } from "@/lib/benefits";
import { money } from "@/lib/format";
import { OFFER } from "@/lib/offer";
import { PAY } from "@/lib/pay";

export type BenefitGroup = "money" | "health" | "protection" | "perks";

export const BENEFIT_GROUPS: Record<BenefitGroup, { title: string; color: string; note: string }> = {
  money: { title: "Pay and savings", color: "var(--promo)", note: "Pension match, incentive, bonuses and share plans" },
  health: { title: "Health and wellness", color: "var(--std)", note: "Health, drugs, dental and the spending account" },
  protection: { title: "Protection", color: "var(--scotia)", note: "Disability, life and accident cover" },
  perks: { title: "Travel, time off and perks", color: "#f472b6", note: "Flights, points, vacation and extras" },
};

export interface BenefitStep {
  id: string;
  /** ids of older duplicates; ticked counts as done */
  also?: string[];
  title: string;
  body: string;
  when?: string;
}

export interface BenefitItem {
  id: string;
  group: BenefitGroup;
  name: string;
  /** what it adds a year on top of salary, when that can be put as a number */
  value?: number;
  /** a one-time amount rather than yearly */
  once?: boolean;
  /** shown instead of a dollar value, or next to it */
  valueNote: string;
  what: string;
  link?: { href: string; label: string };
  steps: BenefitStep[];
}

const employerYear = (id: Parameters<typeof benefit>[0]) => benefit(id).flex * (1 + PREMIUM_TAX) * 12;
const weekly = PAY.salary / 52;

export function benefitItems(): BenefitItem[] {
  const match = PAY.salary * PAY.matchRate;
  const aip = PAY.salary * OFFER.aipTarget;
  const ltd = benefit("ltd").pays!.amount;
  const life = benefit("life").pays!.amount;
  const add = benefit("add").pays!.amount;
  return [
    // pay and savings
    {
      id: "b-pension",
      group: "money",
      name: "DC pension match",
      value: match,
      valueNote: "a year from Air Canada",
      what: `You put in 6% of salary and Air Canada adds the same: ${money(match / 12, 2)} a month of free money into your pension.`,
      link: { href: "/pension", label: "Retirement" },
      steps: [
        { id: "offer-keep-6", title: "Keep contributing the full 6%", body: `Anything less loses part of the match. At 3% you would give up ${money(match / 2)} a year.` },
        {
          id: "offer-dc-funds",
          also: ["pay-pension-fund"],
          title: "Choose your pension funds",
          body: "Log in to Manulife and move the money out of the default into a low-fee growth or target-date fund that fits 35+ years.",
          when: "Now",
        },
        { id: "ben-pension-beneficiary", title: "Name a pension beneficiary", body: "Set it on the Manulife site so the balance goes where you want without waiting on an estate.", when: "Now" },
        { id: "ben-pension-statement", title: "Read your yearly pension statement", body: "Check contributions match your payslips (6% + 6%) and that the fund is the one you chose.", when: "Yearly" },
      ],
    },
    {
      id: "b-incentive",
      group: "money",
      name: "Annual incentive (AIP)",
      value: aip,
      valueNote: "a year at the 8% target, gross",
      what: `Paid each March for the year before, 8% of salary at target and up to 16%. The first one (March 2027) is prorated: about ${money(PAY.firstAipNet)} lands on payday.`,
      steps: [
        { id: "offer-aip-goals", title: "Ask how your incentive is scored", body: "Part of it depends on your own objectives. Know them so you can aim above target." },
        { id: "pay-bonus-rrsp", title: "Plan where the March payment goes", body: "Send it to your FHSA, RRSP or debt before it lands; asking HR to route it to the Group RRSP avoids tax at source.", when: "Before March" },
      ],
    },
    {
      id: "b-signing",
      group: "money",
      name: "Signing bonus",
      value: OFFER.signing.reduce((t, s) => t + s.amount, 0),
      once: true,
      valueNote: "in two payments, gross, first year only",
      what: `$2,500 after 6 months (Feb 2027) and $2,500 after 12 months (Aug 2027), about ${money(PAY.signingNet)} each on payday. Only paid if you are still employed then.`,
      steps: [{ id: "ben-signing-plan", title: "Decide now where both payments go", body: "Clearing the credit card and starting the safety net are the best uses; don't plan spending around money that isn't guaranteed.", when: "Before Feb 2027" }],
    },
    {
      id: "b-esop",
      group: "money",
      name: "Employee share plan (ESOP)",
      valueNote: "employer match on shares you buy",
      what: "Air Canada matches part of what you put into its shares through payroll, the following year.",
      steps: [
        { id: "offer-esop", title: "Join the ESOP, but keep it small", body: "The match is free money, but your job already depends on Air Canada; keep its shares a small part of your savings." },
        { id: "ben-esop-terms", title: "Read the match and holding rules on HR Connex", body: "Check the match rate, when it vests and how long you must hold the shares before selling." },
      ],
    },
    {
      id: "b-group-plans",
      group: "money",
      name: "Group RRSP and TFSA",
      valueNote: "payroll savings, often lower fees",
      what: "Savings taken straight from your pay. Group RRSP contributions also reduce the tax withheld on each payslip.",
      steps: [{ id: "offer-group-rrsp-tfsa", title: "Compare the group plans with your own TFSA or FHSA", body: "Look at fees and fund choices. Remember your RRSP room is small because of the pension, so the FHSA usually comes first." }],
    },

    // health and wellness
    {
      id: "b-health",
      group: "health",
      name: "Extended health (Premium with leisure travel)",
      value: employerYear("health"),
      valueNote: "a year, paid by Air Canada",
      what: "Physio, massage, psychologist, chiropractor, vision and more at the top plan level, plus emergency medical cover on personal trips.",
      link: { href: "/insurance", label: "Insurance" },
      steps: [
        { id: "offer-manulife-account", title: "Set up the Manulife app and direct deposit", body: "Get your digital card and have claims paid straight to your bank.", when: "Now" },
        {
          id: "offer-paramedical",
          also: ["pay-use-benefits"],
          title: "Use paramedical care before the limits reset",
          body: "Massage, physio and psychologist sessions have yearly dollar limits; unused, they are lost. Look up yours in the app.",
          when: "Before reset",
        },
        { id: "offer-vision", title: "Use vision coverage", body: "Eye exam and glasses or contacts when you need a new prescription." },
        { id: "offer-telemedicine", title: "Install LifeWorks telemedicine", body: "See a doctor by video 24/7 instead of waiting at a walk-in clinic." },
        {
          id: "rec-travel-insurance",
          title: "Save the travel assistance number before you fly",
          body: "Your plan includes leisure travel. Check the days-per-trip limit and whether you must call before treatment.",
          when: "Before trips",
        },
      ],
    },
    {
      id: "b-drugs",
      group: "health",
      name: "Prescription drugs",
      value: employerYear("drugs"),
      valueNote: "a year, paid by Air Canada",
      what: "Prescriptions at the pharmacy, including when travelling. In Quebec it replaces the RAMQ public drug plan.",
      steps: [{ id: "ben-drug-card", title: "Give your pharmacy your Manulife card", body: "So prescriptions are billed directly and you only pay any co-pay at the counter." }],
    },
    {
      id: "b-dental",
      group: "health",
      name: "Dental (Premium)",
      value: employerYear("dental"),
      valueNote: `a year from Air Canada; you pay ${money((benefit("dental").price - benefit("dental").flex) * (1 + PREMIUM_TAX), 2)} a month`,
      what: "Checkups, cleanings and treatment at the top plan level.",
      steps: [
        { id: "offer-dental-checkup", title: "Book a checkup and cleaning", body: "Preventive care is the best-covered part of the plan.", when: "Now" },
        { id: "ben-dental-limits", title: "Check your recall frequency and yearly maximum", body: "Know how often cleanings are covered and the yearly dollar cap, and schedule around them." },
      ],
    },
    {
      id: "b-lsa",
      group: "health",
      name: "Lifestyle Spending Account",
      value: LSA_YEARLY,
      valueNote: "a year to claim",
      what: "Air Canada puts $41.67 a month into it for fitness, wellness, education and more. Claims are taxable, but still free money.",
      link: { href: "/insurance", label: "Insurance" },
      steps: [
        { id: "rec-lsa-claim", title: "Claim the full $500 this plan year", body: "A gym, running shoes, a fitness tracker, a course, books or software all qualify.", when: "Before year end" },
        { id: "ben-lsa-deadline", title: "Find the claim deadline in the Manulife app", body: "Unused dollars usually expire at the end of the plan year; put the date in your calendar." },
      ],
    },
    {
      id: "b-reenrol",
      group: "health",
      name: "Flex dollars and annual enrolment",
      valueNote: `${money(BENEFITS.reduce((t, b) => t + b.flex, 0), 2)} a month of flex dollars, already counted above`,
      what: "Each year you choose plan levels; Air Canada's flex dollars pay for health, drugs and part of dental.",
      steps: [
        {
          id: "rec-benefits-reenrol",
          title: "Re-check your choices at annual enrolment",
          body: "Is Premium dental worth it for how you use it? Does anyone depend on you yet? Move spare flex dollars to the Health Spending Account.",
          when: "Enrolment",
        },
        { id: "offer-medical-credit", title: "Keep receipts for what the plan doesn't pay", body: "Your share of medical, dental and vision costs counts toward the medical expense tax credit." },
      ],
    },

    // protection
    {
      id: "b-disability",
      group: "protection",
      name: "Short- and long-term disability",
      valueNote: `${money(ltd)} a month if you can't work, tax-free`,
      what: `60% of earnings: ${money(benefit("std").pays!.amount)} a week short term, then ${money(ltd)} a month long term. You pay the premiums, so the benefit is generally not taxed.`,
      link: { href: "/insurance", label: "Insurance" },
      steps: [
        { id: "offer-ltd-tax-free", title: "Keep the disability cover", body: "It replaces about all of your take-home if illness or injury stops you working." },
        { id: "ben-std-claim", title: "Know how to start a claim", body: "Find who to call (HR and Manulife), the waiting period and the forms, before you ever need them." },
      ],
    },
    {
      id: "b-life",
      group: "protection",
      name: "Life and accident insurance",
      valueNote: `${money(life)} life + ${money(add)} accidental`,
      what: "Paid to the people you name if you die; the accidental cover pays on top for accidents.",
      link: { href: "/insurance", label: "Insurance" },
      steps: [
        { id: "offer-beneficiaries", title: "Name beneficiaries for life and AD&D", body: "Without one, the money can be stuck in your estate for months.", when: "Now" },
        { id: "rec-life-check", title: "Check you only pay for $160,000", body: "You asked for $237,600 but basic life is capped; confirm your next statement bills the capped amount." },
        { id: "offer-optional-life", title: "Revisit cover when someone depends on you", body: "A partner, a mortgage or children are when optional life becomes worth buying." },
      ],
    },

    // travel, time off and perks
    {
      id: "b-travel",
      group: "perks",
      name: "Travel privileges",
      valueNote: "standby flights from about Mar 1, 2027",
      what: "Cheap standby flights for you and eligible people, starting after 28 weeks.",
      steps: [
        { id: "offer-travel-rules", title: "Read the Employee Travel Site rules", body: "You are responsible for anyone using your privileges, so learn the rules first.", when: "Mar 2027" },
        { id: "offer-plan-trip", title: "Plan a first trip around your vacation", body: "Flexible dates and off-peak flights give the best standby odds." },
      ],
    },
    {
      id: "b-aeroplan",
      group: "perks",
      name: "Aeroplan points",
      value: OFFER.aeroplanPoints * 0.018,
      valueNote: `${(OFFER.aeroplanPoints / 1000).toFixed(0)},000 points a year, at about 1.8¢ on flights`,
      what: "A yearly grant each January, starting 2027.",
      steps: [
        { id: "offer-aeroplan-link", title: "Make sure your Aeroplan number is linked", body: "Confirm on the portal which account receives the points.", when: "Before Jan 2027" },
        { id: "offer-aeroplan-flights", title: "Spend points on flights, not merchandise", body: "They are usually worth about twice as much on flights." },
      ],
    },
    {
      id: "b-time-off",
      group: "perks",
      name: "Vacation and catch-up days",
      valueNote: `${OFFER.vacationWeeks} weeks + ${OFFER.catchUpDays} days of paid time off, worth ${money(weekly * OFFER.vacationWeeks + (weekly / 5) * OFFER.catchUpDays)} of salary`,
      what: "Paid time off each year, prorated for 2026 because you started in August.",
      steps: [{ id: "offer-time-off", title: "Use your days before they expire", body: "Check how many 2026 days you have left and whether any carry over.", when: "Before Dec 31" }],
    },
    {
      id: "b-extras",
      group: "perks",
      name: "Expenses, training and recognition",
      valueNote: "money back and small extras",
      what: "Work expenses you can claim, learning budgets and Shine recognition points.",
      steps: [
        { id: "offer-expenses", title: "Claim work expenses", body: "Read the Travel and Business Expenses policy on HR Connex and claim what you are entitled to." },
        { id: "rec-training", title: "Ask about a training or certification budget", body: "Courses and certifications paid by your employer raise your next salary review." },
        { id: "offer-shine", title: "Redeem Shine points", body: "Recognition points from colleagues can be swapped for gift cards and experiences." },
      ],
    },
  ];
}

/** Every step id on the Benefits tab, so other checklists can leave them out. */
export const BENEFIT_STEP_IDS = new Set(benefitItems().flatMap((b) => b.steps.flatMap((s) => [s.id, ...(s.also ?? [])])));
