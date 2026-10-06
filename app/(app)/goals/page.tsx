import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import GoalsView from "@/components/planner/goals/GoalsView";

export const metadata: Metadata = { title: "Goals" };

export default function GoalsPage() {
  return (
    <PageShell title="Goals" subtitle="Plan the big purchases you are saving for.">
      <GoalsView />
    </PageShell>
  );
}
