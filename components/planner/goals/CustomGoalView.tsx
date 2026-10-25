"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Crosshair, fiveTicks, linePath, plotHeight, plotWidth, viewBoxX, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import PageShell from "@/components/layout/PageShell";
import { usePlanner } from "@/components/providers/PlannerProvider";
import MoneyInput from "@/components/ui/MoneyInput";
import { COLOR } from "@/lib/colors";
import { compactMoney, money, percent } from "@/lib/format";
import { axisMonthLabel, isoDate, longDate, monthLabel } from "@/lib/planner/calendar";
import { customGoalPlan, readyLabel } from "@/lib/planner/goals";
import type { CustomGoal } from "@/lib/planner/types";

const HEIGHT = 240;

/** Savings toward the goal month by month, the target, and the date you want it by. */
function GoalChart({ g, series, due }: { g: CustomGoal; series: number[]; due: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const F: Frame = { width, height: HEIGHT, left: 50, right: 12, top: 18, bottom: 26 };
  const n = series.length;
  const max = Math.max(g.target, ...series) * 1.1 || 1;
  const pw = plotWidth(F);
  const ph = plotHeight(F);
  const X = (m: number) => F.left + (m / Math.max(1, n - 1)) * pw;
  const Y = (v: number) => F.top + ph - (v / max) * ph;
  const line = linePath(series.map((v, m) => [X(m), Y(v)]));
  const area = `${line} L${X(n - 1).toFixed(1)} ${Y(0).toFixed(1)} L${X(0).toFixed(1)} ${Y(0).toFixed(1)} Z`;
  const step = Math.max(1, Math.ceil(n / (width < 520 ? 4 : 8)));
  const m = hover ?? Math.min(due, n - 1);

  return (
    <div className="cg-chart" ref={box}>
      <div className="rt-read">
        <span>{monthLabel(m)}</span>
        <b>{money(series[m])}</b>
        <em>{percent(series[m] / (g.target || 1))} of {money(g.target)}</em>
      </div>
      <svg
        viewBox={`0 0 ${F.width} ${F.height}`}
        role="img"
        aria-label={`Savings toward ${g.name || "this goal"}`}
        onPointerMove={(e) => setHover(Math.max(0, Math.min(n - 1, Math.round(((viewBoxX(e, F.width) - F.left) / pw) * (n - 1)))))}
        onPointerLeave={() => setHover(null)}
      >
        <YGrid frame={F} values={fiveTicks(0, max)} y={Y} format={compactMoney} />
        {series.map((_, k) =>
          k % step === 0 || k === n - 1 ? (
            <XLabel key={k} x={X(k)} frame={F}>
              {axisMonthLabel(k, true)}
            </XLabel>
          ) : null,
        )}
        <line x1={F.left} x2={F.width - F.right} y1={Y(g.target)} y2={Y(g.target)} stroke={COLOR.wants} strokeDasharray="5 4" />
        <text x={F.width - F.right} y={Y(g.target) - 6} textAnchor="end" className="rt-lbl">
          Target {compactMoney(g.target)}
        </text>
        <line x1={X(due)} x2={X(due)} y1={F.top} y2={F.top + ph} stroke={COLOR.warn} strokeDasharray="3 3" />
        <path d={area} fill={COLOR.keep} opacity="0.1" />
        <path d={line} fill="none" stroke={COLOR.keep} strokeWidth="2.25" strokeLinejoin="round" />
        {hover !== null && <Crosshair x={X(m)} y={Y(series[m])} top={F.top} bottom={F.top + ph} />}
      </svg>
      <div className="cg-key">
        <span>
          <i style={{ background: COLOR.keep }} /> Saved toward it
        </span>
        <span>
          <i className="dash" /> Target
        </span>
        <span>
          <i className="due" /> Wanted by {longDate(g.date)}
        </span>
      </div>
    </div>
  );
}

/** One page for every goal you add yourself: what, how much, by when, and what it takes each month. */
export default function CustomGoalView({ slug }: { slug: string }) {
  const { state, plan, ready, updateGoal, removeGoal } = usePlanner();
  const router = useRouter();
  const id = Number(slug.replace(/^g/, ""));
  const g = state.goals.find((x) => x.id === id);

  if (ready && !g) {
    return (
      <PageShell title="Goal not found" subtitle="It may have been removed." back={{ href: "/goals", label: "Goals" }}>
        <p className="note">
          <Link href="/goals">Back to your goals →</Link>
        </p>
      </PageShell>
    );
  }
  if (!g) return <PageShell title="Goal" subtitle="" back={{ href: "/goals", label: "Goals" }}>{null}</PageShell>;

  const p = customGoalPlan(g, plan);
  const update = (patch: Partial<Omit<CustomGoal, "id">>) => updateGoal(g.id, patch);
  const suggested = Math.ceil(p.needMonthly / 10) * 10;
  const free = plan.left - g.monthly;

  return (
    <PageShell title={g.name || "New goal"} subtitle="Save a set amount each month until you reach the target. Change anything below and the numbers follow." back={{ href: "/goals", label: "Goals" }}>
      <div className="goal-page cg">
        <dl className="cg-kpis">
          <div>
            <dt>Target</dt>
            <dd>{money(g.target)}</dd>
            <small>by {longDate(g.date)}</small>
          </div>
          <div>
            <dt>Still to save</dt>
            <dd>{money(p.left)}</dd>
            <small>{money(g.saved)} set aside so far</small>
          </div>
          <div>
            <dt>To make the date</dt>
            <dd>{money(p.needMonthly)}/mo</dd>
            <small>for {p.months} month{p.months === 1 ? "" : "s"}</small>
          </div>
          <div className={p.onTrack ? "pos" : "warn"}>
            <dt>At {money(g.monthly)} a month</dt>
            <dd>{readyLabel(p.ready)}</dd>
            <small>{p.ready < 0 ? "add a monthly amount" : p.onTrack ? "on time" : `${p.ready - p.due} months late`}</small>
          </div>
        </dl>

        <div className="cg-lay">
          <section className="jo-card cg-form" aria-label="Goal details">
            <h2>Details</h2>
            <label>
              <span>Name</span>
              <input className="ot-name" value={g.name} placeholder="What you're saving for" onChange={(e) => update({ name: e.target.value })} />
            </label>
            <label>
              <span>Target amount</span>
              <MoneyInput label="Target amount" value={g.target} step={100} onChange={(target) => update({ target })} />
            </label>
            <label>
              <span>Wanted by</span>
              <input className="ot-date" type="date" value={g.date} min={isoDate(1, 1)} max={isoDate(239)} onChange={(e) => e.target.value && update({ date: e.target.value })} />
            </label>
            <label>
              <span>Already set aside</span>
              <MoneyInput label="Already set aside" value={g.saved} step={100} onChange={(saved) => update({ saved })} />
            </label>
            <label>
              <span>Put aside each month</span>
              <MoneyInput label="Put aside each month" value={g.monthly} step={10} onChange={(monthly) => update({ monthly })} />
            </label>
            {Math.abs(g.monthly - suggested) >= 10 && p.left > 0 && (
              <button type="button" className="bd-link cg-use" onClick={() => update({ monthly: suggested })}>
                Use {money(suggested)} a month to reach it by {longDate(g.date)}
              </button>
            )}
            <button
              type="button"
              className="cg-del"
              onClick={() => {
                if (!window.confirm(`Delete "${g.name || "this goal"}"?`)) return;
                removeGoal(g.id);
                router.push("/goals");
              }}
            >
              Delete goal
            </button>
          </section>

          <section className="jo-card" aria-label="Progress">
            <div className="jo-card-h">
              <div>
                <h2>Getting there</h2>
                <p>
                  {p.left === 0
                    ? "You already have enough set aside."
                    : p.ready < 0
                      ? "With nothing set aside each month, you won't get there. Add a monthly amount."
                      : p.onTrack
                        ? `At ${money(g.monthly)} a month you reach ${money(g.target)} in ${monthLabel(p.ready)}, on time.`
                        : `At ${money(g.monthly)} a month you reach it in ${monthLabel(p.ready)}, ${p.ready - p.due} months after you wanted. ${money(suggested)} a month makes the date.`}
                </p>
              </div>
            </div>
            <GoalChart g={g} series={p.series} due={p.due} />
          </section>
        </div>

        <section className="jo-card" aria-label="How it fits your budget">
          <div className="jo-card-h">
            <div>
              <h2>How it fits your budget</h2>
              <p>
                You have {money(plan.left)} left over each month after expenses.{" "}
                {plan.left <= 0
                  ? "There is nothing left over yet, so this goal needs a cut somewhere else first."
                  : free >= 0
                    ? `This goal takes ${percent(p.share)} of it, leaving ${money(free)} for everything else.`
                    : `This goal needs ${money(-free)} more than that each month.`}
              </p>
            </div>
          </div>
          <div className="stackbar" role="img" aria-label={`Goal ${money(Math.min(g.monthly, Math.max(0, plan.left)))}, rest ${money(Math.max(0, free))}`}>
            <i style={{ width: `${Math.min(1, p.share) * 100}%`, background: COLOR.extra }} />
            {free > 0 && <i style={{ width: `${(free / Math.max(1, plan.left)) * 100}%`, background: COLOR.keep }} />}
          </div>
          <div className="cg-key">
            <span>
              <i style={{ background: COLOR.extra }} /> {g.name || "This goal"} {money(g.monthly)}
            </span>
            <span>
              <i style={{ background: COLOR.keep }} /> Other saving {money(Math.max(0, free))}
            </span>
          </div>
          <p className="jo-note">
            Your Budget projection already counts this money as savings. Keeping it in a separate account (a high-interest savings account or a TFSA) stops it from being spent.{" "}
            <Link href="/plan">Budget →</Link>
          </p>
        </section>
      </div>
    </PageShell>
  );
}
