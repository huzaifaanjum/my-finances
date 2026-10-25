import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import GoalsView from "@/components/planner/goals/GoalsView";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <PageShell title="Goals" subtitle="What you are saving for: a home and a car with their own detailed plans, and any other goal you add. Open one to adjust it.">
      <GoalsView />
    </PageShell>
  );
}
