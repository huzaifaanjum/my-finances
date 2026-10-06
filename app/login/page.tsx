"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./login.module.css";

const KEY = "planner_pass";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const pin = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Sign in · My Finances";
    try {
      if (localStorage.getItem(KEY)) {
        window.location.replace("/");
        return;
      }
    } catch {
      /* storage blocked */
    }
    if (/[?&]e=1/.test(window.location.search)) {
      setMsg("That passcode didn't work. Try again.");
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = pin.current?.value.trim() ?? "";
    if (!v) return;
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/state", { cache: "no-store", headers: { "x-passcode": v } });
      if (r.status === 401) {
        setMsg("That passcode didn't work. Try again.");
        if (pin.current) {
          pin.current.value = "";
          pin.current.focus();
        }
      } else if (!r.ok) {
        setMsg("Can't reach the server right now. Try again in a moment.");
      } else {
        try {
          localStorage.setItem(KEY, v);
        } catch {
          setMsg("Your browser is blocking storage, so the passcode can't be remembered. Allow site data and try again.");
          setBusy(false);
          return;
        }
        window.location.replace("/");
        return;
      }
    } catch {
      setMsg("Can't reach the server. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={onSubmit} autoComplete="on">
        <div className={styles.eyebrow}>Personal finance · Montréal</div>
        <h1 className={styles.title}>My Finances</h1>
        <p className={styles.lead}>
          Enter your passcode to load your numbers. You only need to do this once on each device.
        </p>
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
