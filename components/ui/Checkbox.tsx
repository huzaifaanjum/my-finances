"use client";

import { useId } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** "row" sits in a control stack; "inline" sits under other controls */
  variant?: "row" | "inline";
}

export default function Checkbox({ label, checked, onChange, variant = "row" }: Props) {
  const id = useId();
  const input = <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />;
  if (variant === "inline") {
    return (
      <label className="chk">
        {input} {label}
      </label>
    );
  }
  return (
    <GlossaryScope>
      <div className="ctl check">
        {input}
        <label htmlFor={id} style={{ margin: 0 }}>
          <G>{label}</G>
        </label>
      </div>
    </GlossaryScope>
  );
}
