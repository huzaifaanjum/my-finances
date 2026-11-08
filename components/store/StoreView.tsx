"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { G } from "@/components/glossary/GlossaryText";
import SeeAlso from "@/components/ui/SeeAlso";
import { Note } from "@/components/ui/text";
import { useBenefitLimits } from "@/hooks/useBenefitLimits";
import { useStore } from "@/hooks/useStore";
import { limitValue, LSA_YEARLY } from "@/lib/benefits";
import { money } from "@/lib/format";
import { claimFor, QC_SALES_TAX, SHOE_BRANDS, STORE_CATEGORIES, STORE_CHECKED, type StoreBenefit, type StoreCategory } from "@/lib/store";
import BenefitBars from "./BenefitBars";
import BenefitPots from "./BenefitPots";
import ActionCards from "./ActionCards";
import ProductCard from "./ProductCard";

type Sort = "claim" | "low" | "high" | "you";
const SORTS: { id: Sort; label: string }[] = [
  { id: "claim", label: "Most you can claim" },
  { id: "you", label: "Least out of pocket" },
  { id: "low", label: "Price: low to high" },
  { id: "high", label: "Price: high to low" },
];

/** Products from popular brands that your spending account and vision cover pay for, with what you can claim on each. */
export default function StoreView() {
  const { limits } = useBenefitLimits();
  const { items, lsaUsed, used, wishlist, loading, error, saveLsaUsed, saveUsed, toggleWish } = useStore();
  const glasses = limitValue("eh-glasses", limits);
  // what's left after what you've already claimed, so the cards don't count a limit twice
  const glassesLeft = glasses === undefined ? undefined : Math.max(0, glasses - (used["eh-glasses"] ?? 0));
  const orthoLeft = Math.max(0, (limitValue("eh-ortho-shoes", limits) ?? 0) - (used["eh-ortho-shoes"] ?? 0));
  const [query, setQuery] = useState("");
  // category and brand live in the URL (/store?cat=shoes&brand=Nike), so a refresh, a shared link or Back keeps them
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawCat = params.get("cat");
  const cat: StoreCategory | "all" = STORE_CATEGORIES.some((c) => c.id === rawCat) ? (rawCat as StoreCategory) : "all";
  const brand = params.get("brand") ?? "all";
  const filterTo = (nextCat: StoreCategory | "all", nextBrand: string) => {
    const q = new URLSearchParams(params.toString());
    if (nextCat === "all") q.delete("cat");
    else q.set("cat", nextCat);
    if (nextBrand === "all") q.delete("brand");
    else q.set("brand", nextBrand);
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const [benefit, setBenefit] = useState<StoreBenefit | "all">("all");
  const [sort, setSort] = useState<Sort>("claim");
  const [fullOnly, setFullOnly] = useState(false);

  const lsaLeft = LSA_YEARLY - lsaUsed;

  const priced = useMemo(() => items.map((item) => ({ item, c: claimFor(item, lsaLeft, glassesLeft ?? 0, orthoLeft) })), [items, lsaLeft, glassesLeft, orthoLeft]);

  // everything but the category, so each chip can say how many it would show
  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    return priced.filter(
      ({ item, c }) =>
        (benefit === "all" || item.benefit === benefit) &&
        (!fullOnly || c.you === 0) &&
        (!q || `${item.name} ${item.brand} ${item.why} ${item.category}`.toLowerCase().includes(q)),
    );
  }, [priced, query, benefit, fullOnly]);

  const inCat = useMemo(() => matching.filter(({ item }) => cat === "all" || item.category === cat), [matching, cat]);

  // brands in the chosen category, shoe brands first in their usual order, then the rest alphabetically
  const brands = useMemo(() => {
    const count = new Map<string, number>();
    for (const { item } of inCat) count.set(item.brand, (count.get(item.brand) ?? 0) + 1);
    const rank = (b: string) => (SHOE_BRANDS.includes(b) ? SHOE_BRANDS.indexOf(b) : SHOE_BRANDS.length);
    return [...count].sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  }, [inCat]);

  const rows = useMemo(() => {
    const by: Record<Sort, (a: (typeof matching)[number], b: (typeof matching)[number]) => number> = {
      claim: (a, b) => b.c.vision + b.c.lsa - (a.c.vision + a.c.lsa) || a.c.you - b.c.you,
      you: (a, b) => a.c.you - b.c.you || a.item.price - b.item.price,
      low: (a, b) => a.item.price - b.item.price,
      high: (a, b) => b.item.price - a.item.price,
    };
    return inCat.filter(({ item }) => brand === "all" || item.brand === brand).sort(by[sort]);
  }, [inCat, brand, sort]);

  const free = priced.filter(({ c }) => c.you === 0).length;
  const filtered = query || cat !== "all" || brand !== "all" || benefit !== "all" || fullOnly;
  const clear = () => {
    setQuery("");
    filterTo("all", "all");
    setBenefit("all");
    setFullOnly(false);
  };

  return (
    <div className="st">
      <section className="ph2 st-hero">
        <BenefitBars
          limits={limits}
          lsaUsed={lsaUsed}
          used={used}
          saveLsaUsed={saveLsaUsed}
          saveUsed={saveUsed}
          free={free}
          products={items.length}
          wishlist={wishlist.length}
        />
        <BenefitPots limits={limits} lsaUsed={lsaUsed} />
      </section>

      <ActionCards
        limits={limits}
        lsaLeft={lsaLeft}
        used={used}
        onShop={(c) => {
          filterTo(c as StoreCategory, "all");
          document.getElementById("st-tools")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <div className="st-tools" id="st-tools">
        <div className="st-row">
          <label className="st-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input type="search" placeholder="Search Garmin, shoes, glasses…" value={query} aria-label="Search the store" onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select className="st-select" value={benefit} onChange={(e) => setBenefit(e.target.value as StoreBenefit | "all")} aria-label="Benefit">
            <option value="all">Every benefit</option>
            <option value="lsa">Spending account</option>
            <option value="vision">Vision</option>
            <option value="ortho">Orthopaedic shoes</option>
          </select>
          <select className="st-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button type="button" className="st-toggle" aria-pressed={fullOnly} onClick={() => setFullOnly(!fullOnly)}>
            <i aria-hidden="true" />
            Fully covered
          </button>
        </div>
        <div className="st-chips" role="group" aria-label="Category">
          {[{ id: "all" as const, label: "All" }, ...STORE_CATEGORIES].map((c) => {
            const n = c.id === "all" ? matching.length : matching.filter(({ item }) => item.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={cat === c.id}
                disabled={n === 0 && cat !== c.id}
                onClick={() => {
                  filterTo(c.id, "all");
                }}
              >
                {c.label}
                <span>{n}</span>
              </button>
            );
          })}
        </div>
        {(cat === "shoes" || cat === "tech") && brands.length > 1 && (
          <div className="st-chips st-brands" role="group" aria-label="Brand">
            <button type="button" aria-pressed={brand === "all"} onClick={() => filterTo(cat, "all")}>
              All brands
              <span>{inCat.length}</span>
            </button>
            {brands.map(([b, n]) => (
              <button key={b} type="button" aria-pressed={brand === b} onClick={() => filterTo(cat, brand === b ? "all" : b)}>
                {b}
                <span>{n}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="st-count">
        <span>
          <b>{rows.length}</b> of {items.length} products
          {filtered && (
            <button type="button" className="st-clear" onClick={clear}>
              Clear filters
            </button>
          )}
        </span>
        <Link href="/store/wishlist" className="st-pill">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.5 8.1 3.6 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.6 4.5 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
          </svg>
          Wishlist
          {wishlist.length > 0 && <span>{wishlist.length}</span>}
        </Link>
      </div>

      {error && <p className="ps-msg">{error}</p>}

      {loading ? (
        <div className="st-grid" aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="st-card st-skel" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="st-empty">
          <p>Nothing matches{query && ` “${query}”`}.</p>
          <button type="button" className="st-pill" onClick={clear}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="st-grid">
          {rows.map(({ item, c }) => (
            <ProductCard key={item.id} item={item} claim={c} lsaLeft={lsaLeft} visionLeft={glassesLeft} wished={wishlist.includes(item.id)} onWish={() => toggleWish(item.id)} />
          ))}
        </div>
      )}

      <div className="st-legend">
        <span>
          <i className="v" />
          Vision cover
        </span>
        <span>
          <i className="l" />
          Spending account
        </span>
        <span>
          <i className="y" />
          You pay
        </span>
      </div>

      <Note>
        {`Prices are from each brand's Canadian site on ${STORE_CHECKED}, before tax; claims include Quebec's ${(QC_SALES_TAX * 100).toFixed(3)}% sales tax, since the receipt does. Sales end and prices change, so check the link before buying. Keep the receipt and claim in the Manulife app. Spending account claims are a taxable benefit, so they show up on your T4 and RL-1, and it can be used for your eligible dependants too. Glasses and contacts need a prescription; vision cover pays first, then the spending account pays the rest as a health cost the core plan didn't pay.`}
      </Note>

      <div className="seealso-row">
        <SeeAlso href="/insurance" label="Insurance">
          Your $500 spending account, everything that&apos;s eligible, and your vision limit
        </SeeAlso>
        <SeeAlso href="/benefits" label="Benefits">
          A checklist to use every benefit before it resets
        </SeeAlso>
      </div>
    </div>
  );
}
