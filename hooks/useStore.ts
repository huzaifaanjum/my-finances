"use client";

import { useCallback, useEffect, useState } from "react";
import { api, AuthError, signOut } from "@/lib/api/client";
import { STORE, type StoreItem } from "@/lib/store";

const API = "/api/store";
/** where "already claimed" lived before it moved to your account */
const OLD_KEY = "store_lsa_used";

/** Store products, what you've already claimed (spending account and health limits) and your wishlist, from your account. Falls back to the bundled list if loading fails. */
export function useStore() {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [lsaUsed, setLsaUsed] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  /** already claimed against each tracked health limit, by CLAIM_LIMITS id */
  const [used, setUsed] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<{ items?: StoreItem[]; lsaUsed?: number; used?: Record<string, number>; wishlist?: string[] }>(API)
      .then((d) => {
        if (cancelled) return;
        setItems(d.items ?? []);
        setWishlist(d.wishlist ?? []);
        setUsed(d.used ?? {});
        let used = d.lsaUsed ?? 0;
        // carry over a value saved in this browser before it synced
        try {
          const old = Number(localStorage.getItem(OLD_KEY));
          if (!used && old > 0) {
            used = old;
            api(API, { method: "PUT", body: { lsaUsed: old } }).then(() => localStorage.removeItem(OLD_KEY), () => {});
          }
        } catch {}
        setLsaUsed(used);
      })
      .catch((e) => {
        if (e instanceof AuthError) return signOut(true);
        if (cancelled) return;
        setItems(STORE);
        setError("Could not load the store from your account; showing the built-in list.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const saveLsaUsed = useCallback(async (value: number) => {
    setError("");
    const before = lsaUsed;
    setLsaUsed(value);
    try {
      await api(API, { method: "PUT", body: { lsaUsed: value } });
    } catch (e) {
      if (e instanceof AuthError) return signOut(true);
      setError("Could not save that amount. Check your connection and try again.");
      setLsaUsed(before);
    }
  }, [lsaUsed]);

  const toggleWish = useCallback(
    async (id: string) => {
      setError("");
      const on = !wishlist.includes(id);
      setWishlist((prev) => (on ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)));
      try {
        await api(API, { method: "PUT", body: { wish: { id, on } } });
      } catch (e) {
        if (e instanceof AuthError) return signOut(true);
        setError("Could not update your wishlist. Check your connection and try again.");
        setWishlist((prev) => (on ? prev.filter((x) => x !== id) : [...prev, id]));
      }
    },
    [wishlist],
  );

  const saveUsed = useCallback(
    async (id: string, value: number) => {
      setError("");
      const before = used[id];
      setUsed((prev) => ({ ...prev, [id]: value }));
      try {
        await api(API, { method: "PUT", body: { used: { id, value } } });
      } catch (e) {
        if (e instanceof AuthError) return signOut(true);
        setError("Could not save that amount. Check your connection and try again.");
        setUsed((prev) => ({ ...prev, [id]: before ?? 0 }));
      }
    },
    [used],
  );

  return { items, lsaUsed, used, wishlist, loading, error, saveLsaUsed, saveUsed, toggleWish };
}
