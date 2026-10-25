"use client";

import { useEffect } from "react";

/** Touch gestures for phones: swipe left or right on a page's content to move between its sub-tabs. Mouse and pen are ignored. */
export default function MobileGestures() {
  useEffect(() => {
    let start: { x: number; y: number; t: number; target: Element } | null = null;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return (start = null);
      const t = e.touches[0];
      // leave the screen edges to the browser's own back and forward swipes
      if (t.clientX < 24 || t.clientX > innerWidth - 24) return (start = null);
      start = { x: t.clientX, y: t.clientY, t: Date.now(), target: e.target as Element };
    };

    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const target = start.target;
      const quick = Date.now() - start.t < 600;
      start = null;
      if (!quick || Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      if (blocked(target)) return;
      const found = tabsFor(target);
      if (!found) return;
      const tabs = [...found.list.querySelectorAll<HTMLElement>("[role=tab]")];
      const at = tabs.findIndex((b) => b.getAttribute("aria-selected") === "true");
      const next = tabs[at + (dx < 0 ? 1 : -1)];
      if (at < 0 || !next) return;
      next.click();
      next.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
      navigator.vibrate?.(8);
      const panel = found.panel;
      panel.classList.remove("swipe-l", "swipe-r");
      void panel.offsetWidth; // restart the animation
      panel.classList.add(dx < 0 ? "swipe-l" : "swipe-r");
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);
  return null;
}

/** Places where a sideways drag already means something: inputs, sliders, charts, sheets and anything that scrolls sideways. */
function blocked(el: Element): boolean {
  if (el.closest("input,select,textarea,svg,[role=tablist],.bsheet,.bnav,.nav,[data-no-swipe]")) return true;
  for (let p: Element | null = el; p && p !== document.body; p = p.parentElement) {
    const o = getComputedStyle(p).overflowX;
    if ((o === "auto" || o === "scroll") && p.scrollWidth > p.clientWidth + 1) return true;
  }
  return false;
}

/** The innermost sub-tab bar that sits above the touched content, and the block under it to animate. */
function tabsFor(el: Element): { list: Element; panel: HTMLElement } | null {
  for (let child: Element | null = el, p = el.parentElement; p && p !== document.body; child = p, p = p.parentElement) {
    const kids = [...p.children];
    const i = kids.indexOf(child as Element);
    const list = kids.slice(0, i).reverse().find((k) => k.matches(".ps-tabs[role=tablist]") && k.querySelector("[role=tab]"));
    if (list) {
      return { list, panel: child as HTMLElement };
    }
  }
  return null;
}
