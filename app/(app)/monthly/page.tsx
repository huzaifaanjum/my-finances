import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MonthlyView from "@/components/planner/monthly/MonthlyView";

export const metadata: Metadata = { title: "Cash flow" };

export default function MonthlyPage() {
  return (
    <PageShell title="Cash flow" subtitle="Money in, money out and what you keep: the totals for the range you pick, the shape of the year, then every month in detail.">
      <MonthlyView />
    </PageShell>
  );
}
