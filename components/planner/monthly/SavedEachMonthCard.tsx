"use client";

import { useState } from "react";
import { fiveTicks, plotHeight, plotWidth, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { MonthTip } from "@/components/charts/TooltipRows";
import { usePlan } from "@/components/providers/PlannerProvider";
import { HorizonSelect } from "@/components/planner/shared/controls";
import Card from "@/components/ui/Card";
import FloatingTip from "@/components/ui/FloatingTip";
import { Legend } from "@/components/ui/text";
import { useElementWidth } from "@/hooks/useElementWidth";
import { money } from "@/lib/format";
import { axisMonthLabel } from "@/lib/planner/calendar";
import { labelStep, monthlyStats } from "./stats";

const MONTHLY_HORIZONS = [3, 6, 12, 24, 36, 60] as const;

/** Bar with rounded top corners. */
function topRounded(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
}

export default function SavedEachMonthCard() {
  const { rows } = usePlan();
  const [ref, width] = useElementWidth<SVGSVGElement>();
  const [hover, setHover] = useState<{ k: number; x: number; y: number } | null>(null);

  const n = rows.length;
  const { average, extra } = monthlyStats(rows);
  const frame: Frame = { width, height: width < 520 ? 220 : 260, left: 56, right: 12, top: 12, bottom: 28 };
  const pw = plotWidth(frame);
  const ph = plotHeight(frame);
  const max = Math.max(1, ...rows.map((r) => Math.max(0, r.base) + r.extra)) * 1.08;
  const min = Math.min(0, ...rows.map((r) => r.base));
  const Y = (v: number) => frame.top + ph - ((v - min) / (max - min)) * ph;
  const cw = pw / n;
  const bw = Math.max(2, Math.min(36, cw * 0.68));
  const step = labelStep(n, pw);
  const y0 = Y(0);

  return (
    <Card
      header={
        <div className="mhead">
          <div>
            <h3>Saved each month</h3>
            <p className="d">
              Hover a bar for the details.{" "}
              {extra > 0
                ? "Amber tops are bonuses and one-time payments; the green is your steady surplus from pay."
                : "Every bar is your steady surplus from pay."}
            </p>
          </div>
          <HorizonSelect className="mhz" values={MONTHLY_HORIZONS} />
        </div>
      }
    >
      <svg
        ref={ref}
        viewBox={`0 0 ${frame.width} ${frame.height}`}
        role="img"
        aria-label="Amount saved each month, split into pay and bonuses"
        onPointerLeave={() => setHover(null)}
      >
        <YGrid frame={frame} values={fiveTicks(min, max)} y={Y} />
        {rows.map((r, k) => {
          const x = frame.left + k * cw + (cw - bw) / 2;
          const hb = Math.max(0, y0 - Y(Math.max(0, r.base)));
          const he = y0 - Y(Math.max(0, r.base) + r.extra) - hb;
          return (
            <g key={r.i}>
              <rect
                className={`hl${hover?.k === k ? " on" : ""}`}
                x={frame.left + k * cw}
                y={frame.top}
                width={cw}
                height={ph}
                fill="transparent"
                onPointerMove={(e) => setHover({ k, x: e.clientX, y: e.clientY })}
              />
              <g pointerEvents="none">
                {r.base < 0 && <rect x={x} y={y0} width={bw} height={Y(r.base) - y0} fill="var(--neg)" />}
                {hb > 0 &&
                  (he > 0 ? (
                    <rect x={x} y={y0 - hb} width={bw} height={hb} fill="var(--std)" />
                  ) : (
                    <path d={topRounded(x, y0 - hb, bw, hb)} fill="var(--std)" />
                  ))}
                {he > 0 && <path d={topRounded(x, y0 - hb - he, bw, Math.max(0, he - (hb > 0 ? 2 : 0)))} fill="var(--promo)" />}
              </g>
              {k % step === 0 && (
                <XLabel x={frame.left + k * cw + cw / 2} frame={frame}>
                  {axisMonthLabel(r.i, n > 12)}
                </XLabel>
              )}
            </g>
          );
        })}
        {average > 0 && (
          <line
            x1={frame.left}
            x2={frame.width - frame.right}
            y1={Y(average)}
            y2={Y(average)}
            stroke="#fafafa"
            strokeOpacity=".7"
            strokeDasharray="4 4"
            pointerEvents="none"
          />
        )}
      </svg>
      <Legend
        items={[
          { label: "From pay", color: "var(--std)" },
          { label: "Bonuses and one-time", color: "var(--promo)" },
          { label: `Monthly average ${money(average)}`, kind: "dash" },
        ]}
      />
      {hover && rows[hover.k] && (
        <FloatingTip point={hover}>
          <MonthTip row={rows[hover.k]} />
        </FloatingTip>
      )}
    </Card>
  );
}
