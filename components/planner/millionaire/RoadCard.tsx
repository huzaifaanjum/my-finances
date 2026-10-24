"use client";

import Card from "@/components/ui/Card";
import { Legend } from "@/components/ui/text";
import { useElementWidth } from "@/hooks/useElementWidth";
import { compactMoney, duration, money, percent } from "@/lib/format";
import { monthLabel, planIndex } from "@/lib/planner/calendar";
import type { InvestmentPlan } from "@/lib/planner/finance";
import type { Plan } from "@/lib/planner/projection";

const SHARES = [0.1, 0.25, 0.5, 0.75];
const BIRTH_YEAR = 1997;
const BIRTH_MONTH = 6;

type Kind = "start" | "milestone" | "checkpoint" | "finish";

interface Stop {
  m: number;
  kind: Kind;
  title: string;
  /** date and how far away */
  when: string;
  note?: string;
}

/** Everything worth marking on the road, in time order. */
function stopsFor(plan: Plan, invest: InvestmentPlan): { stops: Stop[]; end: number; reached: boolean } {
  const { bal, inn, hit } = invest.sim;
  const target = plan.state.numbers.target;
  const end = hit ?? bal.length - 1;
  const when = (m: number) => (m === 0 ? "now" : `${monthLabel(m)} · in ${duration(m)}`);
  const fromReturns = (m: number) => (bal[m] > 0 ? Math.max(0, bal[m] - inn[m]) / bal[m] : 0);
  const firstAt = (v: number) => bal.findIndex((b) => b >= v);
  const stops: Stop[] = [{ m: 0, kind: "start", title: "Today", when: monthLabel(0), note: `starting balance ${money(bal[0])}` }];

  // $100k is its own milestone (it may also be 10% of the target, so duplicates collapse)
  const amounts = [...new Set([...SHARES.map((x) => Math.round(x * target)), ...(target > 150_000 ? [100_000] : [])])].sort((a, b) => a - b);
  for (const v of amounts) {
    const m = firstAt(v);
    if (m <= 0 || m > end) continue;
    stops.push({
      m,
      kind: "milestone",
      title: v === 100_000 ? "First $100k" : compactMoney(v),
      when: when(m),
      note: v === 100_000 ? "the hardest one; it speeds up after" : `${percent(fromReturns(m))} from returns`,
    });
  }

  // turning points in how the money grows
  const crossover = bal.findIndex((b, m) => m > 0 && b - bal[m - 1] - (inn[m] - inn[m - 1]) > inn[m] - inn[m - 1] && inn[m] > inn[m - 1]);
  if (crossover > 0 && crossover < end) {
    stops.push({ m: crossover, kind: "checkpoint", title: "Growth beats deposits", when: when(crossover), note: "returns add more each month than you do" });
  }
  const half = bal.findIndex((b, m) => m > 0 && b - inn[m] > inn[m] && inn[m] > 0);
  if (half > 0 && half < end) {
    stops.push({ m: half, kind: "checkpoint", title: "Returns pass your money", when: when(half), note: "growth is now most of the balance" });
  }
  for (let age = 30; age <= 65; age += 5) {
    const m = planIndex(BIRTH_YEAR + age, BIRTH_MONTH);
    if (m > 0 && m < end) stops.push({ m, kind: "checkpoint", title: `Age ${age}`, when: monthLabel(m), note: `${compactMoney(bal[m])} balance` });
  }

  stops.push({
    m: end,
    kind: "finish",
    title: hit === null ? `${compactMoney(bal[end])} after 50 years` : compactMoney(target),
    when: hit === null ? "target not reached" : when(end),
    note: hit === null ? "invest more to get there" : `${percent(fromReturns(end))} from returns`,
  });
  return { stops: stops.sort((a, b) => a.m - b.m || (a.kind === "milestone" ? -1 : 1)), end, reached: hit !== null };
}

interface Pt {
  x: number;
  y: number;
}

/** A winding road: `rows` straight runs joined by half-turns. Returns the path and a point-at-distance function. */
function road(width: number, rows: number, rowGap: number, pad: number) {
  const r = rowGap / 2;
  const x0 = pad + r;
  const x1 = width - pad - r;
  const straight = x1 - x0;
  const turn = Math.PI * r;
  const total = rows * straight + (rows - 1) * turn;
  const y = (i: number) => pad + i * rowGap;

  let d = `M${x0 - r} ${y(0)} L${x0} ${y(0)}`;
  for (let i = 0; i < rows; i++) {
    const ltr = i % 2 === 0;
    d += ` L${ltr ? x1 : x0} ${y(i)}`;
    if (i < rows - 1) d += ` A${r} ${r} 0 0 ${ltr ? 1 : 0} ${ltr ? x1 : x0} ${y(i + 1)}`;
  }
  const lastLtr = (rows - 1) % 2 === 0;
  d += ` L${lastLtr ? x1 + r : x0 - r} ${y(rows - 1)}`;

  const at = (t: number): Pt & { row: number } => {
    let s = Math.max(0, Math.min(1, t)) * total;
    for (let i = 0; i < rows; i++) {
      const ltr = i % 2 === 0;
      if (s <= straight || i === rows - 1) {
        const k = Math.min(s, straight);
        return { x: ltr ? x0 + k : x1 - k, y: y(i), row: i };
      }
      s -= straight;
      if (s <= turn) {
        const a = s / r; // angle travelled around the turn
        const cx = ltr ? x1 : x0;
        const cy = y(i) + r;
        return { x: cx + (ltr ? 1 : -1) * r * Math.sin(a), y: cy - r * Math.cos(a), row: i + 0.5 };
      }
      s -= turn;
    }
    return { x: x0, y: y(0), row: 0 };
  };
  return { d, at, height: pad * 2 + (rows - 1) * rowGap };
}

const COLORS: Record<Kind, string> = { start: "var(--text)", milestone: "var(--std)", checkpoint: "var(--promo)", finish: "var(--std)" };

export default function RoadCard({ plan, invest }: { plan: Plan; invest: InvestmentPlan }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(1100);
  const { stops, end, reached } = stopsFor(plan, invest);
  const rows = width < 900 ? 4 : 3;
  const { d, at, height } = road(width, rows, 150, 76);
  const target = plan.state.numbers.target;

  // labels sit above or below the road; alternate within a row so neighbours don't collide
  const placed = stops.map((s) => ({ s, p: at(end ? s.m / end : 0) }));
  const side: ("above" | "below")[] = [];
  const lastX: Record<string, number> = {};
  placed.forEach(({ p }, k) => {
    const key = String(Math.round(p.row));
    const prev = lastX[key];
    const prevSide = side.slice(0, k).reverse().find((_, j) => Math.round(placed[k - 1 - j].p.row) === Math.round(p.row));
    side.push(prev !== undefined && Math.abs(p.x - prev) < 150 ? (prevSide === "above" ? "below" : "above") : "above");
    lastX[key] = p.x;
  });

  return (
    <Card
      title={`Your road to ${compactMoney(target)}`}
      description={
        reached
          ? `From today to ${monthLabel(end)}, laid out by time: each row of road is about ${Math.round(end / 12 / rows)} years. Milestones are amounts you pass; checkpoints are turning points and birthdays. Notice the later milestones come faster: that is compounding.`
          : "At your current pace the target isn't reached within 50 years. Here is how far 50 years gets you."
      }
    >
      <div ref={ref} className="rm">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={stops.map((s) => `${s.title}, ${s.when}`).join("; ")}>
          <path d={d} fill="none" stroke="#1f1f23" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#2c2c31" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#52525b" strokeWidth="1.5" strokeDasharray="10 10" />
          {placed.map(({ s, p }, k) => {
            const up = side[k] === "above";
            const big = s.kind !== "checkpoint";
            const ty = up ? p.y - (big ? 52 : 44) : p.y + (big ? 34 : 30);
            const anchor = p.x < 90 ? "start" : p.x > width - 90 ? "end" : "middle";
            return (
              <g key={`${s.kind}-${s.m}-${s.title}`} className={`rm-stop ${s.kind}`}>
                <line x1={p.x} x2={p.x} y1={p.y} y2={up ? p.y - (big ? 26 : 20) : p.y + (big ? 16 : 12)} stroke={COLORS[s.kind]} strokeOpacity=".5" />
                {s.kind === "checkpoint" ? (
                  <rect x={p.x - 6} y={p.y - 6} width="12" height="12" transform={`rotate(45 ${p.x} ${p.y})`} fill="var(--bg)" stroke={COLORS[s.kind]} strokeWidth="2.5" />
                ) : s.kind === "finish" ? (
                  <g>
                    <circle cx={p.x} cy={p.y} r="13" fill="var(--std)" />
                    <path d={`M${p.x - 4} ${p.y + 6}V${p.y - 6}l9 3-9 3`} fill="var(--bg)" stroke="var(--bg)" strokeWidth="1.5" strokeLinejoin="round" />
                  </g>
                ) : (
                  <circle cx={p.x} cy={p.y} r={s.kind === "start" ? 9 : 10} fill={s.kind === "start" ? "var(--text)" : "var(--bg)"} stroke={COLORS[s.kind]} strokeWidth="3" />
                )}
                <text x={p.x} y={ty} textAnchor={anchor}>
                  <tspan className="rm-t" x={p.x}>
                    {s.title}
                  </tspan>
                  <tspan className="rm-w" x={p.x} dy="15">
                    {s.when}
                  </tspan>
                  {s.note && big && (
                    <tspan className="rm-n" x={p.x} dy="14">
                      {s.note}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ol className="rm-list">
        {stops.map((s) => (
          <li key={`${s.kind}-${s.m}-${s.title}`} className={s.kind}>
            <i aria-hidden="true" />
            <div>
              <b>{s.title}</b>
              <span>{s.when}</span>
              {s.note && <em>{s.note}</em>}
            </div>
          </li>
        ))}
      </ol>

      <Legend
        items={[
          { label: "Milestone: an amount you pass", color: "var(--std)", kind: "dot" },
          { label: "Checkpoint: a turning point or birthday", color: "var(--promo)", kind: "dot" },
        ]}
      />
    </Card>
  );
}
