"use client";

import { payMarginal } from "@/lib/pay";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlanner } from "@/components/providers/PlannerProvider";
import { ProgressBar } from "@/components/ui/bars";
import NumberField from "@/components/ui/NumberField";
import { Note, SectionHeading } from "@/components/ui/text";
import { money } from "@/lib/format";
import { project } from "@/lib/planner/projection";
import { rrspRoomEstimate } from "@/lib/recommendations";

/** Where each dollar of savings should go, in order, with your own numbers on every step. */
export default function MoneyLadder() {
  const { plan, setNumber } = usePlanner();
  const { tfsa, fhsa } = plan.state.numbers;
  const year = new Date().getFullYear();
  const safety = plan.exp.total * 3;
  const saved = plan.startBalance;
  const safetyDone = saved >= safety;
  // savings by Dec 31 (plan month 2), what could go into an FHSA this year
  const dec = Math.max(0, project(plan.state, 3, plan.left)[2].balance);
  const m = payMarginal(year);
  const fhsaNow = Math.min(dec, fhsa);
  const rrsp = rrspRoomEstimate(year);

  const steps = [
    {
      title: "Safety net",
      where: "High-interest savings",
      body: `Three months of costs, kept in cash. Don't invest money you might need soon.`,
      extra: (
        <>
          <div className="ml-num">
            <b>{money(Math.max(0, saved))}</b> <span>of {money(safety)}</span>
          </div>
          <ProgressBar value={Math.max(0, saved) / safety} color="var(--std)" />
          <small>{safetyDone ? "Reached" : `Full ${plan.eta(safety)}`}</small>
        </>
      ),
    },
    {
      title: "FHSA",
      where: "First home",
      body: "$8,000 a year, $40,000 lifetime. Deductible going in, tax-free for a first home.",
      extra: (
        <>
          <label className="ml-in">
            <span>Room</span>
            <NumberField min={0} step={500} value={fhsa} onChange={(v) => setNumber("fhsa", v)} aria-label="FHSA room" />
          </label>
          <small>
            {fhsaNow > 0
              ? `${money(fhsaNow)} in by Dec 31 ≈ ${money(fhsaNow * m.rate)} refund`
              : "Open it by Dec 31 so this year's room counts, even with $0"}
          </small>
        </>
      ),
    },
    {
      title: "TFSA",
      where: "Flexible goals",
      body: "$7,000 of new room a year. Growth and withdrawals are tax-free.",
      extra: (
        <>
          <label className="ml-in">
            <span>Room</span>
            <NumberField min={0} step={500} value={tfsa} onChange={(v) => setNumber("tfsa", v)} aria-label="TFSA room" />
          </label>
          <small>{tfsa ? `Your savings would fill it ${plan.eta(tfsa)}` : "Check your room on CRA My Account"}</small>
        </>
      ),
    },
    {
      title: "RRSP",
      where: "Retirement",
      body: "Best at a high tax rate; the refund can go straight back in. Your pension uses most of the room.",
      extra: (
        <>
          <div className="ml-num">
            <b>≈ {money(rrsp.room)}</b> <span>new room for {rrsp.forYear}</span>
          </div>
          <small>18% of earnings minus {money(rrsp.pa)} pension adjustment</small>
        </>
      ),
    },
    {
      title: "Index funds",
      where: "Inside the accounts",
      body: "One all-in-one index ETF holds thousands of companies for about 0.2% a year.",
      extra: (
        <>
          <div className="ml-num">
            <b>0.2%</b> <span>vs about 2% for a typical fund</span>
          </div>
          <small>$1,800 a year less in fees per $100,000</small>
        </>
      ),
    },
  ];
  const current = safetyDone ? 1 : 0;

  return (
    <section className="rec-sec">
      <SectionHeading title="Where to put your money">
        A common order for Canadians: each step fills before the next. Edit your FHSA and TFSA room to match your records.
      </SectionHeading>
      <GlossaryScope>
        <ol className="ml">
          {steps.map((s, k) => (
            <li key={s.title} className={k < current ? "done" : k === current ? "cur" : undefined}>
              <div className="ml-h">
                <span className="ml-n">{k + 1}</span>
                <div>
                  <b>
                    <G>{s.title}</G>
                  </b>
                  <em>{k === current ? "You are here" : s.where}</em>
                </div>
              </div>
              <p>
                <G>{s.body}</G>
              </p>
              <div className="ml-x">{s.extra}</div>
            </li>
          ))}
        </ol>
      </GlossaryScope>
      <Note>
        Returns are not guaranteed: a stock-heavy portfolio has averaged roughly 6 to 8% a year over long periods but can fall 30% or more in a bad year. RRSP
        room is an estimate; your Notice of Assessment has the exact figure.
      </Note>
    </section>
  );
}
