import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import RecommendationsView from "@/components/recommendations/RecommendationsView";

export const metadata: Metadata = { title: "Action plan" };

export default function RecommendationsPage() {
  return (
    <PageShell
      title="Action plan"
      subtitle="Everything worth doing with your pay, benefits and savings, in one place: the next steps ranked by what they are worth, where to put your money, and a checklist."
    >
      <RecommendationsView />
    </PageShell>
  );
}
