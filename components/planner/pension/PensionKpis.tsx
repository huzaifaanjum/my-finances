"use client";

import { Kpi, KpiGrid } from "@/components/ui/Kpi";
import { money, percent } from "@/lib/format";
import type { Retirement } from "@/lib/planner/retirement";

export default function PensionKpis({ r, fundReturn }: { r: Retirement; fundReturn: number }) {
  const { pot, real, mine, match, growth } = r.pension;
  return (
    <KpiGrid>
      <Kpi
        label="Total pension at 65"
        value={money(pot)}
        note={`${money(real)} in today's dollars · Jul 2062`}
        tone="hero"
        tip={`Your contributions ${money(mine)} (automatic) + Air Canada's match ${money(match)} (automatic) + investment growth ${money(growth)} (grows on its own) = ${money(pot)}. See the breakdown below.`}
      />
      <Kpi label="Your contributions" value={money(mine)} note={`6% of your salary · ${percent(mine / pot)} of the pot`} />
      <Kpi label="Air Canada adds" value={money(match)} note={`the 6% employer match · ${percent(match / pot)}`} />
      <Kpi label="Investment growth" value={money(growth)} note={`at ${fundReturn}% a year · ${percent(growth / pot)} of the pot`} tone="pos" />
      <Kpi
        label="Monthly income at 65"
        value={money(r.total)}
        note={`today's dollars, all sources · ${percent(r.replacement)} of take-home`}
        tone={r.status === "good" ? "pos" : r.status === "bad" ? "neg" : ""}
      />
    </KpiGrid>
  );
}
