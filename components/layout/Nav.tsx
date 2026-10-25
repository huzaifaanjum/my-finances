"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/api/client";
import { activeRoute, isGroup, NAV, type NavGroup } from "@/lib/routes";
import SyncStatus from "./SyncStatus";

/** A top-level group that opens a menu of its pages. */
function GroupMenu({ group, current, open, onToggle, onClose }: { group: NavGroup; current: string; open: boolean; onToggle: () => void; onClose: () => void }) {
  const active = group.pages.some((p) => p.href === current);
  const here = group.pages.find((p) => p.href === current);
  return (
    <li className={`nav-g${open ? " open" : ""}`}>
      <button type="button" className={`nav-t${active ? " on" : ""}`} aria-expanded={open} aria-haspopup="true" onClick={onToggle}>
        {group.label}
        {here && <span className="nav-here">{here.label}</span>}
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div className="nav-menu" role="menu">
          {group.pages.map((p) => (
            <Link key={p.href} href={p.href} role="menuitem" aria-current={p.href === current ? "page" : undefined} onClick={onClose}>
              <b>{p.label}</b>
              <span>{p.note}</span>
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}

export default function Nav() {
  const pathname = usePathname() ?? "/";
  const current = activeRoute(pathname);
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // close menus on navigation, outside clicks and Escape
  useEffect(() => {
    setOpen(null);
    setSheet(false);
  }, [pathname]);
  useEffect(() => {
    if (!open && !sheet) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
        setSheet(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setSheet(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, sheet]);

  const currentLabel = NAV.flatMap((i) => (isGroup(i) ? i.pages : [i])).find((p) => p.href === current)?.label ?? "Menu";

  return (
    <nav className="nav" aria-label="Main" ref={ref}>
      <div className="nav-in">
        <Link href="/" className="nav-brand">
          My Finances
        </Link>
        <ul className="nav-links">
          {NAV.map((item) =>
            isGroup(item) ? (
              <GroupMenu
                key={item.label}
                group={item}
                current={current}
                open={open === item.label}
                onToggle={() => setOpen((o) => (o === item.label ? null : item.label))}
                onClose={() => setOpen(null)}
              />
            ) : (
              <li key={item.href}>
                <Link href={item.href} className={`nav-t${item.href === current ? " on" : ""}`} aria-current={item.href === current ? "page" : undefined}>
                  {item.label}
                </Link>
              </li>
            ),
          )}
        </ul>
        <button type="button" className="nav-burger" aria-expanded={sheet} onClick={() => setSheet((v) => !v)}>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d={sheet ? "M4 4l8 8M12 4l-8 8" : "M2.5 4.5h11M2.5 8h11M2.5 11.5h11"} />
          </svg>
          {currentLabel}
        </button>
        <div className="nav-r">
          <SyncStatus />
          <button type="button" className="nav-lock" onClick={() => signOut()} title="Lock the app; you'll need your passcode to come back">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
              <path d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7" />
            </svg>
            <span>Lock</span>
          </button>
        </div>
      </div>
      {sheet && (
        <div className="nav-sheet">
          {NAV.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="nav-sg">
                <h3>{item.label}</h3>
                {item.pages.map((p) => (
                  <Link key={p.href} href={p.href} aria-current={p.href === current ? "page" : undefined}>
                    <b>{p.label}</b>
                    <span>{p.note}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div key={item.href} className="nav-sg">
                <Link href={item.href} aria-current={item.href === current ? "page" : undefined}>
                  <b>{item.label}</b>
                  <span>{item.note}</span>
                </Link>
              </div>
            ),
          )}
        </div>
      )}
    </nav>
  );
}
