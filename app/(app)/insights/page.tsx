import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import InsightsView from "@/components/planner/insights/InsightsView";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <PageShell title="Insights" subtitle="Everything the app has worked out about your money: key insights from your taxes, job, pay, insurance and retirement, a budget health check, and the numbers behind them.">
      <InsightsView />
    </PageShell>
  );
}
