"use client";

import { useId, type ReactNode } from "react";
import s from "./knowledge.module.css";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
export const money = (v: number): string => cad.format(Math.round(v));
export const num = (v: number, d = 0): string => v.toFixed(d);

/** Future value of monthly deposits (plus an optional starting balance) at an annual percentage return. */
export function fvMonthly(monthly: number, years: number, annualPct: number, start = 0): number {
  const n = years * 12;
  const r = annualPct / 100 / 12;
  const g = Math.pow(1 + r, n);
  return start * g + (r === 0 ? monthly * n : (monthly * (g - 1)) / r);
}

/** Monthly deposit needed to reach a target. */
export function neededMonthly(target: number, years: number, annualPct: number, start = 0): number {
  const n = years * 12;
  const r = annualPct / 100 / 12;
  const g = Math.pow(1 + r, n);
  const gap = Math.max(0, target - start * g);
  return r === 0 ? gap / n : (gap * r) / (g - 1);
}

/** Level monthly loan payment. */
export function loanPayment(principal: number, annualPct: number, months: number): number {
  const r = annualPct / 100 / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function Slider(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
}) {
  const id = useId();
  const { label, value, onChange, min, max, step = 1, format } = props;
  return (
    <div className={s.row}>
      <label htmlFor={id}>{label}</label>
      <output htmlFor={id}>{format ? format(value) : value}</output>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Stat(props: { label: string; value: string; tone?: "good" | "warn" | "bad" }) {
  return (
    <div className={s.stat}>
      <span>{props.label}</span>
      <b className={props.tone ? s[props.tone] : undefined}>{props.value}</b>
    </div>
  );
}

export function Stats({ children }: { children: ReactNode }) {
  return <div className={s.stats}>{children}</div>;
}

export function Bar(props: { parts: { w: number; color: string; label: string }[] }) {
  const total = props.parts.reduce((a, p) => a + Math.max(0, p.w), 0) || 1;
  return (
    <>
      <div className={s.bar} role="img" aria-label={props.parts.map((p) => `${p.label} ${Math.round((p.w / total) * 100)}%`).join(", ")}>
        {props.parts.map((p) => (
          <i key={p.label} style={{ width: `${(Math.max(0, p.w) / total) * 100}%`, background: p.color }} />
        ))}
      </div>
      <div className={s.legend}>
        {props.parts.map((p) => (
          <span key={p.label}>
            <i style={{ background: p.color }} />
            {p.label}
          </span>
        ))}
      </div>
    </>
  );
}

export function Demo({ children }: { children: ReactNode }) {
  return (
    <div className={s.demo}>
      <p className={s.demoTitle}>Try it</p>
      {children}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className={s.note}>{children}</p>;
}

export function Verdict({ tone, children }: { tone: "good" | "warn" | "bad"; children: ReactNode }) {
  return <p className={`${s.verdict} ${s[tone]}`}>{children}</p>;
}

export const C = { std: "#34d399", promo: "#fbbf24", neg: "#f87171", scotia: "#60a5fa", mix: "#c4b5fd", none: "#52525b" };
export { s };
