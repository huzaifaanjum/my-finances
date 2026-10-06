"use client";

import { useState } from "react";
import { Crosshair, fiveTicks, linePath, plotHeight, plotWidth, viewBoxX, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { Legend } from "@/components/ui/text";
import { compactMoney, deltaMoney, money } from "@/lib/format";
import { axisMonthLabel } from "@/lib/planner/calendar";
import type { MonthRow } from "@/lib/planner/types";

const FRAME: Frame = { width: 640, height: 260, left: 56, right: 12, top: 12, bottom: 28 };

/** Savings balance month by month, with the plan you started from drawn underneath. */
export default function ProjectionChart({ rows, before, changed }: { rows: MonthRow[]; before: MonthRow[]; changed: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = rows.length;
  const all = [...rows, ...before].map((r) => r.balance);
  let max = Math.max(...all);
  const min = Math.min(0, ...all);
  if (max <= min) max = min + 1;

  const pw = plotWidth(FRAME);
  const ph = plotHeight(FRAME);
  const X = (i: number) => FRAME.left + (i / Math.max(1, n - 1)) * pw;
  const Y = (v: number) => FRAME.top + ph - ((v - min) / (max - min)) * ph;
  const step = Math.ceil(n / 8);
  const now = linePath(rows.map((r, i) => [X(i), Y(r.balance)]));
  const area = `${now} L${X(n - 1).toFixed(1)} ${Y(Math.max(0, min)).toFixed(1)} L${X(0).toFixed(1)} ${Y(Math.max(0, min)).toFixed(1)} Z`;

  const k = hover ?? n - 1;
  const row = rows[k];
  const diff = row.balance - (before[k]?.balance ?? row.balance);

  return (
    <div>
      <div className="pj-read">
        <span>{row.label}</span>
        <b>{money(row.balance)}</b>
        {changed && <em className={diff > 0 ? "up" : diff < 0 ? "down" : ""}>{Math.round(diff) ? `${deltaMoney(diff)} vs before` : "no change"}</em>}
      </div>
      <svg
        viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
        role="img"
        aria-label="Projected savings balance"
        onPointerMove={(e) => {
          const x = viewBoxX(e, FRAME.width);
          setHover(Math.max(0, Math.min(n - 1, Math.round(((x - FRAME.left) / pw) * (n - 1)))));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <YGrid frame={FRAME} values={fiveTicks(min, max)} y={Y} format={compactMoney} />
        {min < 0 && <line x1={FRAME.left} x2={FRAME.width - FRAME.right} y1={Y(0)} y2={Y(0)} stroke="#f87171" strokeDasharray="4 4" />}
        {rows.map((r, i) =>
          i % step === 0 || i === n - 1 ? (
            <XLabel key={r.i} x={X(i)} frame={FRAME}>
              {axisMonthLabel(r.i, true)}
            </XLabel>
          ) : null,
        )}
        <path d={area} fill="var(--std)" opacity="0.08" />
        {changed && (
          <path
            d={linePath(before.map((r, i) => [X(i), Y(r.balance)]))}
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        )}
        <path d={now} fill="none" stroke="var(--std)" strokeWidth="2.25" strokeLinejoin="round" />
        {hover !== null && <Crosshair x={X(k)} y={Y(row.balance)} top={FRAME.top} bottom={FRAME.top + ph} />}
      </svg>
      <Legend
        items={[
          { label: "With your changes", color: "var(--std)" },
          ...(changed ? [{ label: "Before your changes", kind: "dash" as const }] : []),
        ]}
      />
    </div>
  );
}
