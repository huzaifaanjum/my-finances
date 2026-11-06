"use client";

import { useState } from "react";
import { G, GlossaryScope } from "@/components/glossary/GlossaryText";
import InfoTip from "@/components/ui/InfoTip";
import { money } from "@/lib/format";
import { payMarginal } from "@/lib/pay";
import { SHOE_BUZZ, STORE_CATEGORIES, type Claim, type StoreItem } from "@/lib/store";

const GST = 0.05;
const QST = 0.09975;
/** spending account claims are taxable income, taxed at your marginal rate */
const TAX_RATE = payMarginal(new Date().getFullYear()).rate;

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");
const catLabel = (id: StoreItem["category"]) => STORE_CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** Product photo from the brand's site; falls back to the brand's initial if it won't load. */
function Photo({ item }: { item: StoreItem }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className="st-ph">{item.brand[0]}</span>;
  // external, many hosts: next/image would need every domain whitelisted
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.image} alt={item.name} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} />;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" | "tt" }) {
  return (
    <span className={`st-tr${tone ? ` ${tone}` : ""}`}>
      {label}
      <i>{value}</i>
    </span>
  );
}

/** Everything behind the claim line: the tax, which benefit pays what, and what's left afterwards. */
function ClaimDetails({ item, c, lsaLeft, visionLeft }: { item: StoreItem; c: Claim; lsaLeft: number; visionLeft?: number }) {
  const covered = c.vision + c.lsa;
  return (
    <span className="st-tip">
      <span className="st-thd">
        <b>{item.name}</b>
        <small>
          {item.brand} · {catLabel(item.category)}
        </small>
      </span>

      <span className="st-ts">
        <span className="st-th">Price</span>
        <Row label={item.from ? "Before tax, from" : "Before tax"} value={money(item.price, 2)} />
        {item.was && <Row label={`Sale, was ${money(item.was, 2)}`} value={`−${money(item.was - item.price, 2)}`} tone="pos" />}
        <Row label="GST 5%" value={money(item.price * GST, 2)} />
        <Row label="QST 9.975%" value={money(item.price * QST, 2)} />
        <Row label={item.per ? `Total, ${item.per}` : "Total with tax"} value={money(c.total, 2)} tone="tt" />
      </span>

      <span className="st-ts">
        <span className="st-th">Claim</span>
        {item.benefit === "vision" && (
          <Row label={visionLeft === undefined ? "Vision cover (limit not added)" : "Vision cover"} value={`−${money(c.vision, 2)}`} tone="pos" />
        )}
        <Row label="Spending account" value={`−${money(c.lsa, 2)}`} tone="pos" />
        <Row label={`You pay · ${c.total ? Math.round((covered / c.total) * 100) : 0}% covered`} value={money(c.you, 2)} tone="tt" />
      </span>

      <span className="st-ts">
        <span className="st-th">After buying</span>
        <Row label="Spending account left" value={`${money(lsaLeft, 2)} → ${money(lsaLeft - c.lsa, 2)}`} />
        {item.benefit === "vision" && visionLeft !== undefined && <Row label="Vision left, 24 months" value={`${money(visionLeft, 2)} → ${money(visionLeft - c.vision, 2)}`} />}
        {c.lsa > 0 && <Row label="Extra income tax on the claim" value={`≈ ${money(c.lsa * TAX_RATE, 2)}`} tone="neg" />}
      </span>

      <span className="st-tn">
        {item.benefit === "vision" ? "Needs a valid prescription. " : ""}
        {item.visionOnly ? "Smart glasses: only the prescription eyewear part is a sure claim, so the spending account isn't counted; ask Manulife before relying on it. " : ""}
        {item.per ? "Claim each renewal separately. " : ""}
        Pay, keep the receipt, then claim it in the Manulife app. Spending account claims are a taxable benefit on your T4 and RL-1.
      </span>
    </span>
  );
}

function Source({ title, body }: { title: string; body: string }) {
  return (
    <>
      <b>{title}</b>
      <p className="st-src">{body}</p>
    </>
  );
}

interface Props {
  item: StoreItem;
  claim: Claim;
  /** spending account left before this item */
  lsaLeft: number;
  /** vision limit left before this item; undefined when not added */
  visionLeft?: number;
  wished: boolean;
  onWish: () => void;
}

/** One product: photo, price with tax, what you can claim (details on hover), and a link to the brand's page. */
export default function ProductCard({ item, claim: c, lsaLeft, visionLeft, wished, onWish }: Props) {
  const covered = c.vision + c.lsa;
  const full = c.you === 0;
  const off = item.was ? Math.round((1 - item.price / item.was) * 100) : 0;
  const buzz = SHOE_BUZZ[item.id];

  return (
    <article className={`st-card${full ? " full" : ""}`}>
      <div className="st-img">
        <a href={item.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
          <Photo item={item} />
        </a>
        <div className="st-badges">
          {off > 0 && <span className="st-badge sale">−{off}%</span>}
          {full && <span className="st-badge free">Covered</span>}
        </div>
        <button type="button" className="st-wish" aria-pressed={wished} aria-label={wished ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`} onClick={onWish}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.6 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
          </svg>
        </button>
      </div>

      <div className="st-body">
        <div className="st-meta">
          <span>{item.brand}</span>
          <em>{catLabel(item.category)}</em>
        </div>
        <h3 title={item.name}>
          <GlossaryScope>
            <G>{item.name}</G>
          </GlossaryScope>
        </h3>
        {buzz && (
          <div className="st-buzz">
            {buzz.popular && (
              <InfoTip className="st-tag hot" label={`Why ${item.name} is popular`} text={<Source title="Popular" body={buzz.popular} />}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5 .2 1.8 1 3 2 3.5C11 9 10.5 5 12 2z" />
                </svg>
                Popular
              </InfoTip>
            )}
            {buzz.creators && (
              <InfoTip className="st-tag pick" label={`Who recommends ${item.name}`} text={<Source title="Recommended by running creators" body={buzz.creators} />}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
                </svg>
                Creator pick
              </InfoTip>
            )}
          </div>
        )}

        <div className="st-price">
          <b>
            {item.from && <small>from </small>}
            {money(item.price, 2)}
            {item.per && <small> {item.per}</small>}
          </b>
          {item.was && <s>{money(item.was, 2)}</s>}
          <span>{money(c.total, 2)} with tax</span>
        </div>

        <InfoTip wide className="st-claim" label={`Claim details for ${item.name}`} text={<ClaimDetails item={item} c={c} lsaLeft={lsaLeft} visionLeft={visionLeft} />}>
          <span>
            <small>Claim</small>
            <b>{money(covered, 2)}</b>
          </span>
          <span className={full ? "ok" : "owe"}>
            <small>You pay</small>
            <b>{full ? "$0 ✓" : money(c.you, 2)}</b>
          </span>
        </InfoTip>

        <div className="st-foot">
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="st-go">
            {host(item.url)}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
          <p className="st-why">
            <GlossaryScope>
              <G>{`Eligible as: ${item.why}`}</G>
            </GlossaryScope>
          </p>
        </div>
      </div>
    </article>
  );
}
