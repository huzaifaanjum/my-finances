// The Education course: finance from first principles, in order. The lessons explain how money works;
// the Knowledge rules say what to do about it, so a lesson links to its rule instead of repeating it.

import type { DemoKey } from "@/lib/knowledge/rules";
import { BUILD_LESSONS } from "./buildLessons";
import { CORE_LESSONS } from "./coreLessons";
import { INVEST_LESSONS } from "./investLessons";

export interface Lesson {
  /** starts with edu-, so progress can share the Knowledge store without clashing with a rule */
  id: string;
  unit: string;
  title: string;
  /** the lesson in one line */
  idea: string;
  /** the explanation, in plain words */
  explain: string;
  /** a worked example with numbers */
  example: string;
  /** the one thing to keep */
  remember: string;
  /** how it applies to you, when it does */
  you?: string;
  demo?: DemoKey;
  /** the Knowledge rule with the action to take */
  rule?: { id: string; label: string };
}

export interface Unit {
  id: string;
  title: string;
  /** what the unit answers */
  goal: string;
}

export const UNITS: Unit[] = [
  { id: "big-picture", title: "How wealth is built", goal: "What money is, and the simple formula behind all wealth." },
  { id: "earn", title: "Earning", goal: "Why your income is the biggest engine you have." },
  { id: "keep", title: "Keeping", goal: "How to control the gap between what comes in and what goes out." },
  { id: "compound", title: "Interest and compounding", goal: "The maths that makes money grow, or makes debt explode." },
  { id: "debt", title: "Debt", goal: "How borrowing works, and when it helps or hurts." },
  { id: "tax", title: "Tax", goal: "How tax really works, and how to legally pay less." },
  { id: "invest", title: "Investing", goal: "What you actually own, and why it grows." },
  { id: "markets", title: "Markets and behaviour", goal: "Why prices swing, and how to stay calm while they do." },
  { id: "home", title: "Homes and big purchases", goal: "How to think about the largest cheques you will ever write." },
  { id: "protect", title: "Protecting your money", goal: "How to stop one bad event from undoing years of work." },
  { id: "freedom", title: "Retirement and freedom", goal: "How your money eventually replaces your salary." },
  { id: "plan", title: "Putting it together", goal: "The order to do things in, and the habits that keep you going." },
];

export const LESSONS: Lesson[] = [...CORE_LESSONS, ...INVEST_LESSONS, ...BUILD_LESSONS];

/** The whole course in six lines. */
export const CORE_IDEAS: { title: string; text: string }[] = [
  { title: "Spend less than you earn", text: "The gap is the seed of all wealth. Nothing else works without it." },
  { title: "Own things that grow", text: "Wages pay you once. Assets such as businesses, through stocks, keep paying you." },
  { title: "Give it time", text: "Compound growth is slow, then fast. Time is the ingredient you cannot buy later." },
  { title: "Avoid costly mistakes", text: "High-interest debt, high fees and panic selling do more damage than any bad pick does." },
  { title: "Keep what you make", text: "Use tax-sheltered accounts first. Tax and fees are the returns you can control." },
  { title: "Automate it", text: "A system that runs on payday beats willpower every time." },
];

export const FORMULAS: { name: string; formula: string; note: string }[] = [
  { name: "Net worth", formula: "What you own − what you owe", note: "Your score" },
  { name: "Savings rate", formula: "Saved ÷ take-home pay", note: "Aim for 20% or more" },
  { name: "Wealth", formula: "Gap × return × time", note: "Earn more, spend less, invest, wait" },
  { name: "Rule of 72", formula: "72 ÷ return = years to double", note: "6% doubles in 12 years" },
  { name: "Real return", formula: "Return − inflation", note: "6% − 2% ≈ 4%" },
  { name: "Your number", formula: "Yearly spending × 25", note: "$48,000 a year needs $1.2M" },
  { name: "Safe withdrawal", formula: "Savings × 4%", note: "$1M pays about $40,000 a year" },
  { name: "Emergency fund", formula: "Monthly basics × 3 to 6", note: "Kept in cash" },
  { name: "Recovery after a fall", formula: "Fall ÷ (100% − fall)", note: "−30% needs +43%" },
  { name: "Tax saved by a deduction", formula: "Amount × marginal rate", note: "$1,000 saves about $360" },
  { name: "Own-a-home lost cost", formula: "Price × 5% ÷ 12", note: "$450,000 is $1,875 a month" },
  { name: "Cents per point", formula: "(Cash price − fees) ÷ points", note: "Aim above 1.5¢" },
];

export const READING: { title: string; by: string; why: string }[] = [
  { title: "The Psychology of Money", by: "Morgan Housel", why: "Why behaviour matters more than maths. Start here." },
  { title: "The Wealthy Barber", by: "David Chilton", why: "A Canadian classic, told as a simple story." },
  { title: "Millionaire Teacher", by: "Andrew Hallam", why: "How an ordinary salary builds wealth with index funds." },
  { title: "The Little Book of Common Sense Investing", by: "John C. Bogle", why: "The case for index funds, from the founder of Vanguard." },
  { title: "The Simple Path to Wealth", by: "JL Collins", why: "A clear road map to financial independence." },
  { title: "GetSmarterAboutMoney.ca", by: "Ontario Securities Commission", why: "Free, unbiased Canadian guides and calculators." },
];
