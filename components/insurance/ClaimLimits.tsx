"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/text";
import { useBenefitLimits } from "@/hooks/useBenefitLimits";
import { CLAIM_LIMITS, STATEMENT_DATE, type ClaimLimit } from "@/lib/benefits";
import { money } from "@/lib/format";

function show(l: ClaimLimit, v: number): string {
  if (l.kind === "percent") return `${v}%`;
  if (l.kind === "count") return `${v}`;
  return money(v);
}

/** A field for a limit the statement doesn't give; saves when you leave it. */
function LimitField({ l, value, onSave }: { l: ClaimLimit; value?: number; onSave: (v: number | null) => void }) {
  const [text, setText] = useState(value === undefined ? "" : String(value));
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setText(value === undefined ? "" : String(value));
  }
  const commit = () => {
    const t = text.replace(/[$,%\s]/g, "");
    if (!t) return value !== undefined && onSave(null);
    const n = Number(t);
    if (Number.isFinite(n) && n >= 0 && n !== value) onSave(n);
    else if (!Number.isFinite(n)) setText(value === undefined ? "" : String(value));
  };
  return (
    <span className={`cl-in ${l.kind}`}>
      {l.kind === "money" && <i>$</i>}
      <input
        inputMode="decimal"
        aria-label={`${l.label}, ${l.per}`}
        placeholder="Add"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
      {l.kind === "percent" && <i>%</i>}
    </span>
  );
}

/** The most each insurance pays: from the statement where it says, otherwise from your booklet. */
export default function ClaimLimits() {
  const { limits, error, save } = useBenefitLimits();
  const all = CLAIM_LIMITS.flatMap((g) => g.limits);
  const fromStatement = all.filter((l) => l.known !== undefined).length;
  const entered = all.filter((l) => l.known === undefined && limits[l.id] !== undefined).length;
  const missing = all.length - fromStatement - entered;
  const valueOf = (l: ClaimLimit) => l.known ?? limits[l.id];
  // money you can claim back each year from health, dental and the spending accounts
  const yearly = CLAIM_LIMITS.filter((g) => ["health", "dental", "lsa"].includes(g.benefit))
    .flatMap((g) => g.limits)
    .filter((l) => l.kind === "money" && /a year/.test(l.per))
    .reduce((t, l) => t + (valueOf(l) ?? 0), 0);

  return (
    <section className="ins-sec">
      <SectionHeading title="How much you can claim">
        {`The most each insurance pays. Amounts marked "Statement" come from your Manulife statement of ${STATEMENT_DATE}; the rest are in your plan booklet or the Manulife app (Coverage, then each benefit), so add them once and they are saved to your account.`}
      </SectionHeading>

      <div className="cl-sum">
        <div>
          <span>From your statement</span>
          <b>{fromStatement}</b>
        </div>
        <div>
          <span>Added from your booklet</span>
          <b>{entered}</b>
        </div>
        <div className={missing ? "warn" : "pos"}>
          <span>Still to look up</span>
          <b>{missing}</b>
        </div>
        <div className="pos">
          <span>You can claim back each year, so far</span>
          <b>{money(yearly)}</b>
          <small>health, dental and spending accounts; grows as you add limits</small>
        </div>
      </div>
      {error && <p className="ps-msg">{error}</p>}

      <div className="cl-grid">
        {CLAIM_LIMITS.map((g) => (
          <div key={g.benefit} className="cl-card">
            <h3>{g.title}</h3>
            <ul>
              {g.limits.map((l) => {
                const known = l.known !== undefined;
                const v = valueOf(l);
                return (
                  <li key={l.id} className={known && l.known === 0 ? "none" : undefined}>
                    <div>
                      <b>{l.label}</b>
                      <span>
                        {l.per}
                        {l.hint && !known && v === undefined && <em> · {l.hint}</em>}
                      </span>
                    </div>
                    {known ? <strong>{show(l, l.known!)}</strong> : <LimitField l={l} value={limits[l.id]} onSave={(x) => save(l.id, x)} />}
                    <span className={`cl-src ${known ? "st" : v !== undefined ? "you" : "todo"}`}>{known ? "Statement" : v !== undefined ? "Booklet" : "To add"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
