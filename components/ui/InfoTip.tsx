"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import FloatingTip from "./FloatingTip";

interface Props {
  text: ReactNode;
  /** shows a labelled pill instead of the bare "i" */
  label?: string;
  /** a wider box for longer notes */
  wide?: boolean;
}

/** Small "i" button that explains a stat card. Hover, focus or tap to open. */
export default function InfoTip({ text, label, wide }: Props) {
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const openedAt = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);

  const show = () => {
    if (!btn.current) return;
    openedAt.current = Date.now();
    setAnchor(btn.current.getBoundingClientRect());
  };
  const hide = () => setAnchor(null);

  useEffect(() => {
    if (!anchor) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide();
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Node && !btn.current?.contains(e.target)) hide();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", hide);
    };
  }, [anchor]);

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={label ? "ktip pill" : "ktip"}
        aria-label={label ?? "What this means"}
        aria-describedby={anchor ? "kpi-tip" : undefined}
        onPointerEnter={(e) => e.pointerType === "mouse" && show()}
        onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.preventDefault();
          // a tap right after focus opened it should not close it again
          if (anchor && Date.now() - openedAt.current > 400) hide();
          else show();
        }}
      >
        {label ? (
          <>
            <i>i</i>
            {label}
          </>
        ) : (
          "i"
        )}
      </button>
      {anchor && (
        <FloatingTip id="kpi-tip" className={`mtip txt${wide ? " wide" : ""}`} anchor={anchor}>
          {text}
        </FloatingTip>
      )}
    </>
  );
}
