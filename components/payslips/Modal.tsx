"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** A native modal dialog: traps focus, closes on Escape and on a click outside the box. */
export default function Modal({ title, onClose, wide, children, actions }: { title: ReactNode; onClose: () => void; wide?: boolean; children: ReactNode; actions?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    const onCancel = (e: Event) => {
      e.preventDefault();
      close.current();
    };
    d.addEventListener("cancel", onCancel);
    document.body.style.overflow = "hidden";
    return () => {
      d.removeEventListener("cancel", onCancel);
      document.body.style.overflow = "";
      if (d.open) d.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={`ps-modal${wide ? " wide" : ""}`}
      onMouseDown={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="ps-modal-in">
        <header className="ps-modal-h">
          <h2>{title}</h2>
          <div className="ps-row">
            {actions}
            <button type="button" className="ps-btn sm" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </header>
        <div className="ps-modal-b">{children}</div>
      </div>
    </dialog>
  );
}
