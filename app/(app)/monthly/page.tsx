import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MonthlyView from "@/components/planner/monthly/MonthlyView";

export const metadata: Metadata = { title: "Cash flow" };

export default function MonthlyPage() {
  return (
    <PageShell title="Cash flow" subtitle="What you save each month, where it comes from, and how your balance builds.">
      <MonthlyView />
    </PageShell>
  );
}
