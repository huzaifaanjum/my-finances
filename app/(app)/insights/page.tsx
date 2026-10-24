import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import InsightsView from "@/components/planner/insights/InsightsView";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <PageShell title="Insights" subtitle="Everything the app has worked out about your money: a budget health check, key insights from your payslips, offer and insurance, and the numbers behind them.">
      <InsightsView />
    </PageShell>
  );
}
