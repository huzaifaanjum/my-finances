"use client";

import { usePlanner } from "@/components/providers/PlannerProvider";

/** Short words for the header; the full status stays in the tooltip. */
const LABEL: Record<string, string> = { synced: "Saved", saved: "Saved", "saving…": "Saving…", starting: "Connecting", offline: "Offline", "offline, will retry": "Offline" };

/** Cloud save status as a small pill: a dot for the state, a word for what it means. */
export default function SyncStatus() {
  const { sync } = usePlanner();
  const label = LABEL[sync.text] ?? sync.text;
  const tip =
    sync.tone === "ok"
      ? "Your plan is saved to the cloud"
      : sync.tone === "busy"
        ? "Saving your latest change"
        : sync.tone === "error"
          ? "Can't reach the cloud; changes stay here and save when you're back online"
          : "Connecting to the cloud";
  return (
    <span className={`nav-sync ${sync.tone}`} role="status" aria-live="polite" title={tip}>
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4.5 12.5h7a2.75 2.75 0 0 0 .4-5.47A4 4 0 0 0 4.2 6.2 3.15 3.15 0 0 0 4.5 12.5Z" />
      </svg>
      <i aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
