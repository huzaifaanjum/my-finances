import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import ComingUp from "@/components/planner/overview/ComingUp";
import Highlights from "@/components/planner/overview/Highlights";
import NextStep from "@/components/planner/overview/NextStep";
import OverviewChart from "@/components/planner/overview/OverviewChart";
import PaySplit from "@/components/planner/overview/PaySplit";
import TabSummaries from "@/components/planner/overview/TabSummaries";
import OverviewKpis from "@/components/planner/shared/OverviewKpis";

export const metadata: Metadata = { title: "Overview" };

export default function OverviewPage() {
  return (
    <PageShell title="Overview" subtitle="Everything at a glance: your key numbers, how your money grows, this year's highlights and one headline from every tab.">
      <OverviewKpis />
      <NextStep />
      <div className="ov-main">
        <div className="ov-left">
          <OverviewChart />
          <Highlights />
        </div>
        <div className="stack">
          <PaySplit />
          <ComingUp />
        </div>
      </div>
      <TabSummaries />
    </PageShell>
  );
}
