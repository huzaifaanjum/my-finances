import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/layout/PageShell";
import CarGoal from "@/components/planner/goals/CarGoal";
import HouseGoal from "@/components/planner/goals/HouseGoal";
import { findGoal, GOALS } from "@/lib/planner/goals";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GOALS.map((g) => ({ id: g.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const goal = findGoal((await params).id);
  return { title: goal ? `${goal.name} goal` : "Goal" };
}

export default async function GoalPage({ params }: Props) {
  const goal = findGoal((await params).id);
  if (!goal) notFound();
  return (
    <PageShell title={goal.name} subtitle={goal.subtitle} back={{ href: "/goals", label: "Goals" }}>
      {goal.id === "house" ? <HouseGoal /> : <CarGoal />}
    </PageShell>
  );
}
