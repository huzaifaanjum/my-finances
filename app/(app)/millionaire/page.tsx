import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MillionaireView from "@/components/planner/millionaire/MillionaireView";

export const metadata: Metadata = { title: "Investing" };

export default function MillionairePage() {
  return (
    <PageShell
      title="Investing"
      subtitle="Your road to a million: when your savings reach your target if you invest them, and what gets you there sooner."
    >
      <MillionaireView />
    </PageShell>
  );
}
