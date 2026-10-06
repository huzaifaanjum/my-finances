"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
  /** centre the tip under (or above) this box */
  anchor?: DOMRect;
  /** follow the pointer at this viewport position */
  point?: { x: number; y: number };
}

const EDGE = 8;

/** A tooltip fixed to the viewport, kept on screen. Rendered into <body> so no container clips it. */
export default function FloatingTip({ children, className = "mtip", id, anchor, point }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tw = el.offsetWidth;
    const th = el.offsetHeight;
    const maxX = window.innerWidth - tw - EDGE;
    let x = 0;
    let y = 0;
    if (anchor) {
      x = anchor.left + anchor.width / 2 - tw / 2;
      y = anchor.bottom + EDGE;
      if (y + th > window.innerHeight - EDGE) y = Math.max(EDGE, anchor.top - th - EDGE);
    } else if (point) {
      x = point.x + 14;
      y = point.y + th + 14 > window.innerHeight ? point.y - th - 14 : point.y + 14;
    }
    el.style.left = `${Math.min(Math.max(EDGE, x), maxX)}px`;
    el.style.top = `${y}px`;
  });

  return createPortal(
    <div ref={ref} id={id} role="tooltip" className={className}>
      {children}
    </div>,
    document.body,
  );
}
