"use client";

import { useState } from "react";
import Link from "next/link";
import { G } from "@/components/glossary/GlossaryText";
import type { LimitMap } from "@/hooks/useBenefitLimits";
import { limitValue, LSA_YEARLY } from "@/lib/benefits";
import { money } from "@/lib/format";

/** The benefits tracked in the header, when each renews, and its colour in the ring and list. */
const ROWS = [
  { id: "lsa-year", label: "Spending account", renews: "carries 1 year", color: "#e9b949" },
  { id: "eh-physio", label: "Physio, athletic or rehab therapist", renews: "resets Apr 1", color: "#5b8def" },
  { id: "eh-massage", label: "Massage therapy", renews: "resets Apr 1", color: "#e07b53" },
  { id: "eh-acu", label: "Acupuncture", renews: "resets Apr 1", color: "#4fb39a" },
  { id: "eh-glasses", label: "Glasses or contacts", renews: "every 24 months", color: "#d9668f" },
  { id: "eh-ortho-shoes", label: "Orthopaedic shoes", renews: "1 pair a year", color: "#9a7bea" },
];
const CLAIMED_COLOR = "#3f3f46";

/** An amount you can tap and change; saves when you leave it. */
function ClaimedField({ label, value, max, onSave }: { label: string; value: number; max: number; onSave: (v: number) => void }) {
  const [text, setText] = useState(value ? String(value) : "");
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setText(value ? String(value) : "");
  }
  const commit = () => {
    const n = Math.min(max, Math.max(0, Number(text.replace(/[$,\s]/g, "")) || 0));
    setText(n ? String(n) : "");
    if (n !== value) onSave(n);
  };
  return (
    <label className="st-used" title="Tap the amount to change it">
      <small>claimed</small>
      <span>
        <i>$</i>
        <input
          inputMode="decimal"
          placeholder="0"
          value={text}
          style={{ width: `${Math.max(1, text.length) + 0.4}ch` }}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          aria-label={`${label} already claimed, out of ${money(max)}`}
        />
      </span>
    </label>
  );
}

interface Slice {
  label: string;
  color: string;
  value: number;
  /** for the tooltip: what the benefit gives, what's claimed, and when it renews */
  max?: number;
  claimed?: number;
  renews?: string;
}

/** Donut: one slice per benefit for what's left, then one grey slice for everything claimed. Hover a slice for its details. */
function Ring({ slices, left, usedPct }: { slices: Slice[]; left: number; usedPct: number }) {
  const R = 74;
  const BAND = 28;
  // each sector is a filled ring segment with a thin outline of its own colour, rounding its corners slightly
  const EDGE = 4;
  const total = slices.reduce((t, s) => t + s.value, 0) || 1;
  const shown = slices.filter((s) => s.value > 0).length;
  const gap = shown > 1 ? (4 + EDGE) / R : 0;
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);
  const at = (i: number, e: React.PointerEvent) => {
    const box = (e.currentTarget.closest(".st-ring") as HTMLElement).getBoundingClientRect();
    setHover({ i, x: e.clientX - box.left, y: e.clientY - box.top });
  };
  const h = hover ? slices[hover.i] : null;
  const pt = (r: number, a: number) => `${(90 + r * Math.sin(a)).toFixed(2)} ${(90 - r * Math.cos(a)).toFixed(2)}`;
  const sector = (a0: number, a1: number) => {
    const ro = R + BAND / 2 - EDGE / 2;
    const ri = R - BAND / 2 + EDGE / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${pt(ro, a0)}A${ro} ${ro} 0 ${large} 1 ${pt(ro, a1)}L${pt(ri, a1)}A${ri} ${ri} 0 ${large} 0 ${pt(ri, a0)}Z`;
  };
  let angle = 0;
  return (
    <div className="st-ring" onPointerLeave={() => setHover(null)}>
      <svg viewBox="0 0 180 180" role="img" aria-label={`${money(left)} left to claim, ${Math.round(usedPct)}% used`}>
        {shown === 0 && <circle cx="90" cy="90" r={R} fill="none" stroke="#18181b" strokeWidth={BAND} />}
        {slices.map((s, i) => {
          if (s.value <= 0) return null;
          const sweep = (s.value / total) * 2 * Math.PI;
          const common = {
            className: hover && hover.i !== i ? "dim" : undefined,
            stroke: s.color,
            onPointerEnter: (e: React.PointerEvent) => at(i, e),
            onPointerMove: (e: React.PointerEvent) => at(i, e),
            onPointerDown: (e: React.PointerEvent) => at(i, e),
          };
          const el =
            shown === 1 ? (
              <circle key={i} {...common} cx="90" cy="90" r={R} fill="none" strokeWidth={BAND} />
            ) : (
              <path
                key={i}
                {...common}
                d={sector(angle + gap / 2, angle + sweep - gap / 2)}
                fill={s.color}
                strokeWidth={hover?.i === i ? EDGE + 3 : EDGE}
                strokeLinejoin="round"
              />
            );
          angle += sweep;
          return el;
        })}
      </svg>
      <div className="st-ring-c">
        <b>{money(left)}</b>
        <span>left to claim</span>
        <small>{Math.round(usedPct)}% used</small>
      </div>
      {h && hover && (
        <div className="st-ring-tip" role="tooltip" style={{ left: hover.x, top: hover.y, ["--k" as string]: h.color }}>
          <span className="hd">
            <i aria-hidden="true" />
            {h.label}
          </span>
          {h.max !== undefined ? (
            <>
              <span className="r">
                Left to claim<b>{money(h.value)}</b>
              </span>
              <span className="r">
                Claimed<b>{money(h.claimed ?? 0)}</b>
              </span>
              <span className="r">
                You have<b>{money(h.max)}</b>
              </span>
              <span className="r m">
                {Math.round((h.value / total) * 100)}% of what&apos;s left · {h.renews}
              </span>
            </>
          ) : (
            <span className="r">
              Across every benefit<b>{money(h.value)}</b>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface Props {
  limits: LimitMap;
  lsaUsed: number;
  used: Record<string, number>;
  saveLsaUsed: (v: number) => void;
  saveUsed: (id: string, v: number) => void;
  /** products the Store can fully cover right now, and how many there are */
  free: number;
  products: number;
  wishlist: number;
}

/** The Store header: a ring of what's left overall, and a list of each benefit's have, claimed and left. */
export default function BenefitBars({ limits, lsaUsed, used, saveLsaUsed, saveUsed, free, products, wishlist }: Props) {
  const rows = ROWS.map((r) => {
    const max = r.id === "lsa-year" ? LSA_YEARLY : (limitValue(r.id, limits) ?? 0);
    const claimed = Math.min(max, r.id === "lsa-year" ? lsaUsed : (used[r.id] ?? 0));
    return { ...r, max, claimed, left: max - claimed };
  });
  const total = rows.reduce((t, r) => t + r.max, 0);
  const claimed = rows.reduce((t, r) => t + r.claimed, 0);
  const usedPct = total ? (claimed / total) * 100 : 0;
  const slices: Slice[] = [
    ...rows.map((r) => ({ label: r.label, color: r.color, value: r.left, max: r.max, claimed: r.claimed, renews: r.renews })),
    { label: "Already claimed", color: CLAIMED_COLOR, value: claimed },
  ];

  return (
    <div className="st-rl">
      <div className="st-rl-main">
        <Ring slices={slices} left={total - claimed} usedPct={usedPct} />
        <ul className="st-rl-list">
          {rows.map((r) => (
            <li key={r.id} style={{ ["--k" as string]: r.color }}>
              <i className="st-rl-dot" aria-hidden="true" />
              <span className="st-rl-name">
                <span>
                  <G>{r.label}</G>
                </span>
                <small>{r.renews}</small>
              </span>
              <div className="st-meter" role="img" aria-label={`${money(r.claimed)} claimed of ${money(r.max)}`}>
                {r.claimed > 0 && <i className="y" style={{ width: `${(r.claimed / r.max) * 100}%` }} />}
                {r.left > 0 && <i className="t" style={{ width: `${(r.left / r.max) * 100}%` }} />}
              </div>
              <b className={r.left === 0 ? "zero" : undefined}>
                {money(r.left)}
                <small> of {money(r.max)}</small>
              </b>
              <ClaimedField label={r.label} value={r.claimed} max={r.max} onSave={(v) => (r.id === "lsa-year" ? saveLsaUsed(v) : saveUsed(r.id, v))} />
            </li>
          ))}
        </ul>
      </div>
      <div className="st-rl-foot">
        <span>
          You have <b>{money(total)}</b>
        </span>
        <span>
          Claimed <b>{money(claimed)}</b>
        </span>
        <span>
          <b>{free}</b> of {products} products cost you $0
        </span>
        <Link href="/store/wishlist">
          Wishlist <b>{wishlist}</b> →
        </Link>
      </div>
    </div>
  );
}
