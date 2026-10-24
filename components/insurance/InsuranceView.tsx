"use client";

import { payMarginal } from "@/lib/pay";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import SeeAlso from "@/components/ui/SeeAlso";
import { Legend, Note, SectionHeading } from "@/components/ui/text";
import { benefit, BENEFITS, COSTS, LSA_CATEGORIES, LSA_IDEAS, LSA_MONTHLY, LSA_YEARLY, PREMIUM_TAX, STATEMENT_DATE, type Benefit } from "@/lib/benefits";
import { money, percent } from "@/lib/format";

const GROUPS: { id: Benefit["group"]; title: string; why: string }[] = [
  { id: "income", title: "Income protection", why: "Replaces pay if you can't work." },
  { id: "health", title: "Health, drugs and dental", why: "Everyday care and emergencies, including on trips." },
  { id: "life", title: "Life and accident", why: "Paid to the people you name." },
  { id: "accounts", title: "Spending accounts", why: "Money to claim against receipts." },
];

const YOU = "var(--scotia)";
const EMPLOYER = "var(--std)";
const TAX = "#71717a";

const r2 = (v: number) => Math.round(v * 100) / 100;

/** "about all of" reads better than "101% of" when cover matches take-home. */
const shareOf = (v: number) => (v >= 0.95 && v <= 1.05 ? "about all" : `about ${percent(v)}`);

function pays(b: Benefit): string {
  if (!b.pays) return "";
  return b.pays.per === "once" ? money(b.pays.amount) : `${money(b.pays.amount)} a ${b.pays.per}`;
}

/** Everything your group insurance covers, what it costs, and what to do with it. */
export default function InsuranceView() {
  const plan = usePlan();
  const ltd = benefit("ltd");
  const std = benefit("std");
  const life = benefit("life");
  const add = benefit("add");
  const m = payMarginal(new Date().getFullYear());
  const ltdShare = plan.net ? ltd.pays!.amount / plan.net : 0;
  const paidBars = BENEFITS.filter((b) => b.price > 0);
  const maxPrice = Math.max(...paidBars.map((b) => b.price * (1 + PREMIUM_TAX)));

  const scenarios = [
    {
      when: "Off sick for a few weeks",
      what: `${pays(std)}`,
      body: "Short-term disability, after the waiting period in your booklet. About the same as your usual take-home, and generally tax-free.",
    },
    {
      when: "Can't work for months or longer",
      what: `${pays(ltd)}`,
      body: `Long-term disability takes over: ${shareOf(ltdShare)} of your current take-home, tax-free. It may be reduced by any QPP disability pension.`,
    },
    {
      when: "Medical emergency on a trip",
      what: "Covered",
      body: "Your health and drug plans include leisure travel, so emergency care abroad is covered. Check the trip-length limit before long trips.",
    },
    {
      when: "Physio, massage, eyes or dentist",
      what: "Premium plans",
      body: "Paramedical, vision, drugs and dental are all at the top plan level. Each has yearly limits that reset, so use them.",
    },
    {
      when: "If you die",
      what: money(life.pays!.amount),
      body: `Basic life goes to your beneficiary, plus ${money(add.pays!.amount)} more if it was an accident. Name a beneficiary on the Manulife site.`,
    },
  ];

  return (
    <div className="ins">
      <KpiGrid className="ins-kpis">
        <Kpi
          label="You pay"
          value={money(COSTS.youTotal, 2)}
          note={`a month, ${money(COSTS.youTotal * 12)} a year, incl. ${money(COSTS.tax, 2)} Quebec premium tax`}
          tip="Your share of the premiums plus Quebec's 9% insurance premium tax. It matches the after-tax insurance deductions on your payslip."
        />
        <Kpi
          label="Air Canada pays"
          value={money(COSTS.employerTotal, 2)}
          note={`a month: flex dollars and the ${money(LSA_YEARLY)} spending account`}
          tone="pos"
          tip="Flex dollars for health, drugs and dental (with premium tax), plus the Lifestyle Spending Account."
        />
        <Kpi label="If you can't work" value={`${money(ltd.pays!.amount)}/mo`} note={`tax-free, ${shareOf(ltdShare)} of your take-home`} tone="hero" tip="Long-term disability: 60% of monthly earnings, tax-free because you pay the premiums." />
        <Kpi label="Life cover" value={money(life.pays!.amount)} note={`+ ${money(add.pays!.amount)} if accidental`} tip="Basic life insurance plus accidental death and dismemberment." />
        <Kpi label="Spending account" value={`${money(LSA_YEARLY)}/yr`} note="Lifestyle Spending Account, from Air Canada" tone="warn" tip="Employer dollars you can claim for fitness, education, wellness and more." />
      </KpiGrid>

      <section className="ins-sec">
        <SectionHeading title="If something happens">What your coverage pays in the situations that matter, in plain terms.</SectionHeading>
        <GlossaryScope>
          <div className="ins-scn">
            {scenarios.map((s) => (
              <div key={s.when}>
                <span>{s.when}</span>
                <b>{s.what}</b>
                <p>
                  <G>{s.body}</G>
                </p>
              </div>
            ))}
          </div>
        </GlossaryScope>
      </section>

      <section className="ins-sec">
        <SectionHeading title="Your coverage">{`Every benefit on your Manulife statement of ${STATEMENT_DATE}, with who pays for it.`}</SectionHeading>
        <div className="ins-cov">
          {[["income", "life"], ["health", "accounts"]].map((col) => (
            <div key={col[0]} className="stack">
              {GROUPS.filter((g) => col.includes(g.id)).map((g) => (
            <Card key={g.id} title={g.title} description={g.why}>
              {BENEFITS.filter((b) => b.group === g.id).map((b) => {
                const you = r2((b.price - b.flex) * (1 + PREMIUM_TAX));
                return (
                  <div key={b.id} className={`ins-b${b.covered ? "" : " off"}`}>
                    <div className="ins-bh">
                      <b>
                        <G>{b.name}</G>
                      </b>
                      <span className={`ins-chip${b.covered ? "" : " no"}`}>{b.covered ? "Covered" : "None"}</span>
                    </div>
                    <div className="ins-bm">
                      <span>{b.level}</span>
                      {b.pays && <strong>{pays(b)}</strong>}
                    </div>
                    <p>
                      <G>{b.note}</G>
                    </p>
                    {b.price > 0 && (
                      <div className="ins-bc">
                        <span>
                          You <b>{money(you, 2)}</b>
                        </span>
                        <span>
                          Air Canada <b>{money(r2(b.flex * (1 + PREMIUM_TAX)), 2)}</b>
                        </span>
                        <span>a month, tax incl.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </Card>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="irow">
        <Card title="Who pays for what" description="Monthly price of each benefit, split between you, Air Canada and Quebec's 9% premium tax.">
          <div className="ins-bars">
            {paidBars.map((b) => {
              const you = b.price - b.flex;
              const w = (v: number) => `${(v / maxPrice) * 100}%`;
              return (
                <div key={b.id} className="ins-bar">
                  <span>{b.name}</span>
                  <div title={`You ${money(you, 2)} · Air Canada ${money(b.flex, 2)} · tax ${money(b.price * PREMIUM_TAX, 2)}`}>
                    {b.flex > 0 && <i style={{ width: w(b.flex), background: EMPLOYER }} />}
                    {you > 0 && <i style={{ width: w(you), background: YOU }} />}
                    <i style={{ width: w(b.price * PREMIUM_TAX), background: TAX }} />
                  </div>
                  <em>{money(b.price * (1 + PREMIUM_TAX), 2)}</em>
                </div>
              );
            })}
          </div>
          <Legend
            items={[
              { label: "Air Canada", color: EMPLOYER },
              { label: "You", color: YOU },
              { label: "Premium tax", color: TAX },
            ]}
          />
          <div className="ins-tot">
            <div>
              <span>Total price</span>
              <b>{money(COSTS.price, 2)}</b>
            </div>
            <div>
              <span>Air Canada</span>
              <b className="ps-pos">{money(COSTS.flex, 2)}</b>
            </div>
            <div>
              <span>You, with tax</span>
              <b>{money(COSTS.youTotal, 2)}</b>
            </div>
          </div>
        </Card>

        <Card title="Lifestyle Spending Account" description={`${money(LSA_MONTHLY, 2)} a month from Air Canada, ${money(LSA_YEARLY)} a year. Claim with a receipt in the Manulife app.`}>
          <div className="ins-lsa">
            <b>{money(LSA_YEARLY)}</b>
            <span>a year to spend · about {money(LSA_YEARLY * (1 - m.rate))} after tax</span>
          </div>
          <ul className="ins-ideas">
            {LSA_IDEAS.map((i) => (
              <li key={i.what}>
                <b>{i.what}</b>
                <span>{i.why}</span>
              </li>
            ))}
          </ul>
          <details className="ins-cat">
            <summary>Everything that's eligible</summary>
            <div>
              {LSA_CATEGORIES.map((c) => (
                <div key={c.title}>
                  <h4>{c.title}</h4>
                  <ul>
                    {c.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
          <Note style={{ marginTop: 10 }}>Manulife's list is not exhaustive; ask them before buying anything not on it. Unused dollars usually expire at the end of the plan year.</Note>
        </Card>
      </div>


      <SeeAlso href="/payslips" label="Payslips">
        {`These premiums are the five insurance lines on every payslip (${money(COSTS.youTotal, 2)} a month), and the employer-paid health and dental shows as Quebec-taxable lines`}
      </SeeAlso>
      <SeeAlso href="/insights" label="Insights">
        Key insights on your coverage: disability vs take-home, the life cover cap, premium tax and the spending account
      </SeeAlso>
      <SeeAlso href="/benefits" label="Benefits">
        What to do: claim the spending account, name beneficiaries, review life cover and use your health plans, as a checklist
      </SeeAlso>
    </div>
  );
}
