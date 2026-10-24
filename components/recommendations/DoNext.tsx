"use client";

import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { nextActions } from "@/components/planner/insights/NextActionsCard";
import { usePlan } from "@/components/providers/PlannerProvider";
import { SectionHeading } from "@/components/ui/text";
import { money } from "@/lib/format";

/** The four steps worth most right now, worked out from your plan. */
export default function DoNext() {
  const actions = nextActions(usePlan()).slice(0, 4);
  if (!actions.length) return null;
  return (
    <section className="rec-sec">
      <SectionHeading title="Do next">Ranked by what each step is worth to you, from the numbers in your plan.</SectionHeading>
      <GlossaryScope>
        <ol className="dn">
          {actions.map((a, k) => (
            <li key={a.title} className={k === 0 ? "top" : undefined}>
              <div className="dn-h">
                <span className="dn-n">{k + 1}</span>
                <em className={a.worth >= 1e9 ? "urgent" : undefined}>{a.worth >= 1e9 ? "Urgent" : `≈ ${money(a.worth)} a month`}</em>
              </div>
              <b>
                <G>{a.title}</G>
              </b>
              <p>{a.body}</p>
            </li>
          ))}
        </ol>
      </GlossaryScope>
    </section>
  );
}
