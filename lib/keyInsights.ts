// Key insights from every tab, as plain data so the Insights tab can show them in one place.
// Each source keeps its own wording; duplicates across sources are left out here.

import { payMarginal } from "@/lib/pay";
import { benefit, COSTS, LSA_MONTHLY, LSA_YEARLY } from "@/lib/benefits";
import { deltaMoney, money, percent } from "@/lib/format";
import { COMP, OFFER } from "@/lib/offer";
import {
  employerBenefits,
  employerPension,
  friendly,
  MONTHS_LONG,
  netDrivers,
  pensionLine,
  periodLabel,
  retroDeductions,
  usualNet,
} from "@/lib/payslips/analysis";
import { forecast, marginal, type ForecastSettings } from "@/lib/payslips/forecast";
import type { Payslip } from "@/lib/payslips/types";
import { SLIDERS } from "@/lib/planner/config";
import { COLOR } from "@/lib/colors";
import { AIRCANADA, FLEXSPRING, yearlyTotal } from "@/lib/jobs";
import { PAY as PAYDATA } from "@/lib/pay";
import type { TaxSummary } from "@/lib/taxSummary";

export type Topic = "tax" | "career" | "future" | "payslips" | "offer" | "insurance";
export type Tone = "good" | "watch" | "info";

export interface KeyInsight {
  id: string;
  topic: Topic;
  title: string;
  value: string;
  body: string;
  tone: Tone;
  /** a one-click fix: set the plan's take-home pay */
  setNet?: number;
}

export const TOPICS: Record<Topic, { title: string; href: string; color: string }> = {
  tax: { title: "Tax", href: "/tax", color: COLOR.tax },
  career: { title: "Air Canada vs FlexSpring", href: "/offer", color: COLOR.keep },
  future: { title: "Retirement and perks", href: "/pension", color: COLOR.pension },
  payslips: { title: "Payslips", href: "/payslips", color: COLOR.keep },
  offer: { title: "Job offer", href: "/offer", color: COLOR.extra },
  insurance: { title: "Insurance", href: "/insurance", color: COLOR.insurance },
};

/** What the offer letter means for your money and your job. */
export function offerInsights(): KeyInsight[] {
  const { aip, match } = COMP;
  const aipMax = OFFER.salary * OFFER.aipMax;
  const weekly = OFFER.salary / 52;
  const list: Omit<KeyInsight, "topic">[] = [
    {
      id: "offer-match",
      title: "You get the full pension match",
      value: `${money(match * 2)} a year`,
      body: `You put in 6% of salary, the most allowed, and Air Canada matches it, so ${money(match)} of free money a year goes into your DC pension. Dropping to 3% would raise take-home but cut the match in half.`,
      tone: "good",
    },
    {
      id: "offer-probation",
      title: "Probation ends Feb 17, 2027",
      value: "6 months",
      body: "Until then your manager can extend probation or end your job, and the severance terms do not apply yet.",
      tone: "watch",
    },
    {
      id: "offer-signing",
      title: "The signing bonus has conditions",
      value: `2 × ${money(OFFER.signing[0].amount)}`,
      body: "Paid after 6 months (Feb 2027) and 12 months (Aug 2027), only if you are still employed then. It is taxed like salary, so expect roughly 55 to 60% of it in your account.",
      tone: "watch",
    },
    {
      id: "offer-aip",
      title: "The incentive is not guaranteed",
      value: `${money(aip)} to ${money(aipMax)}`,
      body: "Target is 8% of salary and the maximum is 16%, depending on company, department and personal results. Air Canada can change the plan at any time, so plan around the target, not the maximum.",
      tone: "info",
    },
    {
      id: "offer-severance",
      title: "Severance grows with every year",
      value: `${money(weekly * 3)} to start`,
      body: `After probation: 3 weeks of base pay plus 3 weeks per year of service, up to 60 weeks. A week of base pay is ${money(weekly)}, so after 5 years it would be 18 weeks, about ${money(weekly * 18)}.`,
      tone: "info",
    },
    {
      id: "offer-time-off",
      title: "Time off",
      value: `${OFFER.vacationWeeks} weeks + ${OFFER.catchUpDays} days`,
      body: "Three weeks of vacation a year plus five catch-up days, both prorated for 2026 because you started in August.",
      tone: "good",
    },
    {
      id: "offer-perks",
      title: "Perks with a cash value",
      value: `${(OFFER.aeroplanPoints / 1000).toFixed(0)}k Aeroplan a year`,
      body: "Points arrive each January, starting 2027. Travel privileges start after 28 weeks (Mar 1, 2027). The ESOP matches part of what you put into Air Canada shares, and a Group RRSP and TFSA are open to you.",
      tone: "good",
    },
    {
      id: "offer-fine-print",
      title: "Fine print worth knowing",
      value: "Arbitration",
      body: "Disputes go to private arbitration in Quebec and you give up class actions. Keeping your work permit valid is your job; if it lapses, employment ends without notice or pay.",
      tone: "watch",
    },
  ];
  return list.map((i) => ({ ...i, topic: "offer" }));
}

/** "about all" reads better than "101%" when cover matches take-home. */
const shareOf = (v: number) => (v >= 0.95 && v <= 1.05 ? "about all" : `about ${percent(v)}`);

/** What your group insurance means for your money. `planNet` is the plan's monthly take-home. */
export function insuranceInsights(planNet: number): KeyInsight[] {
  const ltd = benefit("ltd");
  const life = benefit("life");
  const m = payMarginal(new Date().getFullYear());
  const ltdShare = planNet ? ltd.pays!.amount / planNet : 0;
  const list: Omit<KeyInsight, "topic">[] = [
    {
      id: "ins-ltd",
      title: "Disability cover matches your take-home",
      value: `${money(ltd.pays!.amount)} a month`,
      body: `Long-term disability pays 60% of gross, but because you pay the premiums yourself the benefit is generally tax-free. That is ${shareOf(ltdShare)} of the ${money(planNet)} take-home in your plan, the most valuable cover you have.`,
      tone: "good",
    },
    {
      id: "ins-employer",
      title: `Air Canada pays ${money(COSTS.employerTotal * 12)} a year for your benefits`,
      value: `${money(COSTS.employerTotal, 2)} a month`,
      body: `${money(COSTS.flex, 2)} of flex dollars (all of extended health and drugs, part of dental) plus ${money(COSTS.employerTaxable - COSTS.flex, 2)} premium tax, and ${money(LSA_MONTHLY, 2)} into your Lifestyle Spending Account.`,
      tone: "good",
    },
    {
      id: "ins-premium-tax",
      title: "Quebec adds 9% to every premium",
      value: `${money(COSTS.tax, 2)} a month`,
      body: `Manulife's price for what you pay is ${money(COSTS.you, 2)}; Quebec's insurance premium tax brings it to the ${money(COSTS.youTotal, 2)} on your payslip, ${money(COSTS.tax * 12)} a year.`,
      tone: "info",
    },
    {
      id: "ins-life-cap",
      title: "You asked for more life cover than you get",
      value: `${money(life.pays!.amount)} cap`,
      body: "You chose 30× monthly earnings ($237,600), but basic life stops at $160,000. Manulife bills what you asked for until it is approved, so check your next statement to be sure you only pay for $160,000.",
      tone: "watch",
    },
    {
      id: "ins-life-size",
      title: "Life cover is about 1.7× your salary",
      value: `${(life.pays!.amount / OFFER.salary).toFixed(1)}× salary`,
      body: "Plenty if nobody depends on your income. If a partner or children ever do, the usual guide is 5 to 10× salary; that is when optional life becomes worth buying.",
      tone: "info",
    },
    {
      id: "ins-lsa",
      title: "$500 a year to claim",
      value: `${money(LSA_YEARLY)} a year`,
      body: `Air Canada puts ${money(LSA_MONTHLY, 2)} a month into your Lifestyle Spending Account. Claims are a taxable benefit, so $500 is worth about ${money(LSA_YEARLY * (1 - m.rate))} after tax, still free money for a gym, gear or a course.`,
      tone: "watch",
    },
    {
      id: "ins-qc-tax",
      title: "Quebec taxes your health benefits",
      value: `≈ ${money(COSTS.employerTaxable * m.qcRate)} a month`,
      body: `The ${money(COSTS.employerTaxable, 2)} a month Air Canada pays for health and dental counts as income for Quebec tax (not federal), about ${money(COSTS.employerTaxable * m.qcRate * 12)} a year. Using the coverage is how you get that back.`,
      tone: "info",
    },
    {
      id: "ins-gaps",
      title: "No critical illness or extra life cover",
      value: "Not needed yet",
      body: "Disability insurance already replaces income if you fall ill. Critical illness and optional life are worth a look only once someone depends on you.",
      tone: "good",
    },
  ];
  return list.map((i) => ({ ...i, topic: "insurance" }));
}

/** Last calendar day of a month, a stand-in for the last banking day. */
const payDay = (year: number, month: number) => `${MONTHS_LONG[month].slice(0, 3)} ${new Date(year, month + 1, 0).getDate()}`;

/** What your payslips say. `used` is oldest first and not empty. */
export function payslipInsights(used: Payslip[], settings: ForecastSettings, pensionSoFar: number, planNet: number): KeyInsight[] {
  const latest = used[used.length - 1].data;
  const prev = used[used.length - 2]?.data;
  const fc = forecast(latest, settings, 50, pensionSoFar);
  const year = Number(latest.periodEnd.slice(0, 4)) || new Date().getFullYear();
  const m = marginal(latest, year + 1);
  const usual = usualNet(latest);
  const out: Omit<KeyInsight, "topic">[] = [];

  const next = fc.months[0];
  if (next && !next.retired) {
    out.push({
      id: "pay-next",
      title: "Your next deposit",
      value: `≈ ${money(next.net)}`,
      body: `Expected around ${payDay(next.year, next.month)} if nothing on the payslip changes${next.bonus ? `, including ${money(next.bonus)} of bonus before tax` : ""}. If it is more than a few dollars off, check the new payslip for a new line or a changed amount.`,
      tone: "info",
    });
  }

  const rounded = Math.round(usual / SLIDERS.net.step) * SLIDERS.net.step;
  const gap = usual - planNet;
  const inLine = Math.abs(gap) < 10;
  out.push({
    id: "pay-plan",
    title: "Your plan vs your payslip",
    value: inLine ? "In line" : `${deltaMoney(gap)} a month`,
    body: inLine
      ? `Your plan uses ${money(planNet)} of take-home pay, which matches the usual ${money(usual, 2)} on your payslip.`
      : `Your plan assumes ${money(planNet)} of take-home, but your payslip's usual deposit is ${money(usual, 2)}. Over a year that is ${money(Math.abs(gap) * 12)} ${gap > 0 ? "more" : "less"} than planned.`,
    tone: inLine ? "good" : "watch",
    setNet: !inLine && rounded >= SLIDERS.net.min && rounded <= SLIDERS.net.max ? rounded : undefined,
  });

  if (prev) {
    const diff = latest.current.net - prev.current.net;
    const top = netDrivers(prev, latest).slice(0, 3);
    out.push({
      id: "pay-change",
      title: `${periodLabel(latest)} vs ${periodLabel(prev)}`,
      value: deltaMoney(diff),
      body: top.length
        ? `Mostly ${top.map((c) => `${c.label.toLowerCase()} (${deltaMoney(c.diff)})`).join(", ")}.${top.some((c) => /retro/i.test(c.label)) ? " Retro catch-ups are one-time, so the higher amount is the normal one." : ""}`
        : "Nothing changed between the two payslips.",
      tone: diff >= 0 ? "good" : "watch",
    });
  }

  out.push({
    id: "pay-marginal",
    title: "Your marginal tax rate",
    value: percent(m.rate),
    body: `On a full year at this salary, each extra $1,000 of pay (a bonus or raise) leaves you about ${money(m.keep)} after tax and plans. The flip side: every $1,000 you put in an RRSP or FHSA cuts your tax by about ${money(m.rrsp)}.`,
    tone: "info",
  });

  const nextYear = fc.months.filter((x) => x.year === year + 1 && !x.retired);
  if (nextYear.length === 12) {
    const eiStop = nextYear.find((x) => x.ei === 0);
    const qppStop = nextYear.find((x) => x.qpp === 0);
    if (eiStop || qppStop) {
      out.push({
        id: "pay-bump",
        title: `Bigger deposits late in ${year + 1}`,
        value: `+${money(nextYear[11].net - nextYear[3].net)} a month`,
        body: `You pay the year's maximum ${[eiStop && `EI by ${MONTHS_LONG[eiStop.month]}`, qppStop && `QPP by ${MONTHS_LONG[qppStop.month]}`].filter(Boolean).join(" and ")}, so those deductions stop and the deposit rises until they restart in January. Decide now where that money goes.`,
        tone: "good",
      });
    }
  }

  const match = employerPension(latest);
  const benefits = employerBenefits(latest);
  if (match + benefits > 0) {
    out.push({
      id: "pay-employer",
      title: "Air Canada pays more than your gross",
      value: `+${money(match + benefits)} a month`,
      body: `${money(match, 2)} pension match and ${money(benefits, 2)} of health and dental premiums, about ${money((match + benefits) * 12)} a year on top of your ${money(latest.payRate * 12)} salary.`,
      tone: "good",
    });
  }

  const retired = fc.months.findIndex((x) => x.retired);
  const atRetire = fc.months[(retired > 0 ? retired : fc.months.length) - 1].pot;
  out.push({
    id: "pay-pension",
    title: "Your DC pension",
    value: `${money(atRetire)} at 65`,
    body: `${money(pensionLine(latest) + match, 2)} goes in every month (you and Air Canada, 6% each); ${money(pensionSoFar)} so far. At ${Math.round(settings.growth * 100)}% a year that grows to about ${money(atRetire)} before fees and inflation.`,
    tone: "good",
  });

  out.push({
    id: "pay-ytd",
    title: "Year to date",
    value: `${money(latest.ytd.net)} kept`,
    body: `Of ${money(latest.ytd.gross)} gross so far this year, ${money(latest.ytd.taxes)} (${percent(latest.ytd.taxes / (latest.ytd.gross || 1))}) went to income tax and government plans and ${money(latest.ytd.deductions)} to your pension and insurance. These totals should match your T4 and RL-1 in February.`,
    tone: "info",
  });

  const withRetro = used.filter((p) => retroDeductions(p.data) > 0);
  if (withRetro.length) {
    out.push({
      id: "pay-retro",
      title: "One-time catch-ups",
      value: money(withRetro.reduce((t, p) => t + retroDeductions(p.data), 0), 2),
      body: `${withRetro.map((p) => periodLabel(p.data)).join(", ")} took retro deductions for insurance that started before it was deducted (${withRetro
        .flatMap((p) => p.data.afterTax.filter((l) => /retro/i.test(l.label) && l.current))
        .map((l) => friendly(l.label).replace(/^Retro /i, "").toLowerCase())
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ")}). They don't repeat.`,
      tone: "info",
    });
  }
  return out.map((i) => ({ ...i, topic: "payslips" }));
}

/* ---------- tax ---------- */

/** Your 2026 return and the moves that change it. */
export function taxInsights(t: TaxSummary): KeyInsight[] {
  const list: Omit<KeyInsight, "topic">[] = [
    {
      id: "tax-refund",
      title: "Your 2026 refund estimate",
      value: money(t.refund),
      body: `${money(t.fedRefund)} federal and ${money(t.qcRefund)} Quebec on about ${money(t.income)} from FlexSpring and Air Canada. ${money(t.carryValue)} of it comes from tuition carried forward from past years.`,
      tone: "good",
    },
  ];
  if (t.unclaimed > 0.5)
    list.push({
      id: "tax-unclaimed",
      title: "Quebec tuition credit you didn't claim",
      value: money(t.unclaimed),
      body: "Your 2025 Quebec return used only that year's tuition. Ask Revenu Québec to adjust 2025 (line 398 to $2,503.79) and get it now instead of next spring. Same money, sooner.",
      tone: "watch",
    });
  if (!t.hasFhsa)
    list.push({
      id: "tax-fhsa",
      title: "Open an FHSA before Dec 31",
      value: `+${money(t.fhsaValue)}`,
      body: "That's what $8,000 in it would add to your refund. Even with $0 in it, opening it keeps 2026's $8,000 of room, which carries to 2027.",
      tone: "watch",
    });
  list.push(
    {
      id: "tax-best",
      title: "With the FHSA and your RRSP room",
      value: `up to ${money(t.best)}`,
      body: `Your refund if you put $8,000 in an FHSA and use all ${money(t.rrspRoom)} of RRSP room (by Mar 1, 2027). Only with spare cash; the FHSA comes first.`,
      tone: "info",
    },
    {
      id: "tax-credits",
      title: "Solidarity and GST credits end mid-2027",
      value: `${money(t.paymentsLeft)} left`,
      body: "They are set from the previous year's income. Your 2026 income is above where both stop, so don't count on them after June 2027.",
      tone: "info",
    },
  );
  return list.map((i) => ({ ...i, topic: "tax" }));
}

/* ---------- career ---------- */

/** How Air Canada compares with FlexSpring, your previous job. */
export function careerInsights(): KeyInsight[] {
  const f = FLEXSPRING;
  const a = AIRCANADA;
  const list: Omit<KeyInsight, "topic">[] = [
    {
      id: "job-total",
      title: "More pay, all in",
      value: `+${money(yearlyTotal(a) - yearlyTotal(f))} a year`,
      body: `${percent((yearlyTotal(a) - yearlyTotal(f)) / yearlyTotal(f))} more than FlexSpring once salary, incentive, pension match and benefits are counted.`,
      tone: "good",
    },
    {
      id: "job-net",
      title: "More take-home every month",
      value: `+${money(a.netMonthly - f.netMonthly)}`,
      body: `${money(a.netMonthly)} vs ${money(f.netMonthly)} at FlexSpring (two cheques), even after 6% to your pension and your insurance premiums.`,
      tone: "good",
    },
    {
      id: "job-usable",
      title: "Money you can actually spend",
      value: `+${money(a.usableYearly - f.usableYearly)} a year`,
      body: "Most of the gain is pension, health cover and tax, which you can't spend now. This counts take-home, the first prorated incentive and the spending account after tax.",
      tone: "info",
    },
    {
      id: "job-pension",
      title: "A pension you didn't have",
      value: `${money(PAYDATA.monthlyBase * PAYDATA.pensionRate * 2)} a month`,
      body: "Your 6% plus Air Canada's 6% goes into your pension every month. FlexSpring had no pension or group insurance.",
      tone: "good",
    },
  ];
  return list.map((i) => ({ ...i, topic: "career" }));
}

/* ---------- retirement and perks ---------- */

/** Retirement income, the pension fund check and Aeroplan. */
export function futureInsights(monthlyAt65: number, replacement: number, inflation: number): KeyInsight[] {
  const list: Omit<KeyInsight, "topic">[] = [
    {
      id: "fut-income",
      title: "Income at 65, in today's dollars",
      value: `${money(monthlyAt65)} a month`,
      body: `${percent(replacement)} of your take-home today, from the Air Canada pension, QPP, OAS and investing on your own. It assumes ${inflation}% inflation, Canada's rate for September 2026.`,
      tone: "good",
    },
    {
      id: "fut-fund",
      title: "Check where your pension is invested",
      value: "10 minutes",
      body: "Payslips show the money going in, not which fund holds it. In your Manulife account, make sure it's a target-date fund around 2060, not cash or money market.",
      tone: "watch",
    },
    {
      id: "fut-aeroplan",
      title: "Aeroplan points expire again",
      value: "from Nov 30",
      body: "Points now expire after 18 months with no earning or redeeming. Your yearly 15,000 counts as activity; link Starbucks or Uber to earn between grants.",
      tone: "info",
    },
  ];
  return list.map((i) => ({ ...i, topic: "future" }));
}
