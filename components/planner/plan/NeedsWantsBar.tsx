"use client";

import { useEffect, useState } from "react";
import { usePlan } from "@/components/providers/PlannerProvider";
import { money, percent } from "@/lib/format";
import { COLOR } from "@/lib/colors";

interface Part {
  key: "needs" | "wants" | "savings";
  label: string;
  color: string;
  /** the 50/30/20 share of take-home */
  ideal: number;
  /** true when going over the ideal is good */
  more: boolean;
}

const PARTS: Part[] = [
  { key: "needs", label: "Needs", color: COLOR.needs, ideal: 0.5, more: false },
  { key: "wants", label: "Wants", color: COLOR.wants, ideal: 0.3, more: false },
  { key: "savings", label: "Savings", color: COLOR.keep, ideal: 0.2, more: true },
];

const signed = (v: number, fmt: (n: number) => string) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${fmt(Math.abs(v))}`;

/** Two bars on the same scale: what the 50/30/20 guide expects from your take-home, and what your budget does. */
export default function NeedsWantsBar() {
  const { net, needs, wants, left } = usePlan();
  const base = net || 1;
  const mine = { needs, wants, savings: Math.max(0, left) };
  // both bars share one scale, so spending past your take-home sticks out
  const scale = Math.max(base, needs + wants);
  // the table is the detail; remembered per browser
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      setOpen(localStorage.getItem("nw_open") === "1");
    } catch {}
  }, []);
  const toggle = () => {
    setOpen(!open);
    try {
      localStorage.setItem("nw_open", open ? "0" : "1");
    } catch {}
  };

  const bar = (label: string, values: Record<Part["key"], number>) => (
    <div className="nw-line">
      <span className="nw-who">{label}</span>
      <div className="bb-bar" role="img" aria-label={`${label}: ${PARTS.map((p) => `${p.label} ${money(values[p.key])}`).join(", ")}`}>
        {PARTS.filter((p) => values[p.key] > 0).map((p) => (
          <i key={p.key} style={{ width: `${(values[p.key] / scale) * 100}%`, background: p.color }} />
        ))}
      </div>
    </div>
  );

  return (
    <section className="bb nw">
      <button type="button" className="bb-h nw-toggle" aria-expanded={open} aria-controls="nw-breakdown" onClick={toggle}>
        <span className="nw-title">
          Needs, wants and savings
          <span className="nw-pcts" aria-label={`Ideal: ${PARTS.map((p) => `${p.label} ${percent(p.ideal)}`).join(", ")}`}>
            {PARTS.map((p) => (
              <span key={p.key}>
                <i style={{ background: p.color }} />
                {percent(p.ideal)}
              </span>
            ))}
          </span>
        </span>
        <em>
          {open ? "Hide breakdown" : "Show breakdown"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={open ? "up" : ""}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </em>
      </button>
      {bar("Ideal", { needs: base * 0.5, wants: base * 0.3, savings: base * 0.2 })}
      {bar("Yours", mine)}
      {open && (
        <table className="nw-t" id="nw-breakdown">
          <thead>
            <tr>
              <th scope="col">
                <span className="sr-only">Part</span>
              </th>
              <th scope="col">Ideal</th>
              <th scope="col">Yours</th>
              <th scope="col">Difference</th>
            </tr>
          </thead>
          <tbody>
            {PARTS.map((p) => {
              const ideal = base * p.ideal;
              const v = mine[p.key];
              const d = v - ideal;
              const pts = (v / base - p.ideal) * 100;
              const good = Math.abs(pts) < 1 ? "" : (d > 0) === p.more ? "pos" : "warn";
              return (
                <tr key={p.key}>
                  <th scope="row">
                    <i style={{ background: p.color }} />
                    {p.label}
                  </th>
                  <td>
                    {money(ideal)} <em>{percent(p.ideal)}</em>
                  </td>
                  <td>
                    {money(v)} <em>{percent(v / base)}</em>
                  </td>
                  <td className={good}>
                    {signed(d, (n) => money(n))} <em>{signed(pts, (n) => `${n.toFixed(0)} pts`)}</em>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {left < 0 && <p className="bb-rule">You spend {money(-left)} more than you take home, so nothing is left to save.</p>}
    </section>
  );
}
