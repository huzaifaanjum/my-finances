"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";

interface Props {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

/** Labelled slider with its formatted value. The filled part of the track follows the value (--p). */
export default function RangeControl({ label, value, min, max, step, format, onChange }: Props) {
  const id = useId();
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <GlossaryScope>
      <div className="ctl">
        <label htmlFor={id}>
          <span>{typeof label === "string" ? <G>{label}</G> : label}</span>
          <output htmlFor={id}>{format(value)}</output>
        </label>
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ "--p": `${fill}%` } as CSSProperties}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </GlossaryScope>
  );
}
