"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePlanner } from "@/components/providers/PlannerProvider";
import Checkbox from "@/components/ui/Checkbox";
import RangeControl from "@/components/ui/RangeControl";
import { carPlan } from "@/lib/planner/car";
import { SLIDERS, type SliderKey } from "@/lib/planner/config";
import { carValues, houseValues } from "@/lib/planner/goals";
import { housePlan } from "@/lib/planner/house";
import type { CustomGoal } from "@/lib/planner/types";

const GoalContext = createContext<CustomGoal | null>(null);

/** Gives the house and car pages the goal they are showing. */
export function GoalScope({ goal, children }: { goal: CustomGoal; children: ReactNode }) {
  return <GoalContext.Provider value={goal}>{children}</GoalContext.Provider>;
}

export function useGoal(): CustomGoal {
  const g = useContext(GoalContext);
  if (!g) throw new Error("useGoal must be used inside <GoalScope>");
  return g;
}

export function useHouse() {
  const { plan } = usePlanner();
  return housePlan(plan, houseValues(useGoal()));
}

export function useCar() {
  const { plan } = usePlanner();
  return carPlan(plan, carValues(useGoal()));
}

/** A slider bound to this goal's own value, with the range and label of the matching planner slider. */
export function GoalSlider({ k, label }: { k: SliderKey; label?: ReactNode }) {
  const g = useGoal();
  const { setGoalValue } = usePlanner();
  const def = SLIDERS[k];
  return (
    <RangeControl
      label={label ?? def.label}
      value={g.values[k] ?? def.initial}
      min={def.min}
      max={def.max}
      step={def.step}
      format={def.format}
      onChange={(v) => setGoalValue(g.id, k, v)}
    />
  );
}

/** An on/off field on this goal, stored as 1 or 0. */
export function GoalCheckbox({ k, label, initial = 1 }: { k: string; label: string; initial?: number }) {
  const g = useGoal();
  const { setGoalValue } = usePlanner();
  return <Checkbox label={label} checked={!!(g.values[k] ?? initial)} onChange={(v) => setGoalValue(g.id, k, v ? 1 : 0)} />;
}
