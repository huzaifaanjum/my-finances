"use client";

import { Fragment, useMemo, useState } from "react";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import { compactMoney, money, percent } from "@/lib/format";
import { MONTH_NAMES, monthDate, planIndex } from "@/lib/planner/calendar";
import { monthlyLedger, type LedgerRow } from "@/lib/planner/cashflow";

type Metric = "saved" | "balance" | "rate" | "cover";

const METRICS: Record<Metric, { label: string; color: string; describe: string }> = {
  saved: { label: "Saved", color: "var(--std)", describe: "what you add each month" },
  balance: { label: "Balance", color: "var(--scotia)", describe: "savings at the end of each month" },
  rate: { label: "Savings rate", color: "var(--mix)", describe: "share of money in that you keep; 20% is the guideline" },
  cover: { label: "Months covered", color: "var(--promo)", describe: "how many months of expenses the balance would pay" },
};

const TIGHT = 500;

type MomentKind = "best" | "tight" | "bonus" | "milestone";
const ORDER: MomentKind[] = ["tight", "bonus", "best", "milestone"];

interface Moment {
  i: number;
  kind: MomentKind;
  title: string;
  month: string;
  value?: string;
  tone?: string;
}

/** The same symbols as the calendar markers, so moments and squares read together. */
function Glyph({ kind }: { kind: MomentKind }) {
  return (
    <svg className={`ya-g ${kind}`} viewBox="0 0 12 12" aria-hidden="true">
      {kind === "bonus" && <circle cx="6" cy="6" r="4" />}
      {kind === "milestone" && <rect x="2.5" y="2.5" width="7" height="7" transform="rotate(45 6 6)" />}
      {kind === "best" && <path d="M6 2l4.5 8h-9z" />}
      {kind === "tight" && <path d="M6 10L1.5 2h9z" />}
    </svg>
  );
}

const valueOf = (r: LedgerRow, m: Metric) => (m === "saved" ? r.saved : m === "balance" ? r.balance : m === "rate" ? r.rate : r.cover);

function format(v: number, m: Metric): string {
  if (m === "rate") return percent(v);
  if (m === "cover") return `${Math.max(0, v).toFixed(1)}`;
  return compactMoney(v);
}

/** Calendar of the plan, one square per month, coloured by the metric you pick. Click a month to open it in the ledger below. */
export default function YearAtAGlance({ selected: sel, onPick }: { selected: number | null; onPick: (i: number) => void }) {
  const plan = usePlan();
  const ledger = useMemo(() => monthlyLedger(plan), [plan]);
  const [metric, setMetric] = useState<Metric>("saved");

  const flows = ledger.filter((r) => !r.start);
  const vals = ledger.filter((r) => !(r.start && (metric === "saved" || metric === "rate"))).map((r) => valueOf(r, metric));
  const max = Math.max(metric === "rate" ? 0.3 : metric === "cover" ? 3 : 1, ...vals);
  const years = [...new Set(ledger.map((r) => monthDate(r.i).getFullYear()))];

  // highlights
  const best = flows.reduce((b, r) => (r.saved > b.saved ? r : b), flows[0] ?? ledger[0]);
  const tightest = ledger.reduce((b, r) => (r.lowest < b.lowest ? r : b), ledger[0]);
  const milestoneMonths = ledger.flatMap((r) => r.events.filter((e) => e.kind === "milestone").map((e) => ({ name: e.label, r })));
  const bonusMonths = ledger.filter((r) => r.events.some((e) => e.kind === "bonus"));
  // key moments, in time order, shown above the calendar with the same symbols as its markers
  const moments: Moment[] = [
    ...(best ? [{ i: best.i, kind: "best" as const, title: "Best month", month: best.label, value: `${money(best.saved)} saved`, tone: "pos" }] : []),
    {
      i: tightest.i,
      kind: "tight" as const,
      title: "Tightest month",
      month: tightest.label,
      value: `lowest ${money(tightest.lowest)}`,
      tone: tightest.lowest < 0 ? "neg" : tightest.lowest < TIGHT ? "warn" : undefined,
    },
    ...bonusMonths.flatMap((r) =>
      r.events.filter((e) => e.kind === "bonus").map((e) => ({ i: r.i, kind: "bonus" as const, title: e.label, month: r.label, value: `+${money(r.extraIn)}`, tone: "warn" })),
    ),
    ...milestoneMonths.map((m) => ({ i: m.r.i, kind: "milestone" as const, title: m.name, month: m.r.label, value: "reached", tone: undefined })),
  ].sort((a, b) => a.i - b.i || ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  const setSel = (i: number) => onPick(i);

  const fill = (r: LedgerRow): { background: string; strength: number } => {
    const v = valueOf(r, metric);
    if ((metric === "saved" || metric === "rate") && r.start) return { background: "transparent", strength: 0 };
    if (v < 0) return { background: "color-mix(in srgb,var(--neg) 45%,#18181b)", strength: 45 };
    const strength = Math.round(14 + 80 * Math.min(1, v / (max || 1)));
    return { background: `color-mix(in srgb,${METRICS[metric].color} ${strength}%,#18181b)`, strength };
  };

  return (
    <Card
      wide
      className="ya"
      header={
        <div className="ps-head">
          <div>
            <h3>Year at a glance</h3>
            <p className="d">
              Each square is a month, coloured by {METRICS[metric].label.toLowerCase()}: {METRICS[metric].describe}. Click a month to open it in the ledger below.
            </p>
          </div>
          <div className="ps-seg sm" role="group" aria-label="Colour by">
            {(Object.keys(METRICS) as Metric[]).map((m) => (
              <button key={m} type="button" aria-pressed={metric === m} onClick={() => setMetric(m)}>
                {METRICS[m].label}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <ol className="ya-mo" aria-label="Key moments">
        {moments.map((m, k) => (
          <li key={k}>
            <button type="button" onClick={() => setSel(m.i)} className={sel === m.i ? "on" : undefined}>
              <Glyph kind={m.kind} />
              <span>{m.title}</span>
              <b>{m.month}</b>
              {m.value && <em className={m.tone}>{m.value}</em>}
            </button>
          </li>
        ))}
      </ol>

      <div className="ya-cal" role="grid" aria-label={`Months coloured by ${METRICS[metric].label.toLowerCase()}`}>
        <span />
        {MONTH_NAMES.map((m) => (
          <span key={m} className="ya-mh">
            {m[0]}
            <em>{m.slice(1, 3)}</em>
          </span>
        ))}
        <span className="ya-mh ya-yh">Year</span>
        {years.map((y) => {
          const inYear = flows.filter((r) => monthDate(r.i).getFullYear() === y);
          const saved = inYear.reduce((t, r) => t + r.saved, 0);
          const income = inYear.reduce((t, r) => t + r.income, 0);
          const lastOfYear = ledger.filter((r) => monthDate(r.i).getFullYear() === y).at(-1)!;
          return (
            <Fragment key={y}>
              <span className="ya-y">{y}</span>
              {MONTH_NAMES.map((m, mi) => {
                const k = planIndex(y, mi);
                const r = ledger[k];
                if (k < 0 || !r) return <span key={m} className="ya-c off" aria-hidden="true" />;
                const { background, strength } = fill(r);
                const v = valueOf(r, metric);
                const bonus = r.events.some((e) => e.kind === "bonus");
                const milestone = r.events.some((e) => e.kind === "milestone");
                const tight = r.lowest < TIGHT;
                const noValue = r.start && (metric === "saved" || metric === "rate");
                return (
                  <button
                    key={m}
                    type="button"
                    role="gridcell"
                    className={`ya-c${strength > 55 ? " lt" : ""}${sel === r.i ? " sel" : ""}${tight ? (r.lowest < 0 ? " over" : " tight") : ""}${noValue ? " start" : ""}`}
                    style={{ background }}
                    onClick={() => setSel(r.i)}
                    aria-label={`${r.label}: ${METRICS[metric].label} ${noValue ? "starting point" : format(v, metric)}${bonus ? ", bonus" : ""}${milestone ? ", milestone" : ""}`}
                    aria-pressed={sel === r.i}
                  >
                    <span className="ya-v">{noValue ? "start" : format(v, metric)}</span>
                    {metric === "cover" && !noValue && <span className="ya-u">mo</span>}
                    <span className="ya-mk">
                      {bonus && <i className="b" title="Bonus" />}
                      {milestone && <i className="m" title="Milestone" />}
                    </span>
                  </button>
                );
              })}
              <span className="ya-sum">
                <b>{money(saved)}</b>
                <em>
                  saved · {income ? percent(saved / income) : "–"} · ends {compactMoney(lastOfYear.balance)}
                </em>
              </span>
            </Fragment>
          );
        })}
      </div>

      <div className="ya-legend">
        <span>{metric === "rate" ? "0%" : metric === "cover" ? "0 mo" : "Less"}</span>
        <i style={{ background: `linear-gradient(90deg,color-mix(in srgb,${METRICS[metric].color} 14%,#18181b),${METRICS[metric].color})` }} />
        <span>{metric === "rate" ? percent(max) : metric === "cover" ? `${max.toFixed(1)} mo` : compactMoney(max)}</span>
        <span className="k">
          <i className="neg" /> negative
        </span>
        <span className="k">
          <i className="b" /> bonus
        </span>
        <span className="k">
          <i className="m" /> milestone
        </span>
        <span className="k">
          <i className="t" /> tight month (cash under {money(TIGHT)})
        </span>
      </div>

    </Card>
  );
}
