"use client";

import Link from "next/link";
import type { LimitMap } from "@/hooks/useBenefitLimits";
import { CLAIM_LIMITS, LSA_YEARLY } from "@/lib/benefits";
import { money } from "@/lib/format";
import { BENEFIT_POTS, type Carry } from "@/lib/store";

const KNOWN = new Map(CLAIM_LIMITS.flatMap((g) => g.limits).map((l) => [l.id, l.known]));
const TAG: Record<Carry, string> = { expires: "Resets", carries: "Carries 1 yr", rolling: "Rolling", lifetime: "Lifetime" };

/** Every amount you can claim, collapsed until you open it, split into what you lose at plan year end and what doesn't reset yearly. */
export default function BenefitPots({ limits, lsaUsed }: { limits: LimitMap; lsaUsed: number }) {
  const rows = BENEFIT_POTS.map((p) => {
    const full = KNOWN.get(p.id) ?? limits[p.id];
    // the spending account shows what's left after what you've already claimed
    const left = p.id === "lsa-year" && full !== undefined ? LSA_YEARLY - lsaUsed : full;
    return { ...p, full, left };
  });
  const lose = rows.filter((r) => r.carry === "expires");
  const keep = rows.filter((r) => r.carry !== "expires");
  const sum = (list: typeof rows) => list.reduce((t, r) => t + (r.left ?? 0), 0);
  const missing = rows.filter((r) => r.left === undefined).length;

  const List = ({ list }: { list: typeof rows }) => (
    <ul className="st-pots-l">
      {list.map((r) => (
        <li key={r.id} title={r.note}>
          <span>
            {r.label}
            <small>
              {r.per} · {r.note}
            </small>
          </span>
          {r.carry !== "expires" && <em className={r.carry}>{TAG[r.carry]}</em>}
          {r.left === undefined ? (
            <Link href="/insurance" className="st-pots-add">
              Add
            </Link>
          ) : (
            <b className={r.left === 0 ? "zero" : undefined}>
              {money(r.left)}
              {r.id === "lsa-year" && lsaUsed > 0 && <small> of {money(r.full ?? 0)}</small>}
            </b>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <details className="ph2-split st-pots">
      <summary>
        <h2>Everything you can claim</h2>
        <span>
          {money(sum(lose))} to use this plan year
          {missing > 0 && ` · ${missing} limits still to add`}
        </span>
        <i aria-hidden="true" />
      </summary>
      <p className="st-pots-src">
        From your Manulife statement and the limits you added in <Link href="/insurance">Claim limits</Link>.
      </p>
      <div className="st-pots-g">
        <section className="lose">
          <header>
            <h3>Use it or lose it</h3>
            <b>{money(sum(lose))}</b>
            <small>gone at plan year end if unused</small>
          </header>
          <List list={lose} />
        </section>
        <section className="keep">
          <header>
            <h3>Doesn&apos;t reset yearly</h3>
            <b>{money(sum(keep))}</b>
            <small>carries forward, rolling or lifetime</small>
          </header>
          <List list={keep} />
        </section>
      </div>
    </details>
  );
}
