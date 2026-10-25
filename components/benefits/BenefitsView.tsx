"use client";

import Link from "next/link";
import { useMemo } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import SeeAlso from "@/components/ui/SeeAlso";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { BENEFIT_GROUPS, benefitItems, type BenefitGroup, type BenefitItem, type BenefitStep } from "@/lib/benefitsChecklist";
import { money } from "@/lib/format";

const GROUP_ORDER = Object.keys(BENEFIT_GROUPS) as BenefitGroup[];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DO_NEXT = 5;

/**
 * When a step is due, as a sortable date, or null for steps that recur ("Yearly", "Before trips").
 * "Now" sorts first.
 */
function dueBy(when: string | undefined, today: Date): number | null {
  if (!when) return null;
  if (/^now$/i.test(when)) return 0;
  const year = today.getFullYear();
  if (/year end|dec 31/i.test(when)) return new Date(year, 11, 31).getTime();
  const m = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*(?:\s+(\d{4}))?/.exec(when);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1]);
  let y = m[2] ? Number(m[2]) : year;
  if (!m[2] && new Date(y, month + 1, 0) < today) y++;
  // "Before Feb 2027" is due at the end of January
  return /before/i.test(when) ? new Date(y, month, 0).getTime() : new Date(y, month, 1).getTime();
}

function Step({ step, benefit, done, onChange }: { step: BenefitStep; benefit?: string; done: boolean; onChange: (v: boolean) => void }) {
  return (
    <li className={done ? "done" : undefined}>
      <label>
        <input type="checkbox" checked={done} onChange={(e) => onChange(e.target.checked)} />
        <span>
          <b>
            <G>{step.title}</G>
          </b>
          <small>
            {benefit && <>{benefit} · </>}
            <G>{step.body}</G>
          </small>
        </span>
        {step.when && <em>{step.when}</em>}
      </label>
    </li>
  );
}

/** Every benefit Air Canada gives you: what it is worth, what to do first, and the full checklist per benefit. */
export default function BenefitsView() {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const items = useMemo(() => benefitItems(), []);

  const isDone = (s: BenefitStep) => !!read[s.id] || !!s.also?.some((id) => read[id]);
  const setDone = (s: BenefitStep, v: boolean) => {
    toggle(s.id, v);
    if (!v) s.also?.filter((id) => read[id]).forEach((id) => toggle(id, false));
  };

  const steps = items.flatMap((b) => b.steps);
  const done = steps.filter(isDone).length;
  const yearly = items.reduce((t, b) => t + (b.value && !b.once ? b.value : 0), 0);
  const once = items.reduce((t, b) => t + (b.value && b.once ? b.value : 0), 0);
  // each benefit's value, scaled by the share of its steps still open
  const unclaimed = items.reduce((t, b) => t + (b.value && !b.once ? (b.value * b.steps.filter((s) => !isDone(s)).length) / b.steps.length : 0), 0);
  const byGroup = GROUP_ORDER.map((g) => ({ g, value: items.filter((b) => b.group === g && !b.once).reduce((t, b) => t + (b.value ?? 0), 0) })).filter((x) => x.value > 0);

  // the open steps with a deadline, soonest first
  const today = new Date();
  const timed = items
    .flatMap((b) => b.steps.map((s) => ({ s, b, due: dueBy(s.when, today) })))
    .filter((x) => x.due !== null && !isDone(x.s))
    .sort((a, b) => a.due! - b.due!);
  const next = timed.slice(0, DO_NEXT);

  const status = (b: BenefitItem) => {
    const n = b.steps.filter(isDone).length;
    return { n, all: n === b.steps.length };
  };

  return (
    <GlossaryScope>
      <div className="bf">
        <section className="bf-sum">
          <p className="bf-lead">
            On top of your salary, Air Canada&rsquo;s benefits are worth about <b className="pos">{money(yearly)} a year</b>
            {once > 0 && <> plus {money(once)} once</>}. You&rsquo;ve done <b>{loading ? "…" : done}</b> of {steps.length} steps to use them
            {unclaimed >= 1 ? (
              <>
                , and about <b className="warn">{money(unclaimed)} a year</b> is still unclaimed.
              </>
            ) : (
              <>. You&rsquo;re using all of it.</>
            )}
          </p>
          <div className="bf-bar" role="img" aria-label={byGroup.map((x) => `${BENEFIT_GROUPS[x.g].title} ${money(x.value)}`).join(", ")}>
            {byGroup.map((x) => (
              <i key={x.g} style={{ width: `${(x.value / (yearly || 1)) * 100}%`, background: BENEFIT_GROUPS[x.g].color }} />
            ))}
          </div>
          <div className="bf-keys">
            {byGroup.map((x) => (
              <span key={x.g}>
                <i style={{ background: BENEFIT_GROUPS[x.g].color }} />
                {BENEFIT_GROUPS[x.g].title} <b>{money(x.value)}</b>
              </span>
            ))}
          </div>
        </section>
        {error && <p className="note">{error}</p>}

        <div className="bf-lay">
          <section className="bf-next" aria-labelledby="bf-next-h">
            <h2 id="bf-next-h">Do next</h2>
            {next.length ? (
              <>
                <p className="bf-sub">The steps with a deadline, soonest first.</p>
                <ul className="bf-steps">
                  {next.map(({ s, b }) => (
                    <Step key={s.id} step={s} benefit={b.name} done={false} onChange={(v) => setDone(s, v)} />
                  ))}
                </ul>
                {timed.length > next.length && <p className="bf-sub">{timed.length - next.length} more with a deadline in the list.</p>}
              </>
            ) : (
              <p className="bf-sub">Nothing due. The rest are habits for when they come up: trips, claims, enrolment.</p>
            )}
          </section>

          <div className="bf-list">
            {GROUP_ORDER.map((g) => {
              const list = items.filter((b) => b.group === g);
              const groupDone = list.filter((b) => status(b).all).length;
              const groupValue = list.reduce((t, b) => t + (b.value && !b.once ? b.value : 0), 0);
              const groupSteps = { done: list.reduce((t, b) => t + status(b).n, 0), total: list.reduce((t, b) => t + b.steps.length, 0) };
              return (
                <section key={g} className="bf-grp" style={{ ["--c" as string]: BENEFIT_GROUPS[g].color }} aria-labelledby={`bf-${g}`}>
                  <header className="bf-gh">
                    <i aria-hidden="true" />
                    <div>
                      <h2 id={`bf-${g}`}>{BENEFIT_GROUPS[g].title}</h2>
                      <p>{BENEFIT_GROUPS[g].note}</p>
                    </div>
                    <div className="bf-gs">
                      {groupValue > 0 && <b>{money(groupValue)} a year</b>}
                      <span>
                        {groupDone} of {list.length} all set
                      </span>
                      <span className="bf-gp" aria-hidden="true">
                        <s style={{ width: `${(groupSteps.done / (groupSteps.total || 1)) * 100}%` }} />
                      </span>
                    </div>
                  </header>
                  {list.map((b) => {
                    const { n, all } = status(b);
                    return (
                      <details key={b.id} className={`bf-item${all ? " all" : ""}`}>
                        <summary>
                          <span className="bf-name">
                            <b>{b.name}</b>
                            <small>
                              {b.value !== undefined && <>{money(b.value)} </>}
                              {b.valueNote}
                            </small>
                          </span>
                          <span className={`bf-state${all ? " all" : ""}`}>{all ? "✓ All set" : `${n} of ${b.steps.length}`}</span>
                        </summary>
                        <div className="bf-body">
                          <p>
                            <G>{b.what}</G>
                          </p>
                          <ul className="bf-steps">
                            {b.steps.map((s) => (
                              <Step key={s.id} step={s} done={isDone(s)} onChange={(v) => setDone(s, v)} />
                            ))}
                          </ul>
                          {b.link && (
                            <Link href={b.link.href} className="ps-more">
                              Details on {b.link.label} →
                            </Link>
                          )}
                        </div>
                      </details>
                    );
                  })}
                </section>
              );
            })}
          </div>
        </div>

        <SeeAlso href="/recommendations" label="Action plan">
          Everything else worth doing: savings habits, debt, tax, investing and big purchases
        </SeeAlso>
      </div>
    </GlossaryScope>
  );
}
