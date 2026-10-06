"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ROUTES = [
  { href: "/", key: "overview", label: "Overview" },
  { href: "/plan", key: "plan", label: "Plan" },
  { href: "/insights", key: "insights", label: "Insights" },
  { href: "/monthly", key: "monthly", label: "Month by month" },
  { href: "/goals", key: "goals", label: "Goals" },
  { href: "/millionaire", key: "millionaire", label: "Millionaire" },
  { href: "/pension", key: "pension", label: "Pension" },
  { href: "/knowledge", key: "knowledge", label: "Knowledge" },
] as const;

export type RouteKey = (typeof ROUTES)[number]["key"];

export function routeFor(pathname: string): RouteKey {
  const hit = ROUTES.find((r) => r.href !== "/" && (pathname === r.href || pathname.startsWith(r.href + "/")));
  return hit ? hit.key : "overview";
}

function lock() {
  try {
    localStorage.removeItem("planner_pass");
  } catch {
    /* storage blocked */
  }
  window.location.replace("/login");
}

export default function Nav() {
  const path = usePathname() ?? "/";
  const current = routeFor(path);
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-in">
        <Link href="/" className="nav-brand">
          My Finances
        </Link>
        <ul className="nav-links">
          {ROUTES.map((r) => (
            <li key={r.key}>
              <Link href={r.href} aria-current={r.key === current ? "page" : undefined}>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-r">
          {/* filled by the planner's sync code; React leaves it empty */}
          <span id="syncSlot" className="nav-sync" aria-live="polite" />
          <button type="button" className="nav-lock" onClick={lock}>
            Lock
          </button>
        </div>
      </div>
    </nav>
  );
}
