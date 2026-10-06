"use client";

import { useCallback, useEffect, useState } from "react";
import { api, AuthError, signOut } from "@/lib/api/client";

export type ReadMap = Record<string, number>;

const API = "/api/knowledge";
const CACHE_KEY = "kn_read";

function cache(read: ReadMap): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(read));
  } catch {
    /* storage blocked */
  }
}

function cached(): ReadMap | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ReadMap) : null;
  } catch {
    return null;
  }
}

const withRead = (map: ReadMap, id: string, read: boolean): ReadMap => {
  const next = { ...map };
  if (read) next[id] = Date.now();
  else delete next[id];
  return next;
};

/**
 * Which knowledge rules are ticked off. Shows the copy cached on this device straight away,
 * then the saved copy from the server. Toggles are optimistic and roll back if saving fails.
 */
export function useKnowledgeProgress() {
  const [read, setRead] = useState<ReadMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const local = cached();
    if (local) setRead(local);
    api<{ read?: ReadMap }>(API)
      .then((data) => {
        if (cancelled) return;
        setRead(data.read ?? {});
        cache(data.read ?? {});
      })
      .catch((e) => {
        if (e instanceof AuthError) return signOut(true);
        if (!cancelled) setError("Could not load your saved progress. Showing the last copy on this device.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(async (id: string, value: boolean) => {
    setError("");
    setRead((prev) => {
      const next = withRead(prev, id, value);
      cache(next);
      return next;
    });
    try {
      await api(API, { method: "PUT", body: { id, read: value } });
    } catch (e) {
      if (e instanceof AuthError) return signOut(true);
      setError("Could not save that change. Check your connection and try again.");
      setRead((prev) => withRead(prev, id, !value));
    }
  }, []);

  return { read, loading, error, toggle };
}
