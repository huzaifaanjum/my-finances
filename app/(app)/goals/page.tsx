import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import GoalsView from "@/components/planner/goals/GoalsView";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <PageShell title="Goals" subtitle="The big purchases you are saving for. Each goal assumes all your savings go to it. Open one to adjust it and see the full projection.">
      <GoalsView />
    </PageShell>
  );
}
