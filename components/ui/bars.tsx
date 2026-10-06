import type { CSSProperties } from "react";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Thin progress bar. `value` and `mark` are fractions of the full width. */
export function ProgressBar({ value, color, mark, style }: { value: number; color: string; mark?: number; style?: CSSProperties }) {
  return (
    <div className="bar" style={style}>
      <i style={{ width: `${clamp01(value) * 100}%`, background: color }} />
      {mark !== undefined && <s style={{ left: `${mark * 100}%` }} />}
    </div>
  );
}

export interface Segment {
  /** width in percent of the bar */
  width: number;
  color: string;
  title?: string;
}

/** Bar split into coloured segments. "thick" adds an optional marker line (percent of the width). */
export function SegmentBar({
  segments,
  variant = "thin",
  marker,
  style,
}: {
  segments: Segment[];
  variant?: "thin" | "thick";
  marker?: number;
  style?: CSSProperties;
}) {
  return (
    <div className={variant === "thin" ? "stackbar" : "istk"} style={style}>
      {segments.map((s, i) => (
        <i key={i} style={{ width: `${s.width}%`, background: s.color }} title={s.title} />
      ))}
      {marker !== undefined && <s style={{ left: `${marker}%` }} />}
    </div>
  );
}

/** Two-part mini bar used in the monthly table. Widths are fractions. */
export function MiniBar({ parts }: { parts: { value: number; color: string }[] }) {
  return (
    <div className="mini">
      {parts.map((p, i) => (
        <i key={i} style={{ width: `${p.value * 100}%`, background: p.color }} />
      ))}
    </div>
  );
}
