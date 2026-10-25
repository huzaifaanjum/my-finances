import type { Metadata } from "next";
import GoalPage from "@/components/planner/goals/CustomGoalView";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Saving goal" };

/** Every goal lives in your saved plan; "/goals/house" and "/goals/car" open your first goal of that kind. */
export default async function Page({ params }: Props) {
  const { id } = await params;
  return <GoalPage slug={id} />;
}
