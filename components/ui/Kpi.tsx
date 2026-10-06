import type { ReactNode } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import { kpiTip } from "@/lib/planner/kpiTips";
import InfoTip from "./InfoTip";

export type KpiTone = "hero" | "pos" | "neg" | "warn" | "";

interface KpiProps {
  label: string;
  value: ReactNode;
  note: ReactNode;
  tone?: KpiTone;
  /** overrides the standard explanation for this label */
  tip?: string;
}

export function Kpi({ label, value, note, tone = "", tip }: KpiProps) {
  const text = tip || kpiTip(label);
  return (
    <div className={`kpi ${tone}`}>
      <div className="k">
        <G>{label}</G>
        {text && <InfoTip text={text} />}
      </div>
      <div className="v">{value}</div>
      <div className="n">
        <G>{note}</G>
      </div>
    </div>
  );
}

export function KpiGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <GlossaryScope>
      <section className={`kpis ${className}`} aria-live="polite">
        {children}
      </section>
    </GlossaryScope>
  );
}
