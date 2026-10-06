import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PlanColumns from "@/components/planner/plan/PlanColumns";
import OverviewKpis from "@/components/planner/shared/OverviewKpis";

export const metadata: Metadata = { title: "Plan" };

export default function PlanPage() {
  return (
    <PageShell
      title="Plan"
      subtitle="Starts October 2026. Defaults come from your September pay stub: $4,387.37 net plus $293.53 of one-time retro deductions added back, about $4,681 a month (set to $4,680). Change any input and every page updates."
    >
      <OverviewKpis />
      <PlanColumns />
    </PageShell>
  );
}
