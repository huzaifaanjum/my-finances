"use client";

import { useEffect } from "react";

/** Registers /sw.js in production. Skipped in dev so cached chunks never fight hot reload. */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
