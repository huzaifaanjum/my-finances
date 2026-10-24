// One checklist for everything worth doing with your pay, offer and savings.
// It merges the old My offer and Payslips checklists and the Overview tips. Ids are the
// originals, so ticks saved before the merge still show; `also` lists ids of duplicates
// folded into a step, which count as done too.

import { money } from "@/lib/format";
import { EMPLOYER_HEALTH, INSURANCE_PREMIUMS, OFFER } from "@/lib/offer";
import { marginalFor } from "@/lib/payslips/forecast";

export interface Step {
  /** saved with the Knowledge progress, so keep it stable */
  id: string;
  also?: string[];
  title: string;
  body: string;
  /** a deadline or timing, shown as a tag */
  when?: string;
}

export interface Area {
  title: string;
  why: string;
  steps: Step[];
}

export function checklist(year = new Date().getFullYear()): Area[] {
  const base = OFFER.salary / 12;
  const pension = base * OFFER.pensionMax;
  const m = marginalFor({ base, pension, benefits: EMPLOYER_HEALTH }, year + 1);
  const match = OFFER.salary * OFFER.pensionMax;

  return [
    {
      title: "Savings habits",
      why: "The plan only works if the money actually moves. These keep it on track without willpower.",
      steps: [
        {
          id: "rec-spending-cap",
          title: "Check two months of spending against the plan",
          body: "Compare what you really spent with the expenses on the Plan tab, and fix the numbers that are off so every projection stays honest.",
          when: "Next 2 months",
        },
        {
          id: "pay-bump-transfer",
          title: "Schedule a transfer for the late-year bump",
          body: "Once EI and QPP reach their yearly maximums the deposit jumps for the last months of the year. Set a recurring transfer to your TFSA or FHSA from September to December so the extra never reaches spending.",
          when: "Before Sep",
        },
        {
          id: "pay-raise-split",
          title: "Save half of every raise and incentive",
          body: `When pay goes up, raise your automatic transfer by half of the extra take-home. On a 3% raise that is about ${money((OFFER.salary * 0.03 * m.keep) / 1000 / 12 / 2)} more a month saved, and you still feel the raise.`,
          when: "Each January",
        },
        {
          id: "rec-review",
          title: "Review the plan every quarter",
          body: "Update take-home from your latest payslip, adjust expenses, and check that the Goals and Millionaire dates still hold.",
          when: "Quarterly",
        },
      ],
    },
    {
      title: "Pay less tax, legally",
      why: `Your marginal rate is about ${Math.round(m.rate * 100)}%, so every dollar sheltered from tax is worth a lot.`,
      steps: [
        {
          id: "pay-rrsp-fhsa",
          title: "Shelter money in an FHSA, then an RRSP",
          body: `Each $1,000 contributed cuts tax by about ${money(m.rrsp)}. The FHSA comes first if you may buy a home: $8,000 a year, deductible like an RRSP and tax-free when used for a first home.`,
          when: "FHSA by Dec 31",
        },
        {
          id: "pay-source-deductions",
          title: "Get the refund every month, not once a year",
          body: "If you contribute to an RRSP or FHSA regularly, file form T1213 with the CRA and TP-1016-V with Revenu Québec. Once approved, Air Canada withholds less tax from each payslip.",
        },
        {
          id: "pay-bonus-rrsp",
          title: "Route the March incentive into your RRSP",
          body: `Bonuses are taxed at your marginal rate, so you keep only about ${money(m.keep)} of each $1,000. Ask HR whether the incentive can go straight into the Group RRSP, where it is not taxed at source.`,
          when: "Before March",
        },
        {
          id: "pay-claim-amounts",
          title: "Check your TD1 and TP-1015.3 claim amounts",
          body: 'Your payslip\'s "Net Claim Amt." shows only the basic personal amounts. If you have tuition carry-forwards, a dependant or other credits, updating the forms raises every deposit.',
        },
        {
          id: "offer-medical-credit",
          title: "Keep receipts for what the plan does not pay",
          body: "Your share of medical, dental and vision costs can count toward the medical expense tax credit on both federal and Quebec returns.",
          when: "Tax time",
        },
      ],
    },
    {
      title: "Pension and investing",
      why: "The match is the best return you will ever get: 100% on day one. The rest is about putting savings somewhere cheap and automatic.",
      steps: [
        {
          id: "offer-keep-6",
          title: "Keep contributing 6%",
          body: `That gets the full ${money(match)} a year match. Dropping to 3% would cost you ${money(match / 2)} a year of free money.`,
        },
        {
          id: "offer-dc-funds",
          also: ["pay-pension-fund"],
          title: "Choose your pension investments",
          body: `${money(pension * 2)} goes in every month. Log in to Manulife and check which fund it sits in: with 35+ years to go, a low-fee growth or target-date fund beats a cautious default by hundreds of thousands at 65.`,
          when: "Now",
        },
        {
          id: "offer-group-rrsp-tfsa",
          title: "Look at the Group RRSP and TFSA",
          body: "Payroll deductions make saving automatic, and group plans often have lower fees than a bank. Group RRSP deductions also lower the tax taken off each paycheque.",
        },
        {
          id: "offer-esop",
          title: "Join the ESOP, but keep it small",
          body: "Air Canada matches part of what you put into its shares, which is free money. Your job already depends on Air Canada, so don't let its shares become a big part of your savings.",
        },
      ],
    },
    {
      title: "Health, dental and insurance",
      why: `You pay ${money(INSURANCE_PREMIUMS, 2)} a month for insurance, and Air Canada pays ${money(EMPLOYER_HEALTH, 2)} for health and dental that Quebec taxes you on. Unused coverage is money left on the table.`,
      steps: [
        {
          id: "offer-manulife-account",
          title: "Set up your Manulife member account and app",
          body: "Get your digital benefits card, read the coverage booklet, and add direct deposit so claims are paid straight to your bank.",
          when: "Now",
        },
        {
          id: "offer-dental-checkup",
          title: "Book a dental checkup and cleaning",
          body: "Preventive care is usually the best-covered part of a dental plan. Check how often cleanings are covered and book the first one.",
          when: "Now",
        },
        {
          id: "offer-paramedical",
          also: ["pay-use-benefits"],
          title: "Use paramedical and vision coverage before it resets",
          body: `Physio, massage, psychologist, eye exams and glasses have yearly limits that are lost if unused. You already pay Quebec tax on ${money(EMPLOYER_HEALTH * 12)} a year of this coverage.`,
          when: "Before limits reset",
        },
        {
          id: "offer-vision",
          title: "Check vision coverage",
          body: "If the plan covers eye exams, glasses or contacts, use it when you need a new prescription.",
        },
        {
          id: "offer-telemedicine",
          title: "Install LifeWorks telemedicine",
          body: "Talk to a doctor 24/7 by video instead of waiting at a walk-in clinic. Included for you and your immediate family.",
        },
        {
          id: "offer-beneficiaries",
          title: "Name beneficiaries",
          body: "Set a beneficiary for life insurance, AD&D and your DC pension on the Manulife site. Without one, money can get stuck in your estate.",
          when: "Now",
        },
        {
          id: "offer-ltd-tax-free",
          title: "Know that your disability cover is tax-free",
          body: "You pay the long-term disability premiums from after-tax pay, so if you ever claim, the benefit is generally not taxed. That makes it worth keeping.",
        },
        {
          id: "offer-optional-life",
          title: "Skip optional life insurance unless someone depends on you",
          body: "Optional employee, spouse and child life cover costs extra. Only add it if a partner or family relies on your income.",
        },
      ],
    },
    {
      title: "Your payslips",
      why: "Payroll mistakes happen, and they are easiest to fix the month they appear.",
      steps: [
        {
          id: "pay-upload-monthly",
          title: "Upload each payslip the day it arrives",
          body: "It lands on the last banking day of the month. Uploading it to the Payslips tab keeps the forecast accurate and flags anything that moved.",
          when: "Monthly",
        },
        {
          id: "pay-check-lines",
          title: "Look for new or changed lines",
          body: "The Payslips tab compares each payslip with the one before. New deductions, a changed pay rate or a retro line all deserve a question to HR if you don't recognise them.",
        },
        {
          id: "pay-year-end",
          title: "Match December's year-to-date totals to your T4 and RL-1",
          body: "In February, check that gross, tax, QPP, EI and QPIP on the slips match the year-to-date column of your last payslip of the year.",
          when: "February",
        },
      ],
    },
    {
      title: "Perks, time off and extras",
      why: "Smaller things that add up over a year, plus two perks most people underuse: free points and cheap standby flights.",
      steps: [
        {
          id: "offer-aeroplan-link",
          title: "Make sure your Aeroplan account is linked",
          body: "The 15,000-point grant arrives each January, starting January 2027. Confirm on the portal which Aeroplan number it goes to.",
          when: "Before Jan 2027",
        },
        {
          id: "offer-aeroplan-flights",
          title: "Spend points on flights, not merchandise",
          body: "Points usually go much further on flights than on gift cards or merchandise. 15,000 points can cover a short-haul flight in Canada.",
        },
        {
          id: "offer-travel-rules",
          title: "Read the Employee Travel Site rules",
          body: "Travel privileges start after 28 weeks, around Mar 1, 2027. You are responsible for anyone using your privileges following the rules, so learn them first.",
          when: "Mar 2027",
        },
        {
          id: "offer-plan-trip",
          title: "Plan a trip around your vacation days",
          body: "Pair standby travel with your three weeks of vacation and catch-up days. Flexible dates and off-peak flights give the best standby odds.",
        },
        {
          id: "offer-time-off",
          title: "Use your vacation and catch-up days",
          body: "Both are prorated for 2026. Look up how many you have left and whether they carry over, so none expire unused.",
          when: "Before Dec 31",
        },
        {
          id: "offer-aip-goals",
          title: "Ask how your incentive is scored",
          body: "The incentive ranges from 8% to 16% of salary partly on your own objectives. Ask your manager what they are, so you can aim above target.",
        },
        {
          id: "offer-expenses",
          title: "Claim work expenses",
          body: "Read the Travel and Business Expenses policy on HR Connex and claim what you are entitled to instead of paying it yourself.",
        },
        {
          id: "offer-shine",
          title: "Redeem Shine points",
          body: "Recognition points from colleagues build up in your Shine balance and can be swapped for gift cards and experiences.",
        },
      ],
    },
  ];
}
