// Small presentational building blocks shared by every page.
import type { CSSProperties, ReactNode } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { ProgressBar } from "./bars";

export function Note({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <p className={`note ${className}`.trim()} style={style}>
      <G>{children}</G>
    </p>
  );
}

/** Bold row heading with a total on the right. */
export function GroupHeader({ label, value, style }: { label: ReactNode; value?: ReactNode; style?: CSSProperties }) {
  return (
    <div className="grp" style={style}>
      <span>
        <G>{label}</G>
      </span>
      <span>{value}</span>
    </div>
  );
}

/** Label and value on one line. */
export function KeyValue({ label, value, total, className = "" }: { label: ReactNode; value: ReactNode; total?: boolean; className?: string }) {
  return (
    <div className={`kv${total ? " tt" : ""}`}>
      <span>
        <G>{label}</G>
      </span>
      <span className={className || undefined}>{value}</span>
    </div>
  );
}

/** Legend row with a coloured dot, e.g. "• Rent ......... $2,075". */
export function LegendRow({ label, value, color, style }: { label: ReactNode; value: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <div className="lrow" style={style}>
      <span>
        {color && <i style={{ background: color }} />}
        <G>{label}</G>
      </span>
      <span>{value}</span>
    </div>
  );
}

export interface LegendItem {
  label: ReactNode;
  color?: string;
  /** line (default), dashed line, dot or a thin tick mark */
  kind?: "line" | "dash" | "dot" | "tick";
}

export function Legend({ items, style }: { items: LegendItem[]; style?: CSSProperties }) {
  return (
    <div className="legend" style={style}>
      {items.map((it, k) => (
        <span key={k}>
          {it.kind === "dash" ? (
            <i className="dash" />
          ) : it.kind === "dot" ? (
            <i className="dot" style={it.color ? { background: it.color } : undefined} />
          ) : it.kind === "tick" ? (
            <i style={{ background: it.color ?? "var(--text)", width: 2, height: 12 }} />
          ) : (
            <i style={{ background: it.color }} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** A row comparing one option: name, value, a side figure and a bar. */
export function CompareRow({
  label,
  value,
  aside,
  asideColor,
  bar,
  current,
}: {
  label: ReactNode;
  value: ReactNode;
  aside?: ReactNode;
  asideColor?: string;
  bar: { value: number; color: string };
  current?: boolean;
}) {
  return (
    <div className={`sc${current ? " cur" : ""}`}>
      <b style={{ fontWeight: current ? 600 : 500 }}>{label}</b>
      <span>{value}</span>
      <span style={{ minWidth: 74, textAlign: "right", color: asideColor }}>{aside}</span>
      <ProgressBar value={bar.value} color={bar.color} />
    </div>
  );
}

export function Panel({ title, className = "", children }: { title?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <GlossaryScope>
      <section className={`panel ${className}`.trim()}>
        {title && <h2>{title}</h2>}
        {children}
      </section>
    </GlossaryScope>
  );
}

/** Section heading with a description, used on the Insights page. */
export function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <>
      <h2 className="ih">{title}</h2>
      {children && (
        <p className="d ihd">
          <G>{children}</G>
        </p>
      )}
    </>
  );
}

/** Numbered list of actions: bold title plus explanation. */
export function ActionList({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="acts">
      {items.map((a) => (
        <li key={a.title}>
          <b className="at">{a.title}</b>
          <span>
            <G>{a.body}</G>
          </span>
        </li>
      ))}
    </ol>
  );
}
