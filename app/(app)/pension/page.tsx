import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PensionView from "@/components/planner/pension/PensionView";

export const metadata: Metadata = { title: "Retirement" };

export default function PensionPage() {
  return (
    <PageShell
      title="Retirement"
      subtitle="How much you will have when you retire at 65 on July 2, 2062: your Air Canada pension, QPP, OAS and your own investments."
    >
      <PensionView />
    </PageShell>
  );
}
