import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { SectionHeading } from "@/components/ui/text";
import { upcomingDates } from "@/lib/planner/keyDates";

/** Upcoming money and tax dates on one line, soonest first. */
export default function DatesTimeline() {
  const dates = upcomingDates();
  if (!dates.length) return null;
  return (
    <section className="rec-sec">
      <SectionHeading title="Deadlines">Money and tax dates from your offer letter and Canadian tax rules.</SectionHeading>
      <GlossaryScope>
        <ol className="tl">
          {dates.map((d, k) => (
            <li key={d.date} className={k === 0 ? "next" : undefined}>
              <i aria-hidden="true" />
              <em>{d.days === 0 ? "today" : `in ${d.days} days`}</em>
              <b>{d.label}</b>
              <span>
                <G>{d.what}</G>
              </span>
            </li>
          ))}
        </ol>
      </GlossaryScope>
    </section>
  );
}
