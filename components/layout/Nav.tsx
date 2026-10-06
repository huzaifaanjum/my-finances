"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/api/client";
import { activeRoute, ROUTES } from "@/lib/routes";
import SyncStatus from "./SyncStatus";

export default function Nav() {
  const current = activeRoute(usePathname() ?? "/");
  return (
    <nav className="nav" aria-label="Main">
      <div className="nav-in">
        <Link href="/" className="nav-brand">
          My Finances
        </Link>
        <ul className="nav-links">
          {ROUTES.map((r) => (
            <li key={r.href}>
              <Link href={r.href} aria-current={r.href === current ? "page" : undefined}>
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-r">
          <SyncStatus />
          <button type="button" className="nav-lock" onClick={() => signOut()}>
            Lock
          </button>
        </div>
      </div>
    </nav>
  );
}
