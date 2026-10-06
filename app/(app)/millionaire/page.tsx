import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import MillionaireView from "@/components/planner/millionaire/MillionaireView";

export const metadata: Metadata = { title: "Road to millionaire" };

export default function MillionairePage() {
  return (
    <PageShell
      title="Road to millionaire"
      subtitle="When your savings reach your target if you invest them, and what gets you there sooner."
    >
      <MillionaireView />
    </PageShell>
  );
}
