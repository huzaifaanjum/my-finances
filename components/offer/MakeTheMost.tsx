"use client";

import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { SectionHeading } from "@/components/ui/text";
import { ProgressBar } from "@/components/ui/bars";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { money } from "@/lib/format";
import { STUB_GROUPS, groupTotal } from "@/lib/offer";

interface Step {
  /** saved with the Knowledge progress, so keep it stable and prefixed */
  id: string;
  title: string;
  body: string;
  /** a deadline or timing, shown as a tag */
  when?: string;
}

interface Area {
  title: string;
  why: string;
  steps: Step[];
}

const insurance = groupTotal(STUB_GROUPS.find((g) => g.id === "insurance")!);

const AREAS: Area[] = [
  {
    title: "Health and dental",
    why: `Air Canada pays about $250 a month toward these and you pay ${money(46.82, 2)} for dental. Unused coverage is money left on the table.`,
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
        title: "Use paramedical coverage before it resets",
        body: "Physio, massage, chiropractor, psychologist and similar care usually have a yearly dollar limit per type. Look up yours and use it if you need it.",
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
        when: "Now",
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
    title: "Insurance",
    why: `You pay ${money(insurance, 2)} a month for life, disability and AD&D cover. Make sure it would actually pay out to the right people.`,
    steps: [
      {
        id: "offer-beneficiaries",
        title: "Name beneficiaries",
        body: "Set a beneficiary for life insurance, AD&D and your DC pension on the Manulife site. Without one, money can get stuck in your estate.",
        when: "Now",
      },
      {
        id: "offer-ltd-tax-free",
        title: "Know that your disability cover is tax-free",
        body: "You pay the long-term disability premiums yourself from after-tax pay, so if you ever claim, the benefit is generally not taxed. That makes it worth keeping.",
      },
      {
        id: "offer-optional-life",
        title: "Skip optional life insurance unless someone depends on you",
        body: "Optional employee, spouse and child life cover costs extra. Only add it if a partner or family relies on your income.",
      },
    ],
  },
  {
    title: "Pension, RRSP, TFSA and shares",
    why: "The match is the best return you will ever get: 100% on day one. The rest is about putting your savings somewhere cheap and automatic.",
    steps: [
      {
        id: "offer-keep-6",
        title: "Keep contributing 6%",
        body: "That gets the full $5,700 a year match. Going down to 3% would cost you $2,850 a year of free money.",
      },
      {
        id: "offer-dc-funds",
        title: "Choose your pension investments",
        body: "Log in to Manulife and check which fund your DC pension sits in. With 35+ years to retirement, a low-fee target-date or growth fund usually fits better than a cautious default.",
        when: "Now",
      },
      {
        id: "offer-group-rrsp-tfsa",
        title: "Look at the Group RRSP and TFSA",
        body: "Payroll deductions make saving automatic, and group plans often have lower fees than a bank. Group RRSP deductions can also lower the tax taken off each paycheque.",
      },
      {
        id: "offer-esop",
        title: "Join the ESOP, but keep it small",
        body: "Air Canada matches part of what you put into its shares the following year, which is free money. Your job already depends on Air Canada, so do not let its shares become a big part of your savings.",
      },
    ],
  },
  {
    title: "Aeroplan and travel",
    why: "Two perks most people underuse: free points every year and cheap standby flights from March.",
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
        body: "Travel privileges start after 28 weeks, around Mar 1, 2027, for you and eligible people. You are responsible for anyone using your privileges following the rules, so learn them first.",
        when: "Mar 2027",
      },
      {
        id: "offer-plan-trip",
        title: "Plan a trip around your vacation days",
        body: "Pair standby travel with your three weeks of vacation and catch-up days. Flexible dates and off-peak flights give the best standby odds.",
      },
    ],
  },
  {
    title: "Pay, time off and extras",
    why: "Smaller things that add up over a year.",
    steps: [
      {
        id: "offer-time-off",
        title: "Check your 2026 vacation and catch-up days",
        body: "Both are prorated for 2026. Look up how many you have left and whether they carry over, so none expire unused.",
        when: "Before Dec 31",
      },
      {
        id: "offer-aip-goals",
        title: "Ask how your incentive is scored",
        body: "The incentive ranges from 8% to 16% of salary partly on your own objectives. Ask your manager what they are, so you can aim for more than the target.",
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

const ALL = AREAS.flatMap((a) => a.steps);

/** A checklist of what to do with each part of the offer. Ticks are saved to your account. */
export default function MakeTheMost() {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const done = ALL.filter((s) => read[s.id]).length;

  return (
    <div className="off-sec">
      <SectionHeading title="Make the most of your offer">
        What to do with your benefits, insurance, pension and perks. Tick things off as you go; your progress is saved.
      </SectionHeading>
      <div className="off-prog">
        <span>
          {loading ? "Loading…" : `${done} of ${ALL.length} done`}
        </span>
        <ProgressBar value={done / ALL.length} color="var(--std)" />
      </div>
      {error && <p className="note">{error}</p>}

      <GlossaryScope>
        <div className="off-areas">
          {AREAS.map((a) => {
            const areaDone = a.steps.filter((s) => read[s.id]).length;
            return (
              <section key={a.title} className="card off-area">
                <div className="off-area-h">
                  <h3>{a.title}</h3>
                  <span>
                    {areaDone}/{a.steps.length}
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
            );
          })}
        </div>
      </GlossaryScope>
    </div>
  );
}
