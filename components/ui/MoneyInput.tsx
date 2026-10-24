"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  /** arrow keys move by this much */
  step?: number;
  disabled?: boolean;
  label: string;
}

/** A compact dollar amount you type. Arrow keys step it; empty counts as 0; values are kept between 0 and `max`. */
export default function MoneyInput({ value, onChange, max = 1_000_000, step = 10, disabled, label }: Props) {
  const [text, setText] = useState(String(value));
  const [focused, setFocused] = useState(false);

  // follow changes from elsewhere (another device, a "use this" button) unless you are typing
  useEffect(() => {
    if (!focused) setText(String(value));
  }, [value, focused]);

  const commit = (v: number) => {
    const n = Math.min(max, Math.max(0, Math.round(v * 100) / 100));
    onChange(n);
    return n;
  };

  return (
    <span className={`mi${disabled ? " off" : ""}`}>
      <i>$</i>
      <input
        inputMode="decimal"
        aria-label={label}
        value={focused ? text : Number(value).toLocaleString("en-CA")}
        disabled={disabled}
        onFocus={() => {
          setFocused(true);
          setText(String(value));
        }}
        onBlur={() => {
          setFocused(false);
          setText(String(value));
        }}
        onChange={(e) => {
          setText(e.target.value);
          const n = Number(e.target.value.replace(/[$,\s]/g, ""));
          if (Number.isFinite(n)) commit(n);
        }}
        onKeyDown={(e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const n = commit(value + (e.key === "ArrowUp" ? step : -step) * (e.shiftKey ? 10 : 1));
          setText(String(n));
        }}
      />
    </span>
  );
}
