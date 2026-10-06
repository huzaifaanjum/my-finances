"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, AuthError, getPasscode, signOut } from "@/lib/api/client";
import { fromSaved, toSaved } from "@/lib/planner/serialize";
import type { PlannerState } from "@/lib/planner/types";

const API = "/api/state";
const SAVE_DELAY = 800;
const RETRY_DELAY = 15000;
const POLL_EVERY = 45000;
/** Show the page even if the server never answers. */
const READY_FALLBACK = 8000;

export interface SyncStatus {
  text: string;
  tone: "idle" | "busy" | "ok" | "error";
}

interface Options {
  state: PlannerState;
  /** bumps on every user edit; remote updates do not bump it */
  revision: number;
  applyRemote: (next: PlannerState) => void;
}

/**
 * Keeps the planner in sync with MongoDB through /api/state: loads on start, saves a moment after each edit,
 * and re-checks when the tab regains focus or every 45 seconds, so every device shows the same numbers.
 */
export function useCloudSync({ state, revision, applyRemote }: Options): { status: SyncStatus; ready: boolean } {
  const [status, setStatus] = useState<SyncStatus>({ text: "starting", tone: "idle" });
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  const sync = useRef({ loaded: false, lastAt: 0, saving: false, dirty: false, timer: undefined as ReturnType<typeof setTimeout> | undefined });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const push = useCallback(async function push(): Promise<void> {
    const s = sync.current;
    clearTimeout(s.timer);
    if (s.saving) {
      s.timer = setTimeout(push, 500);
      return;
    }
    s.saving = true;
    try {
      const res = await api<{ updatedAt: number }>(API, { method: "PUT", body: { state: toSaved(stateRef.current) } });
      s.lastAt = res.updatedAt;
      s.dirty = false;
      setStatus({ text: "saved", tone: "ok" });
    } catch (e) {
      if (e instanceof AuthError) return signOut(true);
      setStatus({ text: "offline, will retry", tone: "error" });
      s.timer = setTimeout(push, RETRY_DELAY);
    } finally {
      s.saving = false;
    }
  }, []);

  const pull = useCallback(async () => {
    const s = sync.current;
    try {
      const res = await api<{ state: unknown; updatedAt: number }>(API);
      if (res.state && res.updatedAt > s.lastAt && !s.dirty) {
        applyRemote(fromSaved(res.state, stateRef.current));
        s.lastAt = res.updatedAt;
      }
      if (!s.loaded) {
        s.loaded = true;
        if (!res.state) {
          s.dirty = true;
          void push();
        }
      }
      if (!s.dirty) setStatus({ text: "synced", tone: "ok" });
    } catch (e) {
      if (e instanceof AuthError) return signOut(true);
      setStatus({ text: "offline", tone: "error" });
    }
    setReady(true);
  }, [applyRemote, push]);

  useEffect(() => {
    if (!getPasscode()) return signOut();
    const s = sync.current;
    const fallback = setTimeout(() => setReady(true), READY_FALLBACK);
    void pull();
    const onVisible = () => {
      if (document.visibilityState === "visible") void pull();
    };
    const poll = setInterval(() => {
      if (document.visibilityState === "visible" && !s.dirty && !s.saving) void pull();
    }, POLL_EVERY);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(fallback);
      clearInterval(poll);
      clearTimeout(s.timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pull]);

  useEffect(() => {
    const s = sync.current;
    if (revision === 0 || !s.loaded) return;
    s.dirty = true;
    setStatus({ text: "saving…", tone: "busy" });
    clearTimeout(s.timer);
    s.timer = setTimeout(() => void push(), SAVE_DELAY);
  }, [revision, push]);

  return { status, ready };
}
