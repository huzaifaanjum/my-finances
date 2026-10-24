"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { VaultError } from "@/lib/payslips/client";
import { useVault } from "./PayslipVault";

const MIN_LENGTH = 10;

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [active]);
  return now;
}

function message(e: unknown): string {
  if (e instanceof VaultError) {
    if (e.kind === "wrong") return e.detail ? `Wrong password. ${e.detail} ${e.detail === 1 ? "try" : "tries"} left before a 15-minute lock.` : "Wrong password.";
    if (e.kind === "locked") return "Too many wrong tries. Payslips are locked for 15 minutes.";
    if (e.kind === "missing") return "No payslip password is set yet.";
  }
  return "Can't reach the server right now. Check your connection and try again.";
}

/** Second password for the payslips tab: create it once, then enter it to decrypt. */
export default function VaultGate() {
  const { status, lockUntil, check, setup, unlock, erase } = useVault();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [forgot, setForgot] = useState(false);
  const pw = useRef<HTMLInputElement>(null);
  const pw2 = useRef<HTMLInputElement>(null);
  const confirmErase = useRef<HTMLInputElement>(null);
  const now = useNow(lockUntil > 0);
  const locked = lockUntil > now;

  useEffect(() => {
    if (status === "idle") void check();
  }, [status, check]);

  if (status === "idle" || status === "checking") {
    return (
      <div className="ps-gate">
        <p className="note">Checking your payslip vault…</p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="ps-gate card">
        <h2>Can&apos;t reach the server</h2>
        <p className="note">Your payslips are stored encrypted on the server. Check your connection and try again.</p>
        <button type="button" className="ps-btn primary" onClick={() => void check()}>
          Try again
        </button>
      </div>
    );
  }

  const creating = status === "setup";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const a = pw.current?.value ?? "";
    if (creating) {
      if (a.length < MIN_LENGTH) return setMsg(`Use at least ${MIN_LENGTH} characters.`);
      if (a !== pw2.current?.value) return setMsg("The two passwords don't match.");
    }
    if (!a) return;
    setBusy(true);
    setMsg("");
    try {
      await (creating ? setup(a) : unlock(a));
    } catch (err) {
      setMsg(message(err));
      if (pw.current) {
        pw.current.value = "";
        pw.current.focus();
      }
    }
    setBusy(false);
  }

  async function onErase(e: FormEvent) {
    e.preventDefault();
    if (confirmErase.current?.value !== "ERASE") return setMsg('Type ERASE in capitals to confirm.');
    setBusy(true);
    try {
      await erase();
      setForgot(false);
      setMsg("");
    } catch (err) {
      setMsg(message(err));
    }
    setBusy(false);
  }

  if (forgot) {
    return (
      <form className="ps-gate card" onSubmit={onErase}>
        <h2>Forgot the payslip password?</h2>
        <p className="note">
          Payslips are encrypted with that password and nobody, including the server, can decrypt them without it. The only way back in is to erase every
          saved payslip and set a new password. Keep the original PDFs so you can upload them again.
        </p>
        <label className="ps-lbl" htmlFor="ps-erase">
          Type ERASE to delete all payslips
        </label>
        <input ref={confirmErase} id="ps-erase" className="ps-in" autoComplete="off" />
        <div className="ps-row">
          <button type="button" className="ps-btn" onClick={() => setForgot(false)}>
            Cancel
          </button>
          <button type="submit" className="ps-btn danger" disabled={busy}>
            {busy ? "Erasing…" : "Erase and start over"}
          </button>
        </div>
        <div className="ps-msg" role="alert">
          {msg}
        </div>
      </form>
    );
  }

  return (
    <form className="ps-gate card" onSubmit={onSubmit} autoComplete="on">
      <div className="ps-lock" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="4" y="10" width="16" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
      <h2>{creating ? "Set a payslip password" : "Payslips are locked"}</h2>
      <p className="note">
        {creating
          ? "Payslips show your pay, tax and address, so they get their own password on top of the app passcode. Everything you upload is encrypted in this browser with it before it is saved, and the server never sees the password. If you forget it, the payslips can't be recovered."
          : "Enter your payslip password. Payslips are decrypted only in this browser and lock again after 10 minutes without activity."}
      </p>
      {/* hidden username so password managers file this separately from the app passcode */}
      <input type="text" name="username" value="payslips" autoComplete="username" readOnly hidden />
      <label className="ps-lbl" htmlFor="ps-pw">
        {creating ? "New payslip password" : "Payslip password"}
      </label>
      <input
        ref={pw}
        id="ps-pw"
        type="password"
        className="ps-in"
        autoComplete={creating ? "new-password" : "current-password"}
        minLength={creating ? MIN_LENGTH : undefined}
        required
        autoFocus
        disabled={locked}
      />
      {creating && (
        <>
          <label className="ps-lbl" htmlFor="ps-pw2">
            Repeat it
          </label>
          <input ref={pw2} id="ps-pw2" type="password" className="ps-in" autoComplete="new-password" required />
        </>
      )}
      <button className="ps-btn primary wide" type="submit" disabled={busy || locked}>
        {busy ? (creating ? "Creating…" : "Decrypting…") : locked ? `Locked for ${Math.ceil((lockUntil - now) / 60_000)} min` : creating ? "Create and unlock" : "Unlock payslips"}
      </button>
      <div className="ps-msg" role="alert">
        {msg}
      </div>
      {!creating && (
        <button type="button" className="ps-link" onClick={() => setForgot(true)}>
          Forgot the password?
        </button>
      )}
    </form>
  );
}
