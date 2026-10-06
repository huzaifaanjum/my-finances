import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PensionView from "@/components/planner/pension/PensionView";

export const metadata: Metadata = { title: "Pension" };

export default function PensionPage() {
  return (
    <PageShell
      title="Pension"
      subtitle="How much you will have when you retire at 65 on July 2, 2062, and where it comes from."
    >
      <PensionView />
    </PageShell>
  );
}
