import type { PointerEvent } from "react";
import { money } from "@/lib/format";

export const AXIS_COLOR = "#a1a1aa";
export const GRID_COLOR = "#27272a";

export interface Frame {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const plotWidth = (f: Frame) => f.width - f.left - f.right;
export const plotHeight = (f: Frame) => f.height - f.top - f.bottom;

/** Horizontal grid lines with value labels on the left. */
export function YGrid({
  frame,
  values,
  y,
  format = money,
}: {
  frame: Frame;
  values: number[];
  y: (v: number) => number;
  format?: (v: number) => string;
}) {
  return (
    <>
      {values.map((v, k) => (
        <g key={k}>
          <line x1={frame.left} x2={frame.width - frame.right} y1={y(v)} y2={y(v)} stroke={GRID_COLOR} />
          <text x={frame.left - 6} y={y(v) + 4} textAnchor="end" fill={AXIS_COLOR} fontSize="11">
            {format(v)}
          </text>
        </g>
      ))}
    </>
  );
}

/** Five evenly spaced values from min to max. */
export const fiveTicks = (min: number, max: number) => [0, 1, 2, 3, 4].map((k) => min + ((max - min) * k) / 4);

export function XLabel({ x, frame, children }: { x: number; frame: Frame; children: string | number }) {
  return (
    <text x={x} y={frame.height - 8} textAnchor="middle" fill={AXIS_COLOR} fontSize="11" pointerEvents="none">
      {children}
    </text>
  );
}

/** Path data through points: "M x y L x y ..." */
export function linePath(points: [number, number][]): string {
  return points.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

/** Dashed vertical line and dot that follow the pointer. */
export function Crosshair({ x, y, top, bottom }: { x: number; y: number; top: number; bottom: number }) {
  return (
    <g pointerEvents="none">
      <line x1={x} x2={x} y1={top} y2={bottom} stroke={AXIS_COLOR} strokeDasharray="3 3" />
      <circle cx={x} cy={y} r="5" fill="var(--std)" stroke="#09090b" strokeWidth="2" />
    </g>
  );
}

/** Pointer x inside an SVG, converted to viewBox units. */
export function viewBoxX(e: PointerEvent<SVGSVGElement>, viewWidth: number): number {
  const b = e.currentTarget.getBoundingClientRect();
  return ((e.clientX - b.left) * viewWidth) / b.width;
}
