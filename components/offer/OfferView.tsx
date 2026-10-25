"use client";

import { useEffect, useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { COLOR } from "@/lib/colors";
import { money, percent } from "@/lib/format";
import { COMP, OFFER } from "@/lib/offer";
import JobCompare from "./JobCompare";

const DAY = 864e5;
const START = new Date(`${OFFER.start}T00:00:00`);
const YEAR_END = new Date(START.getFullYear() + 1, START.getMonth(), START.getDate());
const { salary } = OFFER;
const { aip, signing, match, health, lsa } = COMP;
const aipMax = salary * OFFER.aipMax;
const weekly = salary / 52;

type Scenario = "one" | "two" | "best";
const SCENARIOS: { id: Scenario; label: string; note: string }[] = [
  { id: "one", label: "Year one", note: "incentive at the 8% target, both signing payments" },
  { id: "two", label: "Year two on", note: "no signing bonus, incentive at target" },
  { id: "best", label: "Best case", note: "year one with the maximum 16% incentive" },
];

type Kind = "sure" | "results" | "once";
const KIND: Record<Kind, string> = { sure: "Guaranteed", results: "Depends on results", once: "First year only" };

interface Part {
  key: string;
  label: string;
  value: number;
  color: string;
  kind: Kind;
  note: string;
  faded?: boolean;
}

function parts(s: Scenario): { cash: Part[]; paid: Part[] } {
  const incentive = s === "best" ? aipMax : aip;
  const cash: Part[] = [
    { key: "base", label: "Base salary", value: salary, color: COLOR.keep, kind: "sure", note: `${money(salary / 12, 2)} a month` },
    { key: "aip", label: "Annual incentive", value: incentive, color: COLOR.extra, kind: "results", note: `${percent(incentive / salary)} of salary, paid each March` },
  ];
  if (s !== "two") cash.push({ key: "sign", label: "Signing bonus", value: signing, color: COLOR.extra, kind: "once", note: "two payments: Feb and Aug 2027", faded: true });
  const paid: Part[] = [
    { key: "match", label: "Pension match", value: match, color: COLOR.pension, kind: "sure", note: "6% of salary, while you put in 6%" },
    { key: "health", label: "Health and dental", value: health, color: COLOR.insurance, kind: "sure", note: "premiums Air Canada pays" },
    { key: "lsa", label: "Lifestyle Spending Account", value: lsa, color: COLOR.employer, kind: "sure", note: "yours to claim each year" },
  ];
  return { cash, paid };
}

interface Milestone {
  date: string;
  title: string;
  detail: string;
}

const MILESTONES: Milestone[] = [
  { date: "2026-08-17", title: "First day", detail: "Pension contributions and the match start with your first payslip." },
  { date: "2027-01-31", title: `${(OFFER.aeroplanPoints / 1000).toFixed(0)}k Aeroplan points`, detail: "Granted each January, starting 2027." },
  { date: "2027-02-17", title: "Probation ends · first signing payment", detail: `${money(OFFER.signing[0].amount)} gross, about $1,400 in your account. Severance terms start applying.` },
  { date: "2027-03-01", title: "Travel privileges", detail: `Standby flights open after ${OFFER.travelAfterWeeks} weeks.` },
  { date: "2027-03-31", title: "First incentive", detail: "Prorated for 2026 because you started in August: about $1,550 after tax." },
  { date: "2027-08-17", title: "One year · second signing payment", detail: `${money(OFFER.signing[1].amount)} gross. Severance is now 6 weeks of base pay.` },
];

const at = (iso: string) => new Date(`${iso}T00:00:00`);
const short = (d: Date) => d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });

/** The offer as a page: the role and your first year, what the package is worth, and the milestones that pay out. */
export default function OfferView() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  const [scenario, setScenario] = useState<Scenario>("one");

  const day = now === null ? null : Math.max(1, Math.floor((now - START.getTime()) / DAY) + 1);
  const yearDays = Math.round((YEAR_END.getTime() - START.getTime()) / DAY);
  const share = day === null ? 0 : Math.min(1, day / yearDays);
  const pos = (iso: string) => Math.min(1, Math.max(0, (at(iso).getTime() - START.getTime()) / (YEAR_END.getTime() - START.getTime())));

  const { cash, paid } = parts(scenario);
  const all = [...cash, ...paid];
  const total = all.reduce((t, p) => t + p.value, 0);
  const byKind = (k: Kind) => all.filter((p) => p.kind === k).reduce((t, p) => t + p.value, 0);
  const nextIdx = now === null ? -1 : MILESTONES.findIndex((m) => at(m.date).getTime() > now);

  const group = (title: string, list: Part[]) => (
    <div className="jo-grp">
      <h3>
        {title}
        <span>{money(list.reduce((t, p) => t + p.value, 0))}</span>
      </h3>
      <ul>
        {list.map((p) => (
          <li key={p.key}>
            <i style={{ background: p.color, opacity: p.faded ? 0.55 : 1 }} />
            <span>
              <G>{p.label}</G>
              <small>{p.note}</small>
            </span>
            <em className={`jo-kind ${p.kind}`}>{KIND[p.kind]}</em>
            <b>{money(p.value)}</b>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <GlossaryScope>
      <div className="jo">
        <section className="jo-hero">
          <div className="jo-id">
            <span className="jo-co">
              {OFFER.employer} · {OFFER.city}
            </span>
            <h2>{OFFER.role}</h2>
            <p>
              {OFFER.band} · started {short(START)} · offer of {OFFER.offerDate} · paid monthly on the last banking day
            </p>
          </div>
          <div className="jo-total">
            <span>Worth in year one</span>
            <b>{money(COMP.yearOne)}</b>
            <small>
              {money(COMP.yearOne - signing)} from year two · up to {money(COMP.yearOne - aip + aipMax)}
            </small>
          </div>

          <div className="jo-year">
            <div className="jo-year-h">
              <span>{day === null ? "Your first year" : day <= yearDays ? <>Day <b>{day}</b> of your first year</> : <>Year one done</>}</span>
              <span>{percent(share)}</span>
            </div>
            <div className="jo-track" role="img" aria-label={`First year: ${percent(share)} done`}>
              <i style={{ width: `${share * 100}%` }} />
              {MILESTONES.slice(1).map((m) => (
                <s key={m.date} style={{ left: `${pos(m.date) * 100}%` }} className={now !== null && at(m.date).getTime() <= now ? "done" : undefined} title={`${m.title} · ${short(at(m.date))}`} />
              ))}
            </div>
            <div className="jo-track-x">
              <span>{short(START)}</span>
              <span>Probation ends Feb 17</span>
              <span>{short(YEAR_END)}</span>
            </div>
          </div>
        </section>

        <div className="jo-lay">
          <section className="jo-card">
            <div className="jo-card-h">
              <div>
                <h2>What the package is worth</h2>
                <p>{SCENARIOS.find((s) => s.id === scenario)!.note}</p>
              </div>
              <div className="ps-seg sm" role="group" aria-label="Which year">
                {SCENARIOS.map((s) => (
                  <button key={s.id} type="button" aria-pressed={scenario === s.id} onClick={() => setScenario(s.id)}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="jo-sum">
              <b>{money(total)}</b>
              <span>
                {money(byKind("sure"))} guaranteed · {money(byKind("results"))} depends on results
                {byKind("once") > 0 && <> · {money(byKind("once"))} one-time</>}
              </span>
            </div>
            <div className="stackbar" role="img" aria-label={all.map((p) => `${p.label} ${money(p.value)}`).join(", ")}>
              {all.map((p) => (
                <i key={p.key} style={{ width: `${(p.value / total) * 100}%`, background: p.color, opacity: p.faded ? 0.55 : 1 }} title={`${p.label} ${money(p.value)}`} />
              ))}
            </div>
            <div className="jo-groups">
              {group("Cash pay", cash)}
              {group("Paid for you", paid)}
            </div>
            <p className="jo-note">
              Not counted: <G>profit sharing</G>, <G>ESOP</G> matching, <G>Aeroplan points</G> and <G>travel privileges</G>.
            </p>
          </section>

          <section className="jo-card">
            <div className="jo-card-h">
              <div>
                <h2>Your first year</h2>
                <p>What the offer promises, and when.</p>
              </div>
            </div>
            <ol className="jo-tl">
              {MILESTONES.map((m, k) => {
                const d = at(m.date);
                const done = now !== null && d.getTime() <= now;
                const days = now === null ? null : Math.ceil((d.getTime() - now) / DAY);
                return (
                  <li key={m.date} className={done ? "done" : k === nextIdx ? "next" : undefined}>
                    <i aria-hidden="true" />
                    <div>
                      <span className="jo-tl-d">
                        {short(d)}
                        {!done && days !== null && <em>{k === nextIdx ? `next · in ${days} days` : `in ${days} days`}</em>}
                        {done && <em>done</em>}
                      </span>
                      <b>{m.title}</b>
                      <small>{m.detail}</small>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <JobCompare />

        <section className="jo-rate" aria-label="Base salary broken down">
          <h2>{money(salary)} a year is</h2>
          <dl>
            {[
              ["a month", money(salary / 12, 2)],
              ["every two weeks", money(salary / 26, 2)],
              ["a week", money(weekly, 2)],
              ["a workday", money(salary / 260, 2)],
              ["an hour", money(weekly / 37.5, 2)],
            ].map(([k, v]) => (
              <div key={k}>
                <dd>{v}</dd>
                <dt>{k}</dt>
              </div>
            ))}
          </dl>
          <p>Before deductions. 260 workdays and 37.5 hours a week are estimates; the offer points to the Working Hours policy.</p>
        </section>
      </div>
    </GlossaryScope>
  );
}
