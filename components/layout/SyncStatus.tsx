"use client";

import { usePlanner } from "@/components/providers/PlannerProvider";

const TONE_COLOR = { idle: undefined, busy: "var(--promo)", ok: "var(--std)", error: "var(--neg)" } as const;

export default function SyncStatus() {
  const { sync } = usePlanner();
  return (
    <span className="nav-sync" aria-live="polite">
      Sync <b style={{ color: TONE_COLOR[sync.tone] }}>{sync.text}</b>
    </span>
  );
}
