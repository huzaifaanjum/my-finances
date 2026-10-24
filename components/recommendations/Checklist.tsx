"use client";

import { useMemo, useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { ProgressBar } from "@/components/ui/bars";
import { SectionHeading } from "@/components/ui/text";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { checklist, type Step } from "@/lib/recommendations";

/** Everything worth doing, grouped by area. Ticks are saved to your account. */
export default function Checklist() {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const [hideDone, setHideDone] = useState(false);
  const areas = useMemo(() => checklist(), []);

  const isDone = (s: Step) => !!read[s.id] || !!s.also?.some((id) => read[id]);
  const setDone = (s: Step, v: boolean) => {
    toggle(s.id, v);
    // unticking clears the merged duplicates too, or the step would stay ticked
    if (!v) s.also?.filter((id) => read[id]).forEach((id) => toggle(id, false));
  };
  const all = areas.flatMap((a) => a.steps);
  const done = all.filter(isDone).length;

  return (
    <section className="rec-sec">
      <SectionHeading title="Checklist">
        One list for your offer, your payslips and your savings. Tick things off as you go; your progress is saved to your account.
      </SectionHeading>
      <div className="rec-bar">
        <div className="off-prog">
          <span>{loading ? "Loading…" : `${done} of ${all.length} done`}</span>
          <ProgressBar value={done / all.length} color="var(--std)" />
        </div>
        <label className="ps-switch">
          <input type="checkbox" role="switch" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          <span aria-hidden="true" />
          Hide done
        </label>
      </div>
      {error && <p className="note">{error}</p>}

      <GlossaryScope>
        <div className="off-areas">
          {areas.map((a) => {
            const steps = hideDone ? a.steps.filter((s) => !isDone(s)) : a.steps;
            const areaDone = a.steps.filter(isDone).length;
            if (!steps.length) return null;
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
                  {steps.map((s) => (
                    <li key={s.id} className={isDone(s) ? "done" : undefined}>
                      <label>
                        <input type="checkbox" checked={isDone(s)} onChange={(e) => setDone(s, e.target.checked)} />
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
      {hideDone && done === all.length && <p className="note">Everything is done. Nice work.</p>}
    </section>
  );
}
