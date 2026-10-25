"use client";

import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { money } from "@/lib/format";

export interface PlanNumbers {
  /** estimated 2026 refund as things stand */
  now: number;
  /** what the Quebec tuition carry-forward is worth on its own */
  qcCarryValue: number;
  qcCarryAmount: number;
  /** federal unused tuition and what it is worth */
  fedCarryAmount: number;
  fedCarryValue: number;
  /** what $8,000 in an FHSA adds */
  fhsaValue: number;
  /** FHSA $8,000 plus all RRSP room */
  best: number;
  rrspRoom: number;
  tfsaRoom: number;
  hasFhsa: boolean;
  ctcLimit: number;
  /** government payments still to come */
  paymentsLeft: number;
  /** refunds received from past returns */
  pastRefunds: number;
}

interface Step {
  id: string;
  when: string;
  title: string;
  body: string;
  worth?: string;
}

/** The best order to do things in, with what each step is worth, plus the facts behind it. */
export default function TaxPlan({ n }: { n: PlanNumbers }) {
  const { read, toggle } = useKnowledgeProgress();
  const afterMove = n.now - n.qcCarryValue;

  const steps: Step[] = [
    ...(n.qcCarryValue > 0.5
      ? [
          {
            id: "taxplan-qc-2025",
            when: "This week",
            title: "Claim the Quebec tuition credit on your 2025 return",
            body: "In My Account at Revenu Québec, change your 2025 return: line 398 from $973.57 to $2,503.79. It isn't extra tax or extra money overall; you just get it now instead of next spring.",
            worth: `about ${money(n.qcCarryValue)} by December`,
          },
        ]
      : []),
    ...(!n.hasFhsa
      ? [
          {
            id: "taxplan-open-fhsa",
            when: "Before Dec 31",
            title: "Open an FHSA, even with $0 in it",
            body: "The $8,000 of 2026 room only exists if the account is open by Dec 31. Unused, it carries to 2027, so you could put in $16,000 next year.",
            worth: "keeps $8,000 of room",
          },
        ]
      : []),
    {
      id: "taxplan-fund-fhsa",
      when: "Before Dec 31, if you can",
      title: "Put money in the FHSA",
      body: "Every $1,000 comes back as roughly $360 at tax time, and it grows tax-free toward a first home. If you can't this year, the room waits for 2027.",
      worth: `up to ${money(n.fhsaValue)} back for $8,000`,
    },
    {
      id: "taxplan-this-year",
      when: "Before Dec 31",
      title: "Do planned courses or donations this year",
      body: `Only if you were going to anyway. Course or exam fees: half comes back up to ${money(n.ctcLimit)} (Canada training credit), plus a tuition credit. Donations above $200 get about 48% back.`,
      worth: "about $400 to $450 per $1,000",
    },
    {
      id: "taxplan-slips",
      when: "End of February 2027",
      title: "Enter your T4 and RL-1 slips",
      body: "Two of each: FlexSpring and Air Canada. Type them into Overview → Your 2026 income so the estimate becomes exact.",
    },
    {
      id: "taxplan-rrsp",
      when: "By Mar 1, 2027",
      title: "RRSP, only after the FHSA",
      body: `You have ${money(n.rrspRoom)} of RRSP room. Contributions until Mar 1 count for 2026. Each $1,000 brings back about $300 to $360. Use spare cash only; don't borrow for it.`,
      worth: `up to ${money(n.best)} back with FHSA and all RRSP room`,
    },
    {
      id: "taxplan-file",
      when: "By Apr 30, 2027",
      title: "File both returns",
      body: `Federal and Quebec. The CRA uses your ${money(n.fedCarryAmount)} of federal tuition automatically (about ${money(n.fedCarryValue)}); nothing to do for it.`,
      worth: `about ${money(n.qcCarryValue > 0.5 ? afterMove : n.now)} back${n.qcCarryValue > 0.5 ? " (after claiming 2025)" : ""}`,
    },
    {
      id: "taxplan-refund",
      when: "Spring 2027",
      title: "Put the refund to work",
      body: "Move it into the FHSA (2027 room up to $16,000 if 2026's went unused) or the TFSA. Sending it straight to savings keeps it from disappearing into spending.",
    },
    {
      id: "taxplan-july",
      when: "July 2027",
      title: "Expect the solidarity and GST credits to stop",
      body: "They are based on the previous year's income. 2026's (about $67,000) is above where both end, so the $68 a month and $169.75 a quarter likely stop after June 2027. Don't budget on them past then.",
    },
  ];
  const done = steps.filter((s) => read[s.id]).length;

  const qa: [string, string][] = [
    ["What is a tax year?", "January 1 to December 31. You file by April 30 of the next year, and the slips (T4, RL-1) arrive by the end of February."],
    ["Do my two jobs count together?", "Yes. FlexSpring (Jan 1 to Aug 17) and Air Canada (from Aug 17) are both 2026 income. Each employer took tax as if it were your only job; the return adds them up."],
    ["Does claiming the $1,530 for 2025 add tax?", "No. It's one credit that can only be used once. Claim it for 2025 and you get it now; your 2026 refund is lower by the same amount. Same total, sooner."],
    ["What is the $7,077 federal carry-forward?", "Tuition from past years that hasn't reduced your federal tax yet. The CRA must use it the first year you owe tax (2026). Worth about 14% of it, less the Quebec abatement."],
    ["Why is the Quebec carry-forward so much bigger?", "Quebec lets you choose when to use it, and your 2025 return didn't use the old amount. Federally it's used automatically, so most of it is already gone."],
    ["Credits or deductions: which is better?", "Deductions (FHSA, RRSP) come off your income at your top rate, about 36%. Most credits are worth 14 to 32%. So for you, the FHSA beats any credit."],
    ["If I move money from my TFSA to my FHSA, do I lose TFSA room?", "No. Everything you withdraw, profit included, is added back to your TFSA room on January 1 of the next year. Just don't put it back into the TFSA in the same year."],
    ["Can I move a TFSA straight into an FHSA?", "Not directly: withdraw from the TFSA (tax-free), then contribute to the FHSA. Only an RRSP can transfer straight to an FHSA."],
    ["Should I open an FHSA with no money?", "Yes, before Dec 31. Room only starts when the account exists, it carries forward a year, and if you never buy a home it can move to your RRSP tax-free."],
    ["Do moving expenses apply?", "Probably not: your address didn't change between your 2024 and 2025 notices, so you didn't move for the Air Canada job."],
  ];

  return (
    <div className="tp">
      <section className="tp-sum">
        <div>
          <span>Your 2026 refund today</span>
          <b>{money(n.now)}</b>
          <small>{n.qcCarryValue > 0.5 ? `includes ${money(n.qcCarryValue)} you could get now instead` : "as things stand"}</small>
        </div>
        {n.qcCarryValue > 0.5 && (
          <div>
            <span>Claim 2025 now, then 2026</span>
            <b>
              {money(n.qcCarryValue)} + {money(afterMove)}
            </b>
            <small>same total, $1,530 of it about 5 months sooner</small>
          </div>
        )}
        <div className="best">
          <span>With the full plan</span>
          <b>up to {money(n.best)}</b>
          <small>adds $8,000 FHSA and your {money(n.rrspRoom)} RRSP room, if you have the cash</small>
        </div>
      </section>

      <section className="tx-sec">
        <h2 className="goal-sh">
          The plan, in order <span>{done ? `${done} of ${steps.length} done` : "tick each step when it's done"}</span>
        </h2>
        <ol className="tp-steps">
          {steps.map((s, k) => {
            const d = !!read[s.id];
            return (
              <li key={s.id} className={d ? "done" : undefined}>
                <label>
                  <input type="checkbox" checked={d} onChange={(e) => toggle(s.id, e.target.checked)} />
                  <span className="tp-n">{k + 1}</span>
                  <span className="tp-b">
                    <em>{s.when}</em>
                    <b>{s.title}</b>
                    <small>{s.body}</small>
                  </span>
                  {s.worth && <strong>{s.worth}</strong>}
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="tx-sec">
        <h2 className="goal-sh">
          Key facts <span>from your notices and payslips</span>
        </h2>
        <dl className="tp-facts">
          <div>
            <dt>Quebec tuition carried forward</dt>
            <dd>{money(n.qcCarryAmount, 2)}</dd>
            <small>worth about {money(n.qcCarryAmount * 0.08)} off Quebec tax</small>
          </div>
          <div>
            <dt>Federal tuition carried forward</dt>
            <dd>{money(n.fedCarryAmount)}</dd>
            <small>worth about {money(n.fedCarryValue)}, used automatically in 2026</small>
          </div>
          <div>
            <dt>RRSP room for 2026</dt>
            <dd>{money(n.rrspRoom)}</dd>
            <small>contribute by Mar 1, 2027</small>
          </div>
          <div>
            <dt>FHSA</dt>
            <dd>{n.hasFhsa ? "Open" : "Not open yet"}</dd>
            <small>{n.hasFhsa ? "$8,000 of room for 2026" : "open by Dec 31 for $8,000 of 2026 room"}</small>
          </div>
          <div>
            <dt>TFSA room</dt>
            <dd>{money(n.tfsaRoom)}</dd>
            <small>as of Jan 1, 2026; withdrawals come back next Jan 1</small>
          </div>
          <div>
            <dt>Canada training credit</dt>
            <dd>{money(n.ctcLimit)}</dd>
            <small>half of 2026 course fees, up to this</small>
          </div>
          <div>
            <dt>Government payments to come</dt>
            <dd>{money(n.paymentsLeft, 2)}</dd>
            <small>solidarity and GST credits, to June 2027</small>
          </div>
          <div>
            <dt>Refunds so far</dt>
            <dd>{money(n.pastRefunds, 2)}</dd>
            <small>federal and Quebec, 2023 to 2025</small>
          </div>
        </dl>
      </section>

      <section className="tx-sec">
        <h2 className="goal-sh">
          What we cleared up <span>short answers to the questions so far</span>
        </h2>
        <div className="tp-qa">
          {qa.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
