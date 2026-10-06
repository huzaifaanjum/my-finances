"use client";

import { useState } from "react";
import { Crosshair, plotHeight, plotWidth, viewBoxX, XLabel, YGrid, type Frame } from "@/components/charts/axes";
import { TipRow, TipTitle } from "@/components/charts/TooltipRows";
import FloatingTip from "@/components/ui/FloatingTip";
import { useElementWidth } from "@/hooks/useElementWidth";
import { compactMoney, money } from "@/lib/format";
import { monthLabel, PLAN_START_YEAR } from "@/lib/planner/calendar";
import type { Simulation } from "@/lib/planner/finance";

const MILESTONES = [0.1, 0.25, 0.5, 0.75, 1];

/** A round axis step: 1, 2, 2.5 or 5 times a power of ten, at least `raw`. */
function niceStep(raw: number): number {
  const p10 = Math.pow(10, Math.floor(Math.log10(raw)));
  return [1, 2, 2.5, 5, 10].map((x) => x * p10).find((x) => x >= raw) ?? 10 * p10;
}

/** Stacked areas: your own money and the growth on top, up to the target. */
export default function MillionaireChart({ sim, target }: { sim: Simulation; target: number }) {
  const [ref, width] = useElementWidth<SVGSVGElement>();
  const [hover, setHover] = useState<{ m: number; x: number; y: number } | null>(null);

  const years = Math.min(50, sim.hit === null ? 50 : Math.max(10, Math.ceil(sim.hit / 12) + 5));
  const M = years * 12;
  const frame: Frame = { width, height: width < 520 ? 240 : 320, left: 64, right: 16, top: 16, bottom: 28 };
  const pw = plotWidth(frame);
  const ph = plotHeight(frame);
  const step = niceStep(Math.max(target * 1.05, sim.bal[M]) / 4);
  const top = step * 4;
  const X = (m: number) => frame.left + (m / M) * pw;
  const Y = (v: number) => frame.top + ph - (Math.max(0, v) / top) * ph;

  const area = (value: (m: number) => number) => {
    let d = "";
    for (let m = 0; m <= M; m++) d += `${m ? "L" : "M"}${X(m).toFixed(1)} ${Y(value(m)).toFixed(1)}`;
    return d;
  };
  const base = `L${X(M).toFixed(1)} ${Y(0)} L${X(0).toFixed(1)} ${Y(0)}Z`;
  const yearStep = Math.max(1, Math.ceil(years / Math.max(2, Math.floor(pw / 56))));
  const yearTicks = Array.from({ length: Math.floor(years / yearStep) + 1 }, (_, k) => k * yearStep);
  const stops = MILESTONES.map((x) => ({ x, m: sim.bal.findIndex((b) => b >= x * target) })).filter((s) => s.m >= 0 && s.m <= M);

  return (
    <>
      <svg
        ref={ref}
        viewBox={`0 0 ${frame.width} ${frame.height}`}
        role="img"
        aria-label="Projected investment balance over time"
        onPointerMove={(e) => {
          const m = Math.max(0, Math.min(M, Math.round(((viewBoxX(e, frame.width) - frame.left) / pw) * M)));
          setHover({ m, x: e.clientX, y: e.clientY });
        }}
        onPointerLeave={() => setHover(null)}
      >
        <YGrid frame={frame} values={[0, 1, 2, 3, 4].map((k) => step * k)} y={Y} format={compactMoney} />
        {yearTicks.map((y) => (
          <XLabel key={y} x={X(y * 12)} frame={frame}>
            {y === 0 ? "Now" : PLAN_START_YEAR + y}
          </XLabel>
        ))}
        <path d={`${area((m) => sim.bal[m])} ${base}`} fill="var(--std)" fillOpacity=".35" />
        <path d={`${area((m) => Math.min(sim.inn[m], sim.bal[m]))} ${base}`} fill="var(--scotia)" fillOpacity=".45" />
        <path d={area((m) => sim.bal[m])} fill="none" stroke="var(--std)" strokeWidth="2" />
        <line x1={frame.left} x2={frame.width - frame.right} y1={Y(target)} y2={Y(target)} stroke="#fafafa" strokeOpacity=".7" strokeDasharray="4 4" />
        {stops.map(({ x, m }) => (
          <g key={x}>
            <circle cx={X(m)} cy={Y(sim.bal[m])} r="5" fill="#fafafa" stroke="#09090b" strokeWidth="2" />
            {x === 1 && (
              <text x={X(m) - 10} y={Y(sim.bal[m]) - 12} textAnchor="end" fill="#fafafa" fontSize="12" fontWeight="600">
                {money(target)} · {monthLabel(m)}
              </text>
            )}
          </g>
        ))}
        {hover && <Crosshair x={X(hover.m)} y={Y(sim.bal[hover.m])} top={frame.top} bottom={frame.top + ph} />}
      </svg>
      {hover && (
        <FloatingTip point={hover}>
          <TipTitle>{monthLabel(hover.m)}</TipTitle>
          <TipRow label="You put in" value={sim.inn[hover.m]} color="var(--scotia)" />
          <TipRow label="Growth" value={sim.bal[hover.m] - sim.inn[hover.m]} color="var(--std)" />
          <TipRow label="Balance" value={sim.bal[hover.m]} total />
        </FloatingTip>
      )}
    </>
  );
}
