import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import InsightsView from "@/components/planner/insights/InsightsView";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <PageShell title="Insights" subtitle="A quick health check of your budget, what to do next, and the numbers behind it.">
      <InsightsView />
    </PageShell>
  );
}
