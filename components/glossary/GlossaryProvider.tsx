"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import FloatingTip from "@/components/ui/FloatingTip";
import { GLOSSARY } from "@/lib/glossary";

interface Open {
  term: number;
  anchor: HTMLElement;
}

interface GlossaryApi {
  show: (term: number, anchor: HTMLElement) => void;
  hide: () => void;
}

const GlossaryContext = createContext<GlossaryApi>({ show: () => {}, hide: () => {} });
export const useGlossary = () => useContext(GlossaryContext);

const TIP_ID = "glossary-tip";

/** Renders the one shared explanation box that every underlined term opens. */
export default function GlossaryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Open | null>(null);
  const hide = useCallback(() => setOpen(null), []);
  const show = useCallback((term: number, anchor: HTMLElement) => setOpen({ term, anchor }), []);

  useEffect(() => {
    if (!open) return;
    open.anchor.setAttribute("aria-describedby", TIP_ID);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element && e.target.closest(".gl"))) hide();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", hide, { passive: true });
    window.addEventListener("resize", hide);
    return () => {
      open.anchor.removeAttribute("aria-describedby");
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", hide);
      window.removeEventListener("resize", hide);
    };
  }, [open, hide]);

  const api = useMemo(() => ({ show, hide }), [show, hide]);
  const term = open ? GLOSSARY[open.term] : null;

  return (
    <GlossaryContext.Provider value={api}>
      {children}
      {open && term && (
        <FloatingTip id={TIP_ID} className="tipbox" anchor={open.anchor.getBoundingClientRect()}>
          <b>{term.title}</b>
          <p>
            <span>What it is</span>
            {term.what}
          </p>
          <p>
            <span>How it helps</span>
            {term.why}
          </p>
        </FloatingTip>
      )}
    </GlossaryContext.Provider>
  );
}
