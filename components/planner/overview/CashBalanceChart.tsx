"use client";

import { fiveTicks, linePath, plotHeight, plotWidth, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { axisMonthLabel, dayLabel, monthDate } from "@/lib/planner/calendar";
import { Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import type { Plan } from "@/lib/planner/projection";

const FRAME: Frame = { width: 640, height: 280, left: 56, right: 12, top: 12, bottom: 28 };

const labelStep = (n: number) => (n <= 6 ? 1 : n <= 12 ? 2 : n <= 24 ? 3 : n <= 36 ? 6 : 12);

/** Day-by-day chequing balance: bills on the 1st, spending through the month, pay at the end. */
export default function CashBalanceChart({ plan }: { plan: Plan }) {
  const { days, months } = plan;
  const vals = days.map((p) => p.bal);
  let max = Math.max(...vals);
  const min = Math.min(0, ...vals);
  if (max <= min) max = min + 1;

  const pw = plotWidth(FRAME);
  const ph = plotHeight(FRAME);
  const X = (k: number) => FRAME.left + (k / Math.max(1, days.length - 1)) * pw;
  const Y = (v: number) => FRAME.top + ph - ((v - min) / (max - min)) * ph;
  const step = labelStep(months);
  const end = vals[vals.length - 1];
  const saved = plan.last.balance;

  return (
    <div>
      <div className="ct">Cash balance</div>
      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} role="img" aria-label="Savings balance chart">
        <YGrid frame={FRAME} values={fiveTicks(min, max)} y={Y} />
        {min < 0 && <line x1={FRAME.left} x2={FRAME.width - FRAME.right} y1={Y(0)} y2={Y(0)} stroke="#f87171" strokeDasharray="4 4" />}
        {days.map((p, k) =>
          p.d === 1 && p.i % step === 0 ? (
            <XLabel key={k} x={X(k)} frame={FRAME}>
              {months <= 6 ? `${axisMonthLabel(p.i, false)} 1` : axisMonthLabel(p.i, true)}
            </XLabel>
          ) : null,
        )}
        <path
          d={linePath(days.map((p, k) => [X(k), Y(p.bal)]))}
          fill="none"
          stroke="#fafafa"
          strokeWidth={months > 24 ? 1.5 : 2}
          strokeLinejoin="round"
        />
        {months <= 6 && days.map((p, k) => (p.pay ? <circle key={k} cx={X(k)} cy={Y(p.bal)} r="4" fill="var(--std)" /> : null))}
      </svg>
      <div className="legend">
        <span>
          <i style={{ background: "var(--text)" }} />
          Total cash
        </span>
      </div>
      <Note>
        Lowest point {money(plan.low.bal)} on {dayLabel(monthDate(plan.low.i, plan.low.d))}. Ends at {money(end)}: {money(saved)} saved plus{" "}
        {money(end - saved)} of next month&apos;s pay that has just arrived (the headline figure leaves that out). Each month the balance drops on the 1st
        (fixed bills), slides down through the month (other spending), and jumps on the last banking day (pay and any bonus). October&apos;s bills are
        assumed paid already, so just before October&apos;s pay you hold your starting savings.
      </Note>
    </div>
  );
}
