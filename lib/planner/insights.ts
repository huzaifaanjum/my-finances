// Calculations behind the Insights page. Everything here is pure, so it is easy to check by hand.
import { money, percent } from "@/lib/format";
import { dayLabel } from "./calendar";
import { EMPLOYER_HEALTH, INCOME_STREAMS, SALARY, TAKE_HOME_PER_GROSS, type ExpenseId, type StreamKey } from "./config";
import type { Plan } from "./projection";

/** Month index when savings cover 3 months of costs (-1 if never), and the share of savings that comes from bonuses. */
export function safetyNet(plan: Plan) {
  return {
    threeMonthIndex: plan.reachIndex(plan.exp.total * 3),
    bonusReliance: plan.added > 0 ? plan.bonusTotal / plan.added : 0,
  };
}

const spentOn = (plan: Plan, ids: ExpenseId[]) =>
  plan.exp.categories.filter((c) => ids.includes(c.id)).reduce((t, c) => t + c.monthly, 0);

/* ---------- health check ---------- */

export type HealthLevel = "ok" | "watch" | "act";

export interface HealthTile {
  title: string;
  level: HealthLevel;
  value: string;
  guide: string;
  text: string;
}

export function healthTiles(plan: Plan): HealthTile[] {
  const { left, rate, net, rent, needs, exp, far, low, lowDate, bonusTotal, last } = plan;
  const nt = net || 1;
  const { threeMonthIndex: mo3, bonusReliance: rel } = safetyNet(plan);
  return [
    {
      title: "Savings rate",
      level: left < 0 ? "act" : rate >= 0.2 ? "ok" : rate >= 0.1 ? "watch" : "act",
      value: percent(rate),
      guide: "Target 20% or more",
      text: left < 0 ? "You spend more than you earn." : rate >= 0.2 ? "You keep more than a fifth of your pay." : `Saving ${money(0.2 * net - left)} more a month reaches 20%.`,
    },
    {
      title: "Rent",
      level: !rent || rent / nt <= 0.3 ? "ok" : rent / nt <= 0.4 ? "watch" : "act",
      value: percent(rent / nt),
      guide: "Guideline about 30% of take-home",
      text: !rent ? "No rent entered." : rent / nt <= 0.3 ? "Housing is within the guideline." : `About ${money(rent - 0.3 * net)} a month above 30%. Your biggest single cost.`,
    },
    {
      title: "Needs",
      level: needs / nt <= 0.5 ? "ok" : needs / nt <= 0.6 ? "watch" : "act",
      value: percent(needs / nt),
      guide: "Guideline 50% of take-home",
      text: needs / nt <= 0.5 ? "Essentials leave room for the rest." : "Essentials crowd out wants and savings. Rent is most of it.",
    },
    {
      title: "Safety net",
      level: mo3 < 0 ? "act" : mo3 <= 12 ? "ok" : mo3 <= 24 ? "watch" : "act",
      value: mo3 < 0 ? "Not reached" : mo3 === 0 ? "Reached" : far[mo3].label,
      guide: `${money(exp.total * 3)} covers 3 months of costs`,
      text: mo3 < 0 ? "Raise your savings to build a cushion." : mo3 === 0 ? "You already have it." : `That is ${mo3} months away. 1 month arrives ${plan.eta(exp.total)}.`,
    },
    {
      title: "Lowest cash",
      level: low.bal < 0 ? "act" : low.bal < exp.fixed ? "watch" : "ok",
      value: money(low.bal),
      guide: `on ${dayLabel(lowDate)}`,
      text:
        low.bal < 0
          ? `Your account would go negative. Keep ${money(-low.bal)} extra in chequing.`
          : low.bal < exp.fixed
            ? "Thin cushion before payday. Avoid big purchases late in the month."
            : "Comfortable cushion all month.",
    },
    {
      title: "Bonus reliance",
      level: rel <= 0.25 ? "ok" : rel <= 0.5 ? "watch" : "act",
      value: percent(rel),
      guide: `of what you add by ${last.label}`,
      text: !bonusTotal
        ? "None in this period. Your plan runs on pay alone."
        : rel <= 0.25
          ? "Most of your savings come from steady pay."
          : "A big share depends on bonuses you might not get.",
    },
  ];
}

/* ---------- guidelines vs you ---------- */

export type GuidelineStatus = "good" | "ok" | "bad";

export interface GuidelineRow {
  group: string;
  name: string;
  sub: string;
  guideline: string;
  value: number;
  display: string;
  status: GuidelineStatus;
  /** bar fill and guideline tick, as fractions of the bar */
  fill: number;
  tick: number;
}

const share = (v: number) => (Math.abs(v) < 0.1 && v !== 0 ? `${(v * 100).toFixed(1)}%` : percent(v));
const monthsOf = (v: number) => `${v.toFixed(1)} mo`;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function guidelineRows(plan: Plan): GuidelineRow[] {
  const { net, left, needs, wants, rent, exp, startBalance, last, low, lowDate } = plan;
  const nt = net || 1;
  const P = (v: number) => v / nt;
  const mo = (v: number) => (exp.total ? v / exp.total : 0);
  const { bonusReliance } = safetyNet(plan);

  type Spec = [group: string, name: string, sub: string, guideline: string, value: number, fmt: (v: number) => string, good: number, ok: number, higherIsBetter: boolean, barMax: number];
  const specs: Spec[] = [
    ["Big picture", "Savings rate", "left over after all costs", "20% or more", P(left), share, 0.2, 0.15, true, 0.4],
    ["Big picture", "Needs", "rent, bills, groceries, transit, health", "50% or less", P(needs), share, 0.5, 0.55, false, 1],
    ["Big picture", "Wants", "subscriptions, eating out, shopping, fun", "30% or less", P(wants), share, 0.3, 0.35, false, 0.6],
    ["Spending", "Rent", "", "30% or less", P(rent), share, 0.3, 0.35, false, 0.6],
    ["Spending", "Bills", "electricity, phone, Wi-Fi", "10% or less", P(spentOn(plan, ["electricity", "phone", "wifi"])), share, 0.1, 0.12, false, 0.2],
    ["Spending", "Transit", "Opus Metro pass", "10% or less", P(spentOn(plan, ["transit"])), share, 0.1, 0.15, false, 0.3],
    ["Spending", "Groceries", "", "15% or less", P(spentOn(plan, ["groceries"])), share, 0.15, 0.18, false, 0.3],
    ["Spending", "Eating out", "", "5% or less", P(spentOn(plan, ["eatingOut"])), share, 0.05, 0.08, false, 0.15],
    ["Spending", "Shopping and fun", "shopping, entertainment, other", "10% or less", P(spentOn(plan, ["shopping", "entertainment", "other"])), share, 0.1, 0.15, false, 0.3],
    ["Spending", "Subscriptions", "", "2% or less", P(exp.groups[1]), share, 0.02, 0.03, false, 0.06],
    ["Safety", "Emergency fund today", "savings you hold now", "3 to 6 months of costs", mo(startBalance), monthsOf, 3, 1, true, 6],
    ["Safety", `Emergency fund by ${last.label}`, "projected", "3 to 6 months of costs", mo(last.balance), monthsOf, 3, 1, true, 6],
    ["Safety", "Lowest cash balance", `on ${dayLabel(lowDate)}`, "never below $0", low.bal, (v) => money(v), exp.fixed, 0, true, Math.max(exp.fixed * 2, low.bal, 1)],
    ["Safety", "Bonus reliance", "share of what you add", "25% or less", bonusReliance, share, 0.25, 0.5, false, 1],
    ["Safety", "Pension", "employer matches up to 6%", "take the full match", 1, () => "6%", 1, 1, true, 1],
  ];

  return specs.map(([group, name, sub, guideline, value, fmt, good, ok, hi, max]) => ({
    group,
    name,
    sub,
    guideline,
    value,
    display: fmt(value),
    status: hi ? (value >= good ? "good" : value >= ok ? "ok" : "bad") : value <= good ? "good" : value <= ok ? "ok" : "bad",
    fill: clamp01(value / max),
    tick: clamp01((hi && ok === 0 ? ok : good) / max),
  }));
}

/* ---------- income target ---------- */

export interface IncomeNeed {
  label: string;
  amount: number;
}

export interface IncomeTarget {
  needs: IncomeNeed[];
  /** the need that sets the target */
  binding: IncomeNeed;
  /** monthly take-home that fits all guidelines, rounded up to $50 */
  target: number;
  gap: number;
  /** yearly gross salary that gives a monthly take-home */
  grossFor: (takeHome: number) => number;
}

export function incomeTarget(plan: Plan): IncomeTarget {
  const { net, rent, needs, exp } = plan;
  const list: IncomeNeed[] = [
    { label: "For rent to be 30% of take-home", amount: rent / 0.3 },
    { label: "For needs to be 50% of take-home", amount: needs / 0.5 },
    { label: "To save 20% at today's spending", amount: exp.total / 0.8 },
  ];
  const binding = list.reduce((a, b) => (b.amount > a.amount ? b : a));
  const target = Math.ceil(binding.amount / 50) * 50;
  return {
    needs: list,
    binding,
    target,
    gap: Math.max(0, target - net),
    grossFor: (v) => (v <= net ? (SALARY * v) / (net || 1) : SALARY + ((v - net) * 12) / TAKE_HOME_PER_GROSS),
  };
}

export interface AutoIncome {
  name: string;
  detail: string;
  monthly: number;
}

/** Extra monthly money that needs no extra work: interest, cashback and a tax refund. */
export function automaticIncome(plan: Plan): AutoIncome[] {
  const bal = Math.max(0, plan.last.balance);
  return [
    { name: "Interest on savings", detail: `3% in a high-interest account on your ${money(bal)} balance`, monthly: (bal * 0.03) / 12 },
    { name: "Cashback credit card", detail: "1.5% back on everyday spending, paid off monthly", monthly: Math.max(0, plan.exp.total - plan.rent) * 0.015 },
    { name: "Tax refund (FHSA or RRSP)", detail: "about $1,400 a year, spread over 12 months", monthly: 1400 / 12 },
  ];
}

/** A mix of income streams that closes the gap, for the "Try this plan" button. */
export function exampleStreamMix(plan: Plan, gap: number, auto: number): [StreamKey, number][] {
  const mix: [StreamKey, number][] = [
    ["rs_raise", 225],
    ["rs_room", Math.min(1500, Math.round(plan.rent / 2 / 50) * 50)],
    ["rs_free", 400],
    ["rs_side", 225],
  ];
  const remaining = gap - auto - mix.reduce((t, m) => t + m[1], 0);
  if (remaining > 0) mix.push(["rs_dig", Math.min(2000, Math.ceil(remaining / 25) * 25)]);
  return mix;
}

export const clearedStreams = (): [StreamKey, number][] => INCOME_STREAMS.map((s) => [s.key, 0]);

/* ---------- pay package ---------- */

export interface PackageLine {
  name: string;
  amount: number;
}

export function payPackage(base: number): PackageLine[] {
  return [
    { name: "Base salary", amount: base },
    { name: "Annual incentive (target 8%)", amount: base * 0.08 },
    { name: "Employer pension match (6%)", amount: base * 0.06 },
    { name: "Employer-paid health and dental", amount: EMPLOYER_HEALTH },
  ];
}

/** Years of raises at `rate` to grow today's salary to `base`. */
export const yearsOfRaises = (base: number, rate: number) => Math.ceil(Math.log(base / SALARY) / Math.log(1 + rate));
