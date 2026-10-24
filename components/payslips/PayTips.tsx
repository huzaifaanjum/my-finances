"use client";

import { useMemo } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { ProgressBar } from "@/components/ui/bars";
import { SectionHeading } from "@/components/ui/text";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { money } from "@/lib/format";
import { employerBenefits, insurancePremiums, MONTHS_LONG, pensionLine, quebecTaxableBenefits } from "@/lib/payslips/analysis";
import { marginal } from "@/lib/payslips/forecast";
import type { PayslipData } from "@/lib/payslips/types";

interface Step {
  /** saved with the Knowledge progress, so keep it stable and prefixed */
  id: string;
  title: string;
  body: string;
  when?: string;
}

interface Area {
  title: string;
  why: string;
  steps: Step[];
}

/** What to do with each paycheque. Ticks are saved to your account, like the offer checklist. */
export default function PayTips({ latest }: { latest: PayslipData }) {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const year = Number(latest.periodEnd.slice(0, 4)) || new Date().getFullYear();
  const m = useMemo(() => marginal(latest, year + 1), [latest, year]);

  const areas: Area[] = [
    {
      title: "Pay less tax, legally",
      why: `Your marginal rate is about ${Math.round(m.rate * 100)}%, so every dollar you shelter from tax is worth a lot.`,
      steps: [
        {
          id: "pay-rrsp-fhsa",
          title: "Shelter money in an FHSA, then an RRSP",
          body: `Each $1,000 contributed cuts tax by about ${money(m.rrsp)}. The FHSA comes first if you may buy a home: $8,000 a year, deductible like an RRSP and tax-free when used for a first home.`,
          when: "Before Mar 1",
        },
        {
          id: "pay-source-deductions",
          title: "Get the refund every month, not once a year",
          body: "If you contribute to an RRSP or FHSA regularly, file form T1213 with the CRA and TP-1016-V with Revenu Québec. Once approved, Air Canada withholds less tax from each payslip instead of you waiting for a refund.",
        },
        {
          id: "pay-bonus-rrsp",
          title: "Route the March incentive into your RRSP",
          body: `Bonuses are taxed at your marginal rate, so you keep only about ${money(m.keep)} of each $1,000. Ask HR whether the incentive can go straight into the Group RRSP; money sent there is not taxed at source.`,
          when: "Before March",
        },
        {
          id: "pay-claim-amounts",
          title: "Check your TD1 and TP-1015.3 claim amounts",
          body: `Your payslip's "Net Claim Amt." shows only the basic personal amounts (federal $16,452 and Quebec $18,952 in 2026). If you have tuition carry-forwards, a dependant or other credits, updating the forms raises every deposit.`,
        },
      ],
    },
    {
      title: "Put the late-year bump to work",
      why: "Once EI and QPP reach their yearly maximums the deposit jumps for the last months of the year. Spent by default; saved if you plan it.",
      steps: [
        {
          id: "pay-bump-transfer",
          title: "Schedule an automatic transfer for the higher months",
          body: "Set a recurring transfer to your TFSA or FHSA from September to December for the extra amount, so the raise in take-home never reaches your spending account.",
          when: "Before Sep",
        },
        {
          id: "pay-raise-split",
          title: "Save half of every raise",
          body: `When salary goes up each year, raise your automatic savings by half of the extra take-home. On a 3% raise that is about ${money((latest.payRate * 0.03 * m.keep) / 1000 / 2)} more a month saved, and you still feel the raise.`,
          when: "Each January",
        },
      ],
    },
    {
      title: "Use what you pay for",
      why: `You pay ${money(insurancePremiums(latest), 2)} a month for insurance, and Air Canada pays ${money(employerBenefits(latest), 2)} for health and dental that Quebec taxes you on.`,
      steps: [
        {
          id: "pay-use-benefits",
          title: "Claim dental, vision and paramedical every year",
          body: `You already pay Quebec tax on ${money(quebecTaxableBenefits(latest) * 12)} a year of health and dental coverage. Cleanings, eye exams, physio and massage limits reset yearly; unused, they are lost.`,
          when: "Before limits reset",
        },
        {
          id: "pay-pension-fund",
          title: "Check where your DC pension is invested",
          body: `${money(pensionLine(latest) * 2, 2)} goes in every month. With 35+ years to go, a low-fee growth or target-date fund instead of a cautious default can be worth hundreds of thousands by 65.`,
          when: "Now",
        },
      ],
    },
    {
      title: "Keep an eye on every payslip",
      why: "Payroll mistakes happen, and they are easiest to fix the month they appear.",
      steps: [
        {
          id: "pay-upload-monthly",
          title: "Upload each payslip the day it arrives",
          body: `The next one should land around the last banking day of ${MONTHS_LONG[(Number(latest.periodEnd.slice(5, 7)) || 1) % 12]}. Uploading it keeps this page's forecast and insights accurate and flags anything that moved.`,
          when: "Monthly",
        },
        {
          id: "pay-check-lines",
          title: "Look for new or changed lines",
          body: "Compare each payslip with the one before (the side-by-side table above does it for you). New deductions, a changed pay rate or a retro line all deserve a question to HR if you don't recognise them.",
        },
        {
          id: "pay-year-end",
          title: "Match December's year-to-date totals to your T4 and RL-1",
          body: "In February, check that gross, tax, QPP, EI and QPIP on the slips match the year-to-date column of your last payslip of the year.",
          when: "February",
        },
      ],
    },
  ];
  const all = areas.flatMap((a) => a.steps);
  const done = all.filter((s) => read[s.id]).length;

  return (
    <section className="ps-sec">
      <SectionHeading title="Make the most of each paycheque">
        Things to do with what your payslips show. Tick them off as you go; your progress is saved.
      </SectionHeading>
      <div className="off-prog">
        <span>{loading ? "Loading…" : `${done} of ${all.length} done`}</span>
        <ProgressBar value={done / all.length} color="var(--std)" />
      </div>
      {error && <p className="note">{error}</p>}
      <GlossaryScope>
        <div className="off-areas">
          {areas.map((a) => (
            <section key={a.title} className="card off-area">
              <div className="off-area-h">
                <h3>{a.title}</h3>
                <span>
                  {a.steps.filter((s) => read[s.id]).length}/{a.steps.length}
                </span>
              </div>
              <p className="d">
                <G>{a.why}</G>
              </p>
              <ul>
                {a.steps.map((s) => (
                  <li key={s.id} className={read[s.id] ? "done" : undefined}>
                    <label>
                      <input type="checkbox" checked={!!read[s.id]} onChange={(e) => toggle(s.id, e.target.checked)} />
                      <span>
                        <b>
                          <G>{s.title}</G>
                        </b>
                        {s.when && <em>{s.when}</em>}
                        <small>
                          <G>{s.body}</G>
                        </small>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </GlossaryScope>
    </section>
  );
}
