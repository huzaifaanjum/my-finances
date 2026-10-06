"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, AuthError, getPasscode, savePasscode } from "@/lib/api/client";
import styles from "./login.module.css";

const WRONG = "That passcode didn't work. Try again.";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const pin = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (getPasscode()) {
      window.location.replace("/");
      return;
    }
    if (new URLSearchParams(window.location.search).get("e") === "1") setMsg(WRONG);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const passcode = pin.current?.value.trim() ?? "";
    if (!passcode) return;
    setBusy(true);
    setMsg("");
    try {
      await api("/api/state", { passcode });
      if (!savePasscode(passcode)) {
        setMsg("Your browser is blocking storage, so the passcode can't be remembered. Allow site data and try again.");
        setBusy(false);
        return;
      }
      window.location.replace("/");
      return;
    } catch (err) {
      if (err instanceof AuthError) {
        setMsg(WRONG);
        if (pin.current) {
          pin.current.value = "";
          pin.current.focus();
        }
      } else {
        setMsg("Can't reach the server right now. Check your connection and try again.");
      }
    }
    setBusy(false);
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={onSubmit} autoComplete="on">
        <div className={styles.eyebrow}>Personal finance · Montréal</div>
        <h1 className={styles.title}>My Finances</h1>
        <p className={styles.lead}>Enter your passcode to load your numbers. You only need to do this once on each device.</p>
        <label className={styles.label} htmlFor="pin">
          Passcode
        </label>
        <input
          ref={pin}
          id="pin"
          name="password"
          type="password"
          className={styles.input}
          autoComplete="current-password"
          required
          autoFocus
        />
        <button className={styles.btn} type="submit" disabled={busy}>
          {busy ? "Checking…" : "Unlock"}
        </button>
        <div className={styles.msg} role="alert">
          {msg}
        </div>
      </form>
    </div>
  );
}
