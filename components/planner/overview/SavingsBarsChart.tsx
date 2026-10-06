"use client";

import { fiveTicks, plotHeight, plotWidth, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { Legend, Note } from "@/components/ui/text";
import { money } from "@/lib/format";
import { axisMonthLabel } from "@/lib/planner/calendar";
import type { MonthRow } from "@/lib/planner/types";

const FRAME: Frame = { width: 640, height: 280, left: 56, right: 12, top: 12, bottom: 28 };

/** What you add each month, split into pay and bonuses. */
export default function SavingsBarsChart({ rows }: { rows: MonthRow[] }) {
  const n = rows.length;
  const max = Math.max(1, ...rows.map((r) => r.deposit));
  const min = Math.min(0, ...rows.map((r) => r.deposit));
  const pw = plotWidth(FRAME);
  const ph = plotHeight(FRAME);
  const Y = (v: number) => FRAME.top + ph - ((v - min) / (max - min)) * ph;
  const X = (i: number) => FRAME.left + ((i + 0.5) / n) * pw;
  const bw = Math.max(1, (pw / n) * 0.7);
  const step = Math.ceil(n / 8);
  const total = rows.reduce((t, r) => t + r.deposit, 0);
  const extra = rows.reduce((t, r) => t + r.extra, 0);

  return (
    <div>
      <div className="ct">Savings added each month</div>
      <svg viewBox={`0 0 ${FRAME.width} ${FRAME.height}`} role="img" aria-label="Monthly savings chart">
        <YGrid frame={FRAME} values={fiveTicks(min, max)} y={Y} />
        {rows.map((r, i) => {
          const y0 = Y(0);
          const yb = Y(r.base);
          const yt = Y(r.deposit);
          const x = (X(i) - bw / 2).toFixed(1);
          return (
            <g key={r.i}>
              <rect x={x} y={Math.min(y0, yb).toFixed(1)} width={bw.toFixed(1)} height={Math.abs(yb - y0).toFixed(1)} fill="#34d399" />
              {r.extra !== 0 && (
                <rect x={x} y={Math.min(yb, yt).toFixed(1)} width={bw.toFixed(1)} height={Math.abs(yt - yb).toFixed(1)} fill="#fbbf24" />
              )}
              {(i % step === 0 || i === n - 1) && (
                <XLabel x={X(i)} frame={FRAME}>
                  {axisMonthLabel(r.i, true)}
                </XLabel>
              )}
            </g>
          );
        })}
      </svg>
      <Legend
        items={[
          { label: "From pay", color: "var(--std)" },
          { label: "Bonuses and one-time", color: "var(--promo)" },
        ]}
      />
      <Note>
        Each bar is what you add that month. {money(total)} in total, of which {money(extra)} is bonuses and one-time money. October is zero because only
        starting savings count in the first month.
      </Note>
    </div>
  );
}
