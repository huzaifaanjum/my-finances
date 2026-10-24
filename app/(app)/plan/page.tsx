import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import PlanFacts from "@/components/planner/plan/PlanFacts";
import PlanView from "@/components/planner/plan/PlanView";

export const metadata: Metadata = { title: "Budget" };

export default function PlanPage() {
  return (
    <PageShell
      title="Budget"
      subtitle="Your income and expenses. Adjust them and watch your projection move. The dashed line is where you stood before."
      facts={<PlanFacts />}
      assumptions
    >
      <PlanView />
    </PageShell>
  );
}
