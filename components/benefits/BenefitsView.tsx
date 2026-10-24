"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import SeeAlso from "@/components/ui/SeeAlso";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { BENEFIT_GROUPS, benefitItems, type BenefitGroup, type BenefitStep } from "@/lib/benefitsChecklist";
import { money } from "@/lib/format";

type Status = "all" | "todo" | "done";
const GROUP_ORDER = Object.keys(BENEFIT_GROUPS) as BenefitGroup[];

/** Every benefit Air Canada gives you, with a checklist to get full use of each. */
export default function BenefitsView() {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const items = useMemo(() => benefitItems(), []);
  const [group, setGroup] = useState<BenefitGroup | "all">("all");
  const [status, setStatus] = useState<Status>("all");

  const isDone = (s: BenefitStep) => !!read[s.id] || !!s.also?.some((id) => read[id]);
  const setDone = (s: BenefitStep, v: boolean) => {
    toggle(s.id, v);
    if (!v) s.also?.filter((id) => read[id]).forEach((id) => toggle(id, false));
  };

  const steps = items.flatMap((b) => b.steps);
  const done = steps.filter(isDone).length;
  const fullyUsed = items.filter((b) => b.steps.every(isDone)).length;
  const yearly = items.reduce((t, b) => t + (b.value && !b.once ? b.value : 0), 0);
  const once = items.reduce((t, b) => t + (b.value && b.once ? b.value : 0), 0);
  // each benefit's value, scaled by the share of its steps still open
  const unusedValue = items.reduce((t, b) => t + (b.value && !b.once ? (b.value * b.steps.filter((s) => !isDone(s)).length) / b.steps.length : 0), 0);
  const dueNow = steps.filter((s) => !isDone(s) && /now/i.test(s.when ?? "")).length;
  const share = steps.length ? done / steps.length : 0;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div className="bn">
      <section className="rs">
        <div className="rs-ring" role="img" aria-label={`${done} of ${steps.length} steps done`}>
          <svg viewBox="0 0 84 84" width="84" height="84">
            <circle cx="42" cy="42" r={R} fill="none" stroke="var(--line)" strokeWidth="8" />
            <circle cx="42" cy="42" r={R} fill="none" stroke="var(--std)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${C * share} ${C}`} transform="rotate(-90 42 42)" />
          </svg>
          <div>
            <b>{loading ? "…" : Math.round(share * 100)}%</b>
            <span>used</span>
          </div>
        </div>
        <dl className="rs-stats">
          <div className="pos">
            <dt>Worth on top of salary</dt>
            <dd>
              {money(yearly)}
              <small> a year + {money(once)} once</small>
            </dd>
          </div>
          <div>
            <dt>Steps done</dt>
            <dd>
              {done}
              <small> of {steps.length}</small>
            </dd>
          </div>
          <div className={fullyUsed === items.length ? "pos" : "warn"}>
            <dt>Benefits fully used</dt>
            <dd>
              {fullyUsed}
              <small> of {items.length}</small>
            </dd>
          </div>
          <div className={unusedValue ? "warn" : "pos"}>
            <dt>Value still to unlock</dt>
            <dd>
              {money(unusedValue)}
              <small> a year{dueNow ? ` · ${dueNow} to do now` : ""}</small>
            </dd>
          </div>
        </dl>
      </section>

      <div className="bn-bar">
        <div className="ki-topics" role="group" aria-label="Benefit type">
          <button type="button" aria-pressed={group === "all"} onClick={() => setGroup("all")}>
            All <em>{items.length}</em>
          </button>
          {GROUP_ORDER.map((g) => (
            <button key={g} type="button" aria-pressed={group === g} onClick={() => setGroup(g)}>
              <i style={{ background: BENEFIT_GROUPS[g].color }} />
              {BENEFIT_GROUPS[g].title} <em>{items.filter((b) => b.group === g).length}</em>
            </button>
          ))}
        </div>
        <div className="ps-seg sm" role="group" aria-label="Show">
          {(["all", "todo", "done"] as const).map((s) => (
            <button key={s} type="button" aria-pressed={status === s} onClick={() => setStatus(s)}>
              {s === "all" ? "All steps" : s === "todo" ? "To do" : "Done"}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="note">{error}</p>}

      <GlossaryScope>
        {GROUP_ORDER.filter((g) => group === "all" || group === g).map((g) => {
          const cards = items
            .filter((b) => b.group === g)
            .map((b) => ({ b, shown: b.steps.filter((s) => status === "all" || (status === "done") === isDone(s)) }))
            .filter((x) => x.shown.length);
          if (!cards.length) return null;
          return (
            <section key={g} className="bn-sec">
              <div className="bn-sh">
                <h2>
                  <i style={{ background: BENEFIT_GROUPS[g].color }} />
                  {BENEFIT_GROUPS[g].title}
                </h2>
                <span>{BENEFIT_GROUPS[g].note}</span>
              </div>
              <div className="bn-grid">
                {cards.map(({ b, shown }) => {
                  const n = b.steps.filter(isDone).length;
                  const all = n === b.steps.length;
                  return (
                    <article key={b.id} className={`bn-card${all ? " all" : ""}`} style={{ ["--c" as string]: BENEFIT_GROUPS[g].color }}>
                      <header>
                        <div>
                          <h3>
                            <G>{b.name}</G>
                          </h3>
                          <div className="bn-val">
                            {b.value !== undefined && <b>{money(b.value)}</b>}
                            <span>{b.valueNote}</span>
                          </div>
                        </div>
                        <span className={`bn-count${all ? " all" : ""}`}>{all ? "All set" : `${n}/${b.steps.length}`}</span>
                      </header>
                      <div className="bn-prog" aria-hidden="true">
                        <i style={{ width: `${(n / b.steps.length) * 100}%` }} />
                      </div>
                      <p className="bn-what">
                        <G>{b.what}</G>
                      </p>
                      <ul>
                        {shown.map((s) => {
                          const d = isDone(s);
                          return (
                            <li key={s.id} className={d ? "done" : undefined}>
                              <label>
                                <input type="checkbox" checked={d} onChange={(e) => setDone(s, e.target.checked)} />
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
                          );
                        })}
                      </ul>
                      {b.link && (
                        <Link href={b.link.href} className="ps-more">
                          Details on {b.link.label} →
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </GlossaryScope>

      <SeeAlso href="/recommendations" label="Action plan">
        Everything else worth doing: savings habits, debt, tax, investing and big purchases
      </SeeAlso>
    </div>
  );
}
