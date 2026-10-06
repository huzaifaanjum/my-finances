"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ROUTES = [
  { href: "/", key: "overview", label: "Overview" },
  { href: "/plan", key: "plan", label: "Plan" },
  { href: "/insights", key: "insights", label: "Insights" },
  { href: "/monthly", key: "monthly", label: "Month by month" },
  { href: "/goals", key: "goals", label: "Goals" },
  { href: "/knowledge", key: "knowledge", label: "Knowledge" },
] as const;

export type RouteKey = (typeof ROUTES)[number]["key"];

export function routeFor(pathname: string): RouteKey {
  const hit = ROUTES.find((r) => r.href !== "/" && (pathname === r.href || pathname.startsWith(r.href + "/")));
  return hit ? hit.key : "overview";
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
      </div>
    </nav>
  );
}
