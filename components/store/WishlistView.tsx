"use client";

import Link from "next/link";
import { Note } from "@/components/ui/text";
import { useBenefitLimits } from "@/hooks/useBenefitLimits";
import { useStore } from "@/hooks/useStore";
import { LSA_YEARLY } from "@/lib/benefits";
import { money } from "@/lib/format";
import { claimAll, type StoreItem } from "@/lib/store";
import ProductCard from "./ProductCard";

/** Products you saved from the Store, and what buying all of them costs once your benefits pay their share. */
export default function WishlistView() {
  const { limits } = useBenefitLimits();
  const { items, lsaUsed, wishlist, loading, error, toggleWish } = useStore();
  const lsaLeft = LSA_YEARLY - lsaUsed;
  const glasses = limits["eh-glasses"] ?? 0;

  const wished = wishlist.map((id) => items.find((i) => i.id === id)).filter((i): i is StoreItem => !!i);
  const { claims, total } = claimAll(wished, lsaLeft, glasses);
  const claimed = total.lsa + total.vision;
  const pct = (v: number) => `${total.total ? (v / total.total) * 100 : 0}%`;

  if (loading)
    return (
      <div className="st">
        <div className="ph2 st-hero st-skel" style={{ minHeight: 180 }} />
      </div>
    );

  return (
    <div className="st">
      {error && <p className="ps-msg">{error}</p>}

      {wished.length === 0 ? (
        <div className="st-empty big">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.6 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
          </svg>
          <h2>Your wishlist is empty</h2>
          <p>Tap the heart on anything in the Store to save it here and see what the whole basket costs after your benefits.</p>
          <Link href="/store" className="st-pill">
            Browse the Store →
          </Link>
        </div>
      ) : (
        <>
          <section className="ph2 st-hero">
            <div className="st-hero-main">
              <div className="ph2-lead">
                <span>
                  {wished.length} {wished.length === 1 ? "item" : "items"} would cost you
                </span>
                <b className={total.you > 0 ? "st-owe" : undefined}>{money(total.you, 2)}</b>
                <p>
                  <strong>{money(total.total, 2)}</strong> with GST + QST, and your benefits pay <strong>{money(claimed, 2)}</strong> of it.
                </p>
              </div>
              <dl className="ph2-facts">
                <div>
                  <dt>Spending account</dt>
                  <dd>{money(total.lsa, 2)}</dd>
                  <small>{money(lsaLeft - total.lsa, 2)} left after</small>
                </div>
                <div>
                  <dt>Vision cover</dt>
                  <dd>{money(total.vision, 2)}</dd>
                  <small>{glasses ? `of ${money(glasses)} per 24 months` : "limit not added yet"}</small>
                </div>
                <div>
                  <dt>Covered</dt>
                  <dd>{total.total ? Math.round((claimed / total.total) * 100) : 0}%</dd>
                  <small>of the basket</small>
                </div>
              </dl>
            </div>
            <div className="ph2-split">
              <div className="st-meter big" role="img" aria-label={`Vision ${money(total.vision, 2)}, spending account ${money(total.lsa, 2)}, you ${money(total.you, 2)}`}>
                {total.vision > 0 && <i className="v" style={{ width: pct(total.vision) }} />}
                {total.lsa > 0 && <i className="l" style={{ width: pct(total.lsa) }} />}
                {total.you > 0 && <i className="y" style={{ width: pct(total.you) }} />}
              </div>
              <div className="st-legend">
                {[
                  { k: "v", label: "Vision", v: total.vision },
                  { k: "l", label: "Spending account", v: total.lsa },
                  { k: "y", label: "You", v: total.you },
                ]
                  .filter((x) => x.v > 0)
                  .map((x) => (
                    <span key={x.k}>
                      <i className={x.k} />
                      {x.label} <b>{money(x.v, 2)}</b>
                    </span>
                  ))}
              </div>
            </div>
          </section>

          <div className="st-count">
            <span>In the order you added them; earlier items use the spending account first.</span>
            <Link href="/store" className="st-pill">
              ← Back to the Store
            </Link>
          </div>

          <div className="st-grid">
            {wished.map((item, i) => (
              <ProductCard
                key={item.id}
                item={item}
                claim={claims[i]}
                lsaLeft={lsaLeft - claims.slice(0, i).reduce((t, c) => t + c.lsa, 0)}
                visionLeft={limits["eh-glasses"] === undefined ? undefined : glasses - claims.slice(0, i).reduce((t, c) => t + c.vision, 0)}
                wished
                onWish={() => toggleWish(item.id)}
              />
            ))}
          </div>

          <Note>
            {`Your $${LSA_YEARLY} spending account is shared, so the wishlist splits it across items in the order you added them${glasses ? ", and glasses and contacts use your vision limit first" : ""}. Buy and claim within the plan year; unused dollars usually expire.`}
          </Note>
        </>
      )}
    </div>
  );
}
