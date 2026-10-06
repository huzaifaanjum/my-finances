"use client";

import type { ReactNode } from "react";
import { usePlanner } from "@/components/providers/PlannerProvider";
import Checkbox from "@/components/ui/Checkbox";
import RangeControl from "@/components/ui/RangeControl";
import { HORIZONS, SLIDERS, type FlagKey, type SliderKey } from "@/lib/planner/config";

/** A slider bound to one planner number. Pass `label` to word it differently on another page. */
export function PlannerSlider({ k, label }: { k: SliderKey; label?: ReactNode }) {
  const { state, setNumber } = usePlanner();
  const def = SLIDERS[k];
  return (
    <RangeControl
      label={label ?? def.label}
      value={state.numbers[k]}
      min={def.min}
      max={def.max}
      step={def.step}
      format={def.format}
      onChange={(v) => setNumber(k, v)}
    />
  );
}

export function PlannerCheckbox({ k, label, variant }: { k: FlagKey; label: string; variant?: "row" | "inline" }) {
  const { state, setFlag } = usePlanner();
  return <Checkbox label={label} checked={state.flags[k]} onChange={(v) => setFlag(k, v)} variant={variant} />;
}

/** Chart range picker. `values` limits the choices (the monthly page starts at 3 months). */
export function HorizonSelect({ className, values }: { className?: string; values?: readonly number[] }) {
  const { state, setNumber } = usePlanner();
  const options = HORIZONS.filter((h) => !values || values.includes(h.value));
  const groups = ["Months", "Years"] as const;
  return (
    <select
      className={className}
      aria-label="Time range"
      value={state.numbers.horizon}
      onChange={(e) => setNumber("horizon", Number(e.target.value))}
    >
      {groups.map((g) => (
        <optgroup key={g} label={g}>
          {options
            .filter((h) => h.group === g)
            .map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
