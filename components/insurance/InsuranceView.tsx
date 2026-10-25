"use client";

import { useEffect, useState } from "react";
import { payMarginal } from "@/lib/pay";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import SeeAlso from "@/components/ui/SeeAlso";
import ClaimLimits from "./ClaimLimits";
import { Legend, Note } from "@/components/ui/text";
import { benefit, BENEFITS, COSTS, LSA_CATEGORIES, LSA_IDEAS, LSA_MONTHLY, LSA_YEARLY, PREMIUM_TAX, STATEMENT_DATE, type Benefit } from "@/lib/benefits";
import { money, percent } from "@/lib/format";
import { COLOR } from "@/lib/colors";

const GROUPS: { id: Benefit["group"]; title: string; why: string }[] = [
  { id: "income", title: "Income protection", why: "Replaces pay if you can't work." },
  { id: "health", title: "Health, drugs and dental", why: "Everyday care and emergencies, including on trips." },
  { id: "life", title: "Life and accident", why: "Paid to the people you name." },
  { id: "accounts", title: "Spending accounts", why: "Money to claim against receipts." },
];

const YOU = COLOR.subs;
const EMPLOYER = COLOR.employer;
const TAX = "#71717a";

const r2 = (v: number) => Math.round(v * 100) / 100;

/** "about all of" reads better than "101% of" when cover matches take-home. */
const shareOf = (v: number) => (v >= 0.95 && v <= 1.05 ? "about all" : `about ${percent(v)}`);

function pays(b: Benefit): string {
  if (!b.pays) return "";
  return b.pays.per === "once" ? money(b.pays.amount) : `${money(b.pays.amount)} a ${b.pays.per}`;
}

type Tab = "cover" | "limits" | "costs" | "lsa";
const TABS: { id: Tab; label: string; note: string }[] = [
  { id: "cover", label: "Coverage", note: "what you're covered for" },
  { id: "limits", label: "Claim limits", note: "the most each one pays" },
  { id: "costs", label: "Costs", note: "who pays for what" },
  { id: "lsa", label: "Spending account", note: "$500 a year to use" },
];
const TAB_KEY = "ins_tab";

const GROUP_COLORS: Record<Benefit["group"], string> = {
  income: COLOR.keep,
  health: COLOR.insurance,
  life: COLOR.employer,
  accounts: COLOR.extra,
};

/** Your group insurance: a summary on top, then coverage, claim limits, costs and the spending account in tabs. */
export default function InsuranceView() {
  const plan = usePlan();
  const [tab, setTabState] = useState<Tab>("cover");
  useEffect(() => {
    try {
      const t = localStorage.getItem(TAB_KEY);
      if (TABS.some((x) => x.id === t)) setTabState(t as Tab);
    } catch {}
  }, []);
  const setTab = (t: Tab) => {
    setTabState(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {}
  };
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

  const covered = BENEFITS.filter((b) => b.covered);
  const notTaken = BENEFITS.filter((b) => !b.covered);
  const split = [
    { label: "Air Canada", value: COSTS.flex, color: EMPLOYER },
    { label: "You", value: COSTS.youTotal - COSTS.tax, color: YOU },
    { label: "Quebec premium tax", value: COSTS.tax, color: TAX },
  ];
  const splitTotal = split.reduce((t, x) => t + x.value, 0) || 1;

  return (
    <div className="ins ins2">
      <section className="ph2 ins-hero">
        <div className="ph2-main">
          <div className="ph2-lead">
            <span>Manulife group benefits from Air Canada · statement of {STATEMENT_DATE}</span>
            <b>{covered.length} benefits</b>
            <p>
              cover you for disability, life, health, drugs and dental. You pay <strong>{money(COSTS.youTotal, 2)}</strong> a month for them; Air Canada adds{" "}
              <strong>{money(COSTS.employerTotal, 2)}</strong>, spending account included.
            </p>
          </div>
          <dl className="ph2-facts">
            <div>
              <dt>If you can&rsquo;t work</dt>
              <dd>{money(ltd.pays!.amount)}/mo</dd>
              <small>tax-free, {shareOf(ltdShare)} of your take-home</small>
            </div>
            <div>
              <dt>Life cover</dt>
              <dd>{money(life.pays!.amount)}</dd>
              <small>+ {money(add.pays!.amount)} if it&rsquo;s an accident</small>
            </div>
            <div>
              <dt>Spending account</dt>
              <dd>{money(LSA_YEARLY)}/yr</dd>
              <small>yours to claim; unused dollars expire</small>
            </div>
          </dl>
        </div>
        <div className="ph2-split">
          <div className="ph2-sh">
            <h2>Who pays the {money(splitTotal, 2)} a month</h2>
          </div>
          <div className="stackbar" role="img" aria-label={split.map((x) => `${x.label} ${money(x.value, 2)}`).join(", ")}>
            {split.map((x) => (
              <i key={x.label} style={{ width: `${(x.value / splitTotal) * 100}%`, background: x.color }} />
            ))}
          </div>
          <div className="bf-keys">
            {split.map((x) => (
              <span key={x.label}>
                <i style={{ background: x.color }} />
                {x.label} <b>{money(x.value, 2)}</b>
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="ps-tabs" role="tablist" aria-label="Insurance sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            <small>{t.note}</small>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="ps-panel">
        {tab === "cover" && (
          <GlossaryScope>
            <section className="ins-sec">
              <h2 className="goal-sh">
                If something happens <span>what your coverage pays, in plain terms</span>
              </h2>
              <ul className="ins-what">
                {scenarios.map((x) => (
                  <li key={x.when}>
                    <span>{x.when}</span>
                    <b>{x.what}</b>
                    <p>
                      <G>{x.body}</G>
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ins-sec">
              <h2 className="goal-sh">
                Your coverage <span>tap a benefit for details and who pays for it</span>
              </h2>
              <div className="bf-list">
                {GROUPS.map((g) => {
                  const list = covered.filter((b) => b.group === g.id);
                  if (!list.length) return null;
                  return (
                    <section key={g.id} className="bf-grp" style={{ ["--c" as string]: GROUP_COLORS[g.id] }}>
                      <header className="bf-gh">
                        <i aria-hidden="true" />
                        <div>
                          <h2>{g.title}</h2>
                          <p>{g.why}</p>
                        </div>
                      </header>
                      {list.map((b) => {
                        const you = r2((b.price - b.flex) * (1 + PREMIUM_TAX));
                        const ac = r2(b.flex * (1 + PREMIUM_TAX));
                        return (
                          <details key={b.id} className="bf-item">
                            <summary>
                              <span className="bf-name">
                                <b>
                                  <G>{b.name}</G>
                                </b>
                                <small>{b.level}</small>
                              </span>
                              <span className="ins-pays">
                                {b.pays ? <b>{pays(b)}</b> : null}
                                <small>{b.price > 0 ? (you > 0 ? `you pay ${money(you, 2)}/mo` : "Air Canada pays") : "from Air Canada"}</small>
                              </span>
                            </summary>
                            <div className="bf-body">
                              <p>
                                <G>{b.note}</G>
                              </p>
                              {b.price > 0 && (
                                <p className="ins-who">
                                  You <b>{money(you, 2)}</b> · Air Canada <b>{money(ac, 2)}</b> a month, premium tax included.
                                </p>
                              )}
                            </div>
                          </details>
                        );
                      })}
                    </section>
                  );
                })}
              </div>
              {notTaken.some((b) => b.group !== "accounts") && (
                <p className="ins-none">
                  <b>Not taken:</b> {notTaken.filter((b) => b.group !== "accounts").map((b) => b.name).join(", ")}. Extra cover you can buy; only worth it if someone depends on your
                  income.
                </p>
              )}
              {notTaken.some((b) => b.group === "accounts") && (
                <p className="ins-none">
                  <b>Empty this year:</b> {notTaken.filter((b) => b.group === "accounts").map((b) => b.name).join(", ")}, since no flex dollars were put in. You can choose to at the next
                  enrolment.
                </p>
              )}
            </section>
          </GlossaryScope>
        )}

        {tab === "limits" && <ClaimLimits />}

        {tab === "costs" && (
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
            <Note style={{ marginTop: 10 }}>{`Your share is the ${money(COSTS.youTotal, 2)} of insurance deductions on every payslip, ${money(COSTS.youTotal * 12)} a year.`}</Note>
          </Card>
        )}

        {tab === "lsa" && (
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
              <summary>Everything that&apos;s eligible</summary>
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
            <Note style={{ marginTop: 10 }}>Manulife&apos;s list is not exhaustive; ask them before buying anything not on it. Unused dollars usually expire at the end of the plan year.</Note>
          </Card>
        )}
      </div>

      <div className="seealso-row">
        <SeeAlso href="/benefits" label="Benefits">
          What to do: claim the spending account, name beneficiaries and use your health plans, as a checklist
        </SeeAlso>
        <SeeAlso href="/payslips" label="Payslips">
          {`The five insurance lines on every payslip (${money(COSTS.youTotal, 2)} a month)`}
        </SeeAlso>
        <SeeAlso href="/insights" label="Insights">
          Disability vs take-home, the life cover cap, premium tax and the spending account
        </SeeAlso>
      </div>
    </div>
  );
}
