"use client";

import { useRef, useState, type FormEvent } from "react";
import { VaultError } from "@/lib/payslips/client";
import { useVault } from "./PayslipVault";

/** Encryption status, lock button and password change. */
export default function VaultBar() {
  const { lock, changePassword, unreadable } = useVault();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const cur = useRef<HTMLInputElement>(null);
  const next = useRef<HTMLInputElement>(null);
  const again = useRef<HTMLInputElement>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const n = next.current?.value ?? "";
    if (n.length < 10) return setMsg("Use at least 10 characters.");
    if (n !== again.current?.value) return setMsg("The new passwords don't match.");
    setBusy(true);
    setMsg("");
    try {
      await changePassword(cur.current?.value ?? "", n);
      setMsg("Password changed.");
      (e.target as HTMLFormElement).reset();
      setOpen(false);
    } catch (err) {
      setMsg(
        err instanceof VaultError
          ? err.kind === "locked"
            ? "Too many wrong tries. Locked for 15 minutes."
            : "The current password is wrong."
          : "Couldn't change it. Try again.",
      );
    }
    setBusy(false);
  }

  return (
    <div className="ps-bar">
      <span className="ps-secure">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        End-to-end encrypted. Decrypted only in this browser; locks after 10 minutes idle.
        {unreadable > 0 && <b className="ps-bad"> {unreadable} payslip(s) couldn&apos;t be decrypted.</b>}
      </span>
      <div className="ps-row">
        <button type="button" className="ps-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          Change password
        </button>
        <button type="button" className="ps-btn" onClick={lock}>
          Lock payslips
        </button>
      </div>
      {msg && !open && (
        <p className="ps-msg ok" role="status">
          {msg}
        </p>
      )}
      {open && (
        <form className="ps-pwform" onSubmit={onSubmit}>
          <input type="text" name="username" value="payslips" autoComplete="username" readOnly hidden />
          <input ref={cur} type="password" className="ps-in" placeholder="Current password" autoComplete="current-password" required />
          <input ref={next} type="password" className="ps-in" placeholder="New password (10+ characters)" autoComplete="new-password" required />
          <input ref={again} type="password" className="ps-in" placeholder="Repeat new password" autoComplete="new-password" required />
          <button type="submit" className="ps-btn primary" disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
          <span className="ps-msg" role="alert">
            {msg}
          </span>
        </form>
      )}
    </div>
  );
}
