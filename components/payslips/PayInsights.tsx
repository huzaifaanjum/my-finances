"use client";

import { useMemo, type ReactNode } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { SectionHeading } from "@/components/ui/text";
import { deltaMoney, money, percent } from "@/lib/format";
import {
  employerBenefits,
  employerPension,
  friendly,
  MONTHS_LONG,
  netDrivers,
  pensionLine,
  periodLabel,
  quebecTaxableBenefits,
  retroDeductions,
  usualNet,
} from "@/lib/payslips/analysis";
import { forecast, marginal, type ForecastSettings } from "@/lib/payslips/forecast";
import type { Payslip } from "@/lib/payslips/types";
import { SLIDERS } from "@/lib/planner/config";

interface Insight {
  title: string;
  value: string;
  body: string;
  tone?: "good" | "watch";
  action?: ReactNode;
}

/** Last calendar day of a month, a stand-in for the last banking day. */
const payDay = (year: number, month: number) => `${MONTHS_LONG[month].slice(0, 3)} ${new Date(year, month + 1, 0).getDate()}`;

/** What your payslips say, in plain terms. */
export default function PayInsights({ used, settings }: { used: Payslip[]; settings: ForecastSettings }) {
  const { state, setNumber } = usePlanner();
  const latest = used[used.length - 1].data;
  const prev = used[used.length - 2]?.data;
  const fc = useMemo(() => forecast(latest, settings, 50), [latest, settings]);
  const year = Number(latest.periodEnd.slice(0, 4)) || new Date().getFullYear();
  const m = useMemo(() => marginal(latest, year + 1), [latest, year]);
  const usual = usualNet(latest);
  const out: Insight[] = [];

  // the next deposit
  const next = fc.months[0];
  if (next && !next.retired) {
    out.push({
      title: "Your next deposit",
      value: `≈ ${money(next.net)}`,
      body: `Expected around ${payDay(next.year, next.month)} if nothing on the payslip changes${next.bonus ? `, including ${money(next.bonus)} of bonus before tax` : ""}. If it is more than a few dollars off, check the new payslip for a new line or a changed amount.`,
    });
  }

  // planner alignment
  const planNet = state.numbers.net;
  const rounded = Math.round(usual / SLIDERS.net.step) * SLIDERS.net.step;
  const gap = usual - planNet;
  out.push({
    title: "Your plan vs your payslip",
    value: Math.abs(gap) < 10 ? "In line" : `${deltaMoney(gap)} a month`,
    body:
      Math.abs(gap) < 10
        ? `Your plan uses ${money(planNet)} of take-home pay, which matches the usual ${money(usual, 2)} on your payslip.`
        : `Your plan assumes ${money(planNet)} of take-home, but your payslip's usual deposit is ${money(usual, 2)}. Over a year that is ${money(Math.abs(gap) * 12)} ${gap > 0 ? "more" : "less"} than planned.`,
    tone: Math.abs(gap) < 10 ? "good" : "watch",
    action:
      Math.abs(gap) >= 10 && rounded >= SLIDERS.net.min && rounded <= SLIDERS.net.max ? (
        <button type="button" className="ps-btn sm" onClick={() => setNumber("net", rounded)}>
          Use {money(rounded)} in my plan
        </button>
      ) : undefined,
  });

  // what moved between the last two payslips
  if (prev) {
    const diff = latest.current.net - prev.current.net;
    const top = netDrivers(prev, latest).slice(0, 3);
    out.push({
      title: `${periodLabel(latest)} vs ${periodLabel(prev)}`,
      value: `${deltaMoney(diff)}`,
      body: top.length
        ? `Mostly ${top.map((c) => `${c.label.toLowerCase()} (${deltaMoney(c.diff)})`).join(", ")}.${top.some((c) => /retro/i.test(c.label)) ? " Retro catch-ups are one-time, so the higher amount is the normal one." : ""}`
        : "Nothing changed between the two payslips.",
      tone: diff >= 0 ? "good" : "watch",
    });
  }

  // marginal rate
  out.push({
    title: "Your marginal tax rate",
    value: percent(m.rate),
    body: `On a full year at this salary, each extra $1,000 of pay (a bonus or raise) leaves you about ${money(m.keep)} after tax and plans. The flip side: every $1,000 you put in an RRSP or FHSA cuts your tax by about ${money(m.rrsp)}.`,
  });

  // late-year bump from QPP/EI maximums
  const nextYear = fc.months.filter((x) => x.year === year + 1 && !x.retired);
  if (nextYear.length === 12) {
    const eiStop = nextYear.find((x) => x.ei === 0);
    const qppStop = nextYear.find((x) => x.qpp === 0);
    const normal = nextYear[3].net;
    const dec = nextYear[11].net;
    if (eiStop || qppStop) {
      out.push({
        title: `Bigger deposits late in ${year + 1}`,
        value: `+${money(dec - normal)} a month`,
        body: `You pay the year's maximum ${[eiStop && `EI by ${MONTHS_LONG[eiStop.month]}`, qppStop && `QPP by ${MONTHS_LONG[qppStop.month]}`].filter(Boolean).join(" and ")}, so those deductions stop and the deposit rises until they restart in January. Decide now where that money goes.`,
        tone: "good",
      });
    }
  }

  // employer-paid
  const match = employerPension(latest);
  const benefits = employerBenefits(latest);
  if (match + benefits > 0) {
    out.push({
      title: "Air Canada pays more than your gross",
      value: `+${money(match + benefits)} a month`,
      body: `${money(match, 2)} pension match and ${money(benefits, 2)} of health and dental premiums, about ${money((match + benefits) * 12)} a year on top of your ${money(latest.payRate * 12)} salary.`,
      tone: "good",
    });
  }

  // Quebec-taxable benefits
  const qcBenefits = quebecTaxableBenefits(latest);
  if (qcBenefits > 0) {
    out.push({
      title: "Quebec taxes your benefits",
      value: `≈ ${money(qcBenefits * m.qcRate)} a month`,
      body: `The ${money(qcBenefits, 2)} of health and dental Air Canada pays each month counts as income for Quebec tax (that is why the Quebec taxable gross is higher than the federal one). At your Quebec rate it costs about ${money(qcBenefits * m.qcRate * 12)} a year. Using the coverage is how you get that back.`,
      tone: "watch",
    });
  }

  // pension
  const retired = fc.months.findIndex((x) => x.retired);
  const atRetire = fc.months[(retired > 0 ? retired : fc.months.length) - 1].pot;
  out.push({
    title: "Your DC pension",
    value: `${money(atRetire)} at 65`,
    body: `${money(pensionLine(latest) + match, 2)} goes in every month (you and Air Canada, 6% each). So far this year: ${money(pensionLine(latest, "ytd") + employerPension(latest, "ytd"))}. At ${Math.round(settings.growth * 100)}% a year that grows to about ${money(atRetire)} before fees and inflation.`,
    tone: "good",
  });

  // year to date
  out.push({
    title: "Year to date",
    value: `${money(latest.ytd.net)} kept`,
    body: `Of ${money(latest.ytd.gross)} gross so far this year, ${money(latest.ytd.taxes)} (${percent(latest.ytd.taxes / (latest.ytd.gross || 1))}) went to income tax and government plans and ${money(latest.ytd.deductions)} to your pension and insurance. These YTD totals should match your T4 and RL-1 in February.`,
  });

  // one-time items
  const withRetro = used.filter((p) => retroDeductions(p.data) > 0);
  if (withRetro.length) {
    out.push({
      title: "One-time catch-ups",
      value: money(withRetro.reduce((t, p) => t + retroDeductions(p.data), 0), 2),
      body: `${withRetro.map((p) => periodLabel(p.data)).join(", ")} took retro deductions for insurance that started before it was deducted (${withRetro
        .flatMap((p) => p.data.afterTax.filter((l) => /retro/i.test(l.label) && l.current))
        .map((l) => friendly(l.label).replace(/^Retro /i, "").toLowerCase())
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ")}). They don't repeat.`,
    });
  }

  return (
    <section className="ps-sec">
      <SectionHeading title="Key insights">What your payslips say about your money, worked out from the numbers on them.</SectionHeading>
      <GlossaryScope>
        <div className="off-ins">
          {out.map((i) => (
            <div key={i.title} className={`off-in ${i.tone ?? ""}`}>
              <span>{i.title}</span>
              <b>{i.value}</b>
              <p>
                <G>{i.body}</G>
              </p>
              {i.action && <div className="ps-act">{i.action}</div>}
            </div>
          ))}
        </div>
      </GlossaryScope>
    </section>
  );
}
