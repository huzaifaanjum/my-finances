"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/api/client";
import { activeRoute, isGroup, NAV, type NavGroup, type NavPage } from "@/lib/routes";
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

/** Phone tabs: Home goes straight to the Overview; the others open their pages in a sheet. Action plan sits with Goals. */
interface Tab {
  key: string;
  label: string;
  href?: string;
  pages?: NavPage[];
  /** stroke paths on a 24px grid */
  icon: string[];
}
const groupPages = (label: string) => NAV.filter(isGroup).find((g) => g.label === label)?.pages ?? [];
const plan = NAV.find((i): i is NavPage => !isGroup(i) && i.href === "/recommendations");
const TABS: Tab[] = [
  { key: "home", label: "Home", href: "/", icon: ["M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"] },
  { key: "money", label: "Money", pages: groupPages("Money"), icon: ["M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1", "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"] },
  { key: "goals", label: "Goals", pages: [...groupPages("Goals"), ...(plan ? [plan] : [])], icon: ["M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z", "M12 6a6 6 0 1 0 0 12 6 6 0 1 0 0-12z", "M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4z"] },
  { key: "work", label: "Work", pages: groupPages("Work"), icon: ["M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", "M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"] },
  { key: "learn", label: "Learn", pages: groupPages("Learn"), icon: ["M12 7v14", "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"] },
];

const TabIcon = ({ d }: { d: string[] }) => (
  <span className="bnav-i">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  </span>
);

export default function Nav() {
  const pathname = usePathname() ?? "/";
  const current = activeRoute(pathname);
  const [open, setOpen] = useState<string | null>(null);
  const [sheet, setSheet] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  // close menus on navigation, outside clicks and Escape
  useEffect(() => {
    setOpen(null);
    setSheet(null);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  useEffect(() => {
    if (!open && !sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setSheet(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, sheet]);

  const activeTab = TABS.find((t) => t.href === current || t.pages?.some((p) => p.href === current))?.key;
  const openTab = TABS.find((t) => t.key === sheet);

  return (
    <>
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
      </nav>

      {openTab?.pages && (
        <>
          <div className="bsheet-scrim" aria-hidden="true" onClick={() => setSheet(null)} />
          <div className="bsheet" id="bsheet" role="dialog" aria-label={openTab.label}>
            <h2>{openTab.label}</h2>
            {openTab.pages.map((p) => (
              <Link key={p.href} href={p.href} aria-current={p.href === current ? "page" : undefined} onClick={() => setSheet(null)}>
                <b>{p.label}</b>
                <span>{p.note}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <nav className="bnav" aria-label="Sections">
        {TABS.map((t) => {
          const on = sheet ? sheet === t.key : activeTab === t.key;
          return t.href ? (
            <Link key={t.key} href={t.href} className={on ? "on" : undefined} aria-current={t.href === current ? "page" : undefined} onClick={() => setSheet(null)}>
              <TabIcon d={t.icon} />
              {t.label}
            </Link>
          ) : (
            <button
              key={t.key}
              type="button"
              className={on ? "on" : undefined}
              aria-expanded={sheet === t.key}
              aria-controls="bsheet"
              onClick={() => setSheet((v) => (v === t.key ? null : t.key))}
            >
              <TabIcon d={t.icon} />
              {t.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
