"use client";

import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { duration, money, percent } from "@/lib/format";
import { monthLabel } from "@/lib/planner/calendar";
import type { InvestmentPlan } from "@/lib/planner/finance";
import type { Plan } from "@/lib/planner/projection";

const HORIZON = 600;

export default function MillionaireKpis({ plan, invest }: { plan: Plan; invest: InvestmentPlan }) {
  const { target, ret, rais } = plan.state.numbers;
  const { hit, bal, inn } = invest.sim;
  const T = hit ?? HORIZON;
  const put = inn[T];
  const growth = bal[T] - put;
  return (
    <KpiGrid>
      <Kpi
        label={`You reach ${money(target)}`}
        value={hit === null ? "Not within 50 yrs" : monthLabel(hit)}
        note={hit === null ? "raise what you invest" : `in ${duration(hit)}`}
        tone="hero"
      />
      <Kpi label="Invest each month" value={money(invest.monthly)} note={`growing ${rais}% a year · ${ret}% return`} />
      <Kpi label="You put in" value={money(put)} note={hit === null ? "over 50 years" : `${percent(put / bal[T])} of the total`} />
      <Kpi label="Growth from returns" value={money(growth)} note={hit === null ? "over 50 years" : `${percent(growth / bal[T])} of the total`} tone="pos" />
      <Kpi label="In today's dollars" value={money(target / Math.pow(1.02, T / 12))} note={`what ${money(target)} buys after 2% yearly inflation`} />
    </KpiGrid>
  );
}
