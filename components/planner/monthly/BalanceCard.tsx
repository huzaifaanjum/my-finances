"use client";

import { useId, useState } from "react";
import { Crosshair, fiveTicks, linePath, plotHeight, plotWidth, viewBoxX, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { MonthTip } from "@/components/charts/TooltipRows";
import { usePlan } from "@/components/providers/PlannerProvider";
import Card from "@/components/ui/Card";
import FloatingTip from "@/components/ui/FloatingTip";
import { Legend } from "@/components/ui/text";
import { useElementWidth } from "@/hooks/useElementWidth";
import { money } from "@/lib/format";
import { axisMonthLabel } from "@/lib/planner/calendar";
import { labelStep } from "./stats";

/** Savings balance at the end of each month, with a crosshair that follows the pointer. */
export default function BalanceCard() {
  const { rows } = usePlan();
  const gradientId = useId();
  const [ref, width] = useElementWidth<SVGSVGElement>();
  const [hover, setHover] = useState<{ k: number; x: number; y: number } | null>(null);

  const n = rows.length;
  const first = rows[0];
  const last = rows[n - 1];
  const frame: Frame = { width, height: width < 520 ? 220 : 260, left: 56, right: 16, top: 16, bottom: 28 };
  const pw = plotWidth(frame);
  const ph = plotHeight(frame);
  const hi = Math.max(1, ...rows.map((r) => r.balance)) * 1.06;
  const lo = Math.min(0, ...rows.map((r) => r.balance));
  const X = (k: number) => frame.left + (n > 1 ? k / (n - 1) : 0.5) * pw;
  const Y = (v: number) => frame.top + ph - ((v - lo) / (hi - lo)) * ph;
  const line = linePath(rows.map((r, k) => [X(k), Y(r.balance)]));
  const floor = Y(Math.max(lo, 0));
  const step = labelStep(n, pw);

  return (
    <Card
      title="Savings balance"
      description={`From ${money(first.balance)} in ${first.label} to ${money(last.balance)} by ${last.label}. Hover the line for any month.`}
    >
      <svg
        ref={ref}
        viewBox={`0 0 ${frame.width} ${frame.height}`}
        role="img"
        aria-label="Savings balance at the end of each month"
        onPointerMove={(e) => {
          const k = Math.max(0, Math.min(n - 1, Math.round(((viewBoxX(e, frame.width) - frame.left) / pw) * (n - 1))));
          setHover({ k, x: e.clientX, y: e.clientY });
        }}
        onPointerLeave={() => setHover(null)}
      >
        <YGrid frame={frame} values={fiveTicks(lo, hi)} y={Y} />
        {lo < 0 && <line x1={frame.left} x2={frame.width - frame.right} y1={Y(0)} y2={Y(0)} stroke="#52525b" />}
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#34d399" stopOpacity=".22" />
            <stop offset="1" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L${X(n - 1).toFixed(1)} ${floor} L${X(0).toFixed(1)} ${floor}Z`} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" stroke="var(--std)" strokeWidth="2" strokeLinejoin="round" />
        {rows.map((r, k) =>
          r.extra ? <circle key={r.i} cx={X(k)} cy={Y(r.balance)} r="4" fill="var(--promo)" stroke="#09090b" strokeWidth="2" /> : null,
        )}
        {rows.map((r, k) =>
          k % step === 0 ? (
            <XLabel key={r.i} x={X(k)} frame={frame}>
              {axisMonthLabel(r.i, n > 12)}
            </XLabel>
          ) : null,
        )}
        <circle cx={X(n - 1)} cy={Y(last.balance)} r="4" fill="var(--std)" stroke="#09090b" strokeWidth="2" />
        <text x={X(n - 1) - 8} y={Y(last.balance) - 10} textAnchor="end" fill="#fafafa" fontSize="12" fontWeight="600">
          {money(last.balance)}
        </text>
        {hover && <Crosshair x={X(hover.k)} y={Y(rows[hover.k].balance)} top={frame.top} bottom={frame.top + ph} />}
        <rect x={frame.left} y={frame.top} width={pw} height={ph} fill="transparent" />
      </svg>
      <Legend
        items={[
          { label: "Balance", color: "var(--std)" },
          { label: "Bonus month", kind: "dot" },
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
