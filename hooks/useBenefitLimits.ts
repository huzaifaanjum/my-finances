"use client";

import { useCallback, useEffect, useState } from "react";
import { api, AuthError, signOut } from "@/lib/api/client";

export type LimitMap = Record<string, number>;

const API = "/api/limits";

/** Claim limits you entered from your benefits booklet, saved to your account. Changes are optimistic and roll back if saving fails. */
export function useBenefitLimits() {
  const [limits, setLimits] = useState<LimitMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<{ limits?: LimitMap }>(API)
      .then((d) => !cancelled && setLimits(d.limits ?? {}))
      .catch((e) => {
        if (e instanceof AuthError) return signOut(true);
        if (!cancelled) setError("Could not load your saved limits.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (id: string, value: number | null) => {
    setError("");
    let before: number | undefined;
    setLimits((prev) => {
      before = prev[id];
      const next = { ...prev };
      if (value === null) delete next[id];
      else next[id] = value;
      return next;
    });
    try {
      await api(API, { method: "PUT", body: { id, value } });
    } catch (e) {
      if (e instanceof AuthError) return signOut(true);
      setError("Could not save that limit. Check your connection and try again.");
      setLimits((prev) => {
        const next = { ...prev };
        if (before === undefined) delete next[id];
        else next[id] = before;
        return next;
      });
    }
  }, []);

  return { limits, loading, error, save };
}
