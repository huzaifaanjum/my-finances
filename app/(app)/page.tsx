import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MoneyOverTime from "@/components/planner/overview/MoneyOverTime";
import Recommendations from "@/components/planner/overview/Recommendations";
import OverviewKpis from "@/components/planner/shared/OverviewKpis";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return (
    <PageShell title="Overview" subtitle="Your savings at a glance: the key numbers, how your money grows, and what to do next.">
      <OverviewKpis />
      <MoneyOverTime />
      <Recommendations />
    </PageShell>
  );
}
