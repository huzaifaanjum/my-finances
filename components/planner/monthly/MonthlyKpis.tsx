"use client";

import { usePlan } from "@/components/providers/PlannerProvider";
import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { money, percent } from "@/lib/format";
import { monthlyStats } from "./stats";

export default function MonthlyKpis() {
  const { rows } = usePlan();
  const s = monthlyStats(rows);
  const last = rows[rows.length - 1];
  return (
    <KpiGrid>
      <Kpi label={`Balance by ${last.label}`} value={money(last.balance)} note={`${money(s.total)} saved over ${rows.length} months`} tone="hero" />
      <Kpi label="Typical month" value={money(s.average)} note={`average saved from ${s.paid[0]?.label ?? "–"} on`} tone={s.average < 0 ? "neg" : ""} />
      <Kpi
        label="Best month"
        value={money(s.best.deposit)}
        note={s.best.label + (s.best.extra ? ` · includes ${money(s.best.extra)} bonus` : "")}
        tone="pos"
      />
      <Kpi
        label="Bonuses and one-time"
        value={money(s.extra)}
        note={
          s.bonusMonths
            ? `${s.bonusMonths} month${s.bonusMonths > 1 ? "s" : ""} · ${percent(s.total > 0 ? s.extra / s.total : 0)} of all you save`
            : "none in this period"
        }
        tone={s.extra ? "warn" : ""}
      />
    </KpiGrid>
  );
}
