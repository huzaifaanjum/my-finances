import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CarGoal from "@/components/planner/goals/CarGoal";
import CustomGoalView from "@/components/planner/goals/CustomGoalView";
import HouseGoal from "@/components/planner/goals/HouseGoal";
import { findGoal, GOALS } from "@/lib/planner/goals";

type Props = { params: Promise<{ id: string }> };

// house and car are built in; goals you add (g + id) live in your saved plan
export const dynamicParams = true;

export function generateStaticParams() {
  return GOALS.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const goal = findGoal((await params).id);
  return { title: goal ? `${goal.name} goal` : "Goal" };
}

export default async function GoalPage({ params }: Props) {
  const { id } = await params;
  const goal = findGoal(id);
  if (!goal) return <CustomGoalView slug={id} />;
  return (
    <PageShell title={goal.name} subtitle={goal.subtitle} back={{ href: "/goals", label: "Goals" }}>
      {goal.id === "house" ? <HouseGoal /> : <CarGoal />}
    </PageShell>
  );
}
