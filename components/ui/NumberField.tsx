"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  onChange: (v: number) => void;
};

/**
 * Number input that lets you clear it while typing. Empty or invalid text counts as 0 (never negative),
 * and the text resets when the value changes from elsewhere, e.g. a sync from another device.
 */
export default function NumberField({ value, onChange, ...rest }: Props) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText((t) => (Math.max(0, Number(t) || 0) === value ? t : String(value)));
  }, [value]);

  return (
    <input
      {...rest}
      type="number"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(Math.max(0, Number(e.target.value) || 0));
      }}
    />
  );
}
