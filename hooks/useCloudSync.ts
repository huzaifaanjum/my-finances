"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, AuthError, getPasscode, signOut } from "@/lib/api/client";
import { fromSaved, toSaved } from "@/lib/planner/serialize";
import type { PlannerState } from "@/lib/planner/types";

const API = "/api/state";
const SAVE_DELAY = 800;
/** A change made right before the tab closed, kept in this browser until the cloud has it. */
const PENDING_KEY = "plan_pending";

function readPending(): { at: number; state: unknown } | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function clearPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {}
}
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
      clearPending();
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
        // a change from just before the last close that the cloud doesn't have yet
        const pending = readPending();
        if (pending && pending.at > (res.updatedAt || 0)) {
          applyRemote(fromSaved(pending.state, stateRef.current));
          s.dirty = true;
          void push();
        } else {
          if (pending) clearPending();
          if (!res.state) {
            s.dirty = true;
            void push();
          }
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
    // a change made just before closing or reloading would wait out the save delay and be lost; send it now
    const flush = () => {
      if (!s.dirty || !s.loaded) return;
      clearTimeout(s.timer);
      const passcode = getPasscode();
      if (!passcode) return;
      const saved = toSaved(stateRef.current);
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify({ at: Date.now(), state: saved }));
      } catch {}
      void fetch(API, {
        method: "PUT",
        keepalive: true,
        headers: { "content-type": "application/json", "x-passcode": passcode },
        body: JSON.stringify({ state: saved }),
      }).catch(() => {});
      s.dirty = false;
    };
    const onHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisible);
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", flush);
    return () => {
      clearTimeout(fallback);
      clearInterval(poll);
      clearTimeout(s.timer);
      document.removeEventListener("visibilitychange", onVisible);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", flush);
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
