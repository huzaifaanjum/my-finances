import { money } from "@/lib/format";
import { upcomingDates } from "@/lib/planner/keyDates";
import { isDone, type Step } from "@/lib/recommendations";

/** Progress ring with the counts that matter: done, due now, value still open, next deadline. */
export default function RecSummary({ steps, read, loading }: { steps: Step[]; read: Record<string, number>; loading: boolean }) {
  const done = steps.filter((s) => isDone(s, read)).length;
  const open = steps.filter((s) => !isDone(s, read));
  const dueNow = open.filter((s) => s.priority === "now").length;
  const value = open.reduce((t, s) => t + (s.impact ?? 0), 0);
  const next = upcomingDates()[0];
  const share = steps.length ? done / steps.length : 0;
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <section className="rs">
      <div className="rs-ring" role="img" aria-label={`${done} of ${steps.length} done`}>
        <svg viewBox="0 0 84 84" width="84" height="84">
          <circle cx="42" cy="42" r={R} fill="none" stroke="var(--line)" strokeWidth="8" />
          <circle
            cx="42"
            cy="42"
            r={R}
            fill="none"
            stroke="var(--std)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${C * share} ${C}`}
            transform="rotate(-90 42 42)"
          />
        </svg>
        <div>
          <b>{loading ? "…" : Math.round(share * 100)}%</b>
          <span>done</span>
        </div>
      </div>
      <dl className="rs-stats">
        <div>
          <dt>Checklist</dt>
          <dd>
            {done}
            <small> of {steps.length}</small>
          </dd>
        </div>
        <div className={dueNow ? "warn" : "pos"}>
          <dt>Due now</dt>
          <dd>{dueNow}</dd>
        </div>
        <div className="pos">
          <dt>Still to gain</dt>
          <dd>
            {money(value)}
            <small> a year</small>
          </dd>
        </div>
        {next && (
          <div>
            <dt>Next deadline</dt>
            <dd>
              {next.days === 0 ? "Today" : `${next.days} days`}
              <small> · {next.label}</small>
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
