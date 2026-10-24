"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AuthError, signOut } from "@/lib/api/client";
import { byPeriod } from "@/lib/payslips/analysis";
import { vaultApi, VaultError, type SealedPayslip, type VaultInfo } from "@/lib/payslips/client";
import {
  deriveKeys,
  ITERATIONS,
  newWrappedKey,
  openFile,
  openJson,
  randomBytes,
  randomId,
  rewrapKey,
  sealFile,
  sealJson,
  b64,
  unb64,
  unwrapKey,
} from "@/lib/payslips/crypto";
import type { FileMeta, Payslip, PayslipData } from "@/lib/payslips/types";

/** Locks itself after this long without a click, key press or scroll. */
const IDLE_MS = 10 * 60_000;
export const MAX_FILE_BYTES = 3 * 1024 * 1024;

export type VaultStatus = "idle" | "checking" | "setup" | "locked" | "unlocked" | "error";

/** What is encrypted for each payslip. */
interface Payload {
  data: PayslipData;
  file: FileMeta | null;
  excluded: boolean;
}

export interface PayslipPatch {
  data?: PayslipData;
  excluded?: boolean;
  /** a new PDF, null to remove it, or leave out to keep it */
  file?: File | null;
}

interface VaultContext {
  status: VaultStatus;
  /** set while a lock from too many wrong passwords is in force */
  lockUntil: number;
  payslips: Payslip[];
  /** payslips that could not be decrypted (damaged) */
  unreadable: number;
  check: () => Promise<void>;
  setup: (password: string) => Promise<void>;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  changePassword: (current: string, next: string) => Promise<void>;
  erase: () => Promise<void>;
  add: (data: PayslipData, file: File | null) => Promise<Payslip>;
  update: (id: string, patch: PayslipPatch) => Promise<void>;
  remove: (id: string) => Promise<void>;
  fileBytes: (id: string) => Promise<Uint8Array>;
}

const Ctx = createContext<VaultContext | null>(null);

const fileBytesOf = async (f: File) => new Uint8Array(await f.arrayBuffer());
const metaOf = (f: File): FileMeta => ({ name: f.name, size: f.size, type: f.type || "application/pdf" });

/** Rethrows after sending you to the sign-in page if the app passcode stopped working. */
function authCheck(e: unknown): never {
  if (e instanceof AuthError) signOut(true);
  throw e;
}

export function PayslipVaultProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<VaultStatus>("idle");
  const [lockUntil, setLockUntil] = useState(0);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [unreadable, setUnreadable] = useState(0);
  // secrets live only in memory and are dropped on lock or reload
  const dek = useRef<CryptoKey | null>(null);
  const auth = useRef("");
  const files = useRef(new Map<string, Uint8Array>());
  const lastActive = useRef(Date.now());

  const lock = useCallback(() => {
    dek.current = null;
    auth.current = "";
    files.current.clear();
    setPayslips([]);
    setUnreadable(0);
    setStatus((s) => (s === "unlocked" ? "locked" : s));
  }, []);

  const check = useCallback(async () => {
    setStatus("checking");
    try {
      const info = await vaultApi<VaultInfo>("/api/payslips/vault");
      setLockUntil(info.lockUntil ?? 0);
      setStatus(info.exists ? "locked" : "setup");
    } catch (e) {
      if (e instanceof AuthError) return signOut(true);
      setStatus("error");
    }
  }, []);

  const load = useCallback(async (key: CryptoKey, token: string, items: SealedPayslip[]) => {
    const out: Payslip[] = [];
    let bad = 0;
    for (const it of items) {
      try {
        const p = await openJson<Payload>(key, it.id, it.data);
        out.push({ id: it.id, data: p.data, file: p.file, excluded: !!p.excluded, createdAt: it.createdAt, updatedAt: it.updatedAt });
      } catch {
        bad++;
      }
    }
    dek.current = key;
    auth.current = token;
    lastActive.current = Date.now();
    setPayslips(out.sort(byPeriod));
    setUnreadable(bad);
    setLockUntil(0);
    setStatus("unlocked");
  }, []);

  const unlock = useCallback(
    async (password: string) => {
      try {
        const info = await vaultApi<VaultInfo>("/api/payslips/vault");
        if (!info.exists || !info.salt || !info.iterations) {
          setStatus("setup");
          throw new VaultError("missing");
        }
        const keys = await deriveKeys(password, unb64(info.salt), info.iterations);
        const res = await vaultApi<{ wrapped: string; items: SealedPayslip[] }>("/api/payslips", { auth: keys.auth });
        await load(await unwrapKey(keys.kek, res.wrapped), keys.auth, res.items);
      } catch (e) {
        if (e instanceof VaultError && e.kind === "locked") setLockUntil(e.detail);
        authCheck(e);
      }
    },
    [load],
  );

  const setup = useCallback(
    async (password: string) => {
      try {
        const salt = randomBytes(16);
        const keys = await deriveKeys(password, salt, ITERATIONS);
        const wrapped = await newWrappedKey(keys.kek);
        await vaultApi("/api/payslips/vault", { method: "POST", body: { salt: b64(salt), iterations: ITERATIONS, wrapped, auth: keys.auth } });
        await load(await unwrapKey(keys.kek, wrapped), keys.auth, []);
      } catch (e) {
        authCheck(e);
      }
    },
    [load],
  );

  const changePassword = useCallback(async (current: string, next: string) => {
    try {
      const info = await vaultApi<VaultInfo>("/api/payslips/vault");
      const old = await deriveKeys(current, unb64(info.salt ?? ""), info.iterations ?? ITERATIONS);
      if (old.auth !== auth.current) throw new VaultError("wrong");
      const { wrapped } = await vaultApi<{ wrapped: string }>("/api/payslips", { auth: old.auth });
      const salt = randomBytes(16);
      const fresh = await deriveKeys(next, salt, ITERATIONS);
      const rewrapped = await rewrapKey(old.kek, fresh.kek, wrapped);
      await vaultApi("/api/payslips/vault", {
        method: "PUT",
        auth: old.auth,
        body: { salt: b64(salt), iterations: ITERATIONS, wrapped: rewrapped, auth: fresh.auth },
      });
      auth.current = fresh.auth;
    } catch (e) {
      authCheck(e);
    }
  }, []);

  const erase = useCallback(async () => {
    try {
      await vaultApi("/api/payslips/vault", { method: "DELETE", body: { confirm: "ERASE" } });
      lock();
      setStatus("setup");
    } catch (e) {
      authCheck(e);
    }
  }, [lock]);

  const need = () => {
    if (!dek.current) throw new VaultError("wrong");
    lastActive.current = Date.now();
    return { key: dek.current, token: auth.current };
  };

  const add = useCallback(async (data: PayslipData, file: File | null) => {
    try {
      const { key, token } = need();
      const id = randomId();
      const payload: Payload = { data, file: file ? metaOf(file) : null, excluded: false };
      const bytes = file ? await fileBytesOf(file) : null;
      const body = { id, data: await sealJson(key, id, payload), ...(bytes ? { file: await sealFile(key, id, bytes) } : {}) };
      const res = await vaultApi<{ createdAt: number }>("/api/payslips", { method: "POST", auth: token, body });
      if (bytes) files.current.set(id, bytes);
      const slip: Payslip = { id, ...payload, createdAt: res.createdAt, updatedAt: res.createdAt };
      setPayslips((ps) => [...ps, slip].sort(byPeriod));
      return slip;
    } catch (e) {
      return authCheck(e);
    }
  }, []);

  const update = useCallback(
    async (id: string, patch: PayslipPatch) => {
      try {
        const { key, token } = need();
        const cur = payslips.find((p) => p.id === id);
        if (!cur) throw new Error("not found");
        const payload: Payload = {
          data: patch.data ?? cur.data,
          excluded: patch.excluded ?? cur.excluded,
          file: patch.file === undefined ? cur.file : patch.file ? metaOf(patch.file) : null,
        };
        const bytes = patch.file ? await fileBytesOf(patch.file) : null;
        const body: Record<string, unknown> = { data: await sealJson(key, id, payload) };
        if (patch.file === null) body.file = null;
        else if (bytes) body.file = await sealFile(key, id, bytes);
        const res = await vaultApi<{ updatedAt: number }>(`/api/payslips/${id}`, { method: "PUT", auth: token, body });
        if (bytes) files.current.set(id, bytes);
        if (patch.file === null) files.current.delete(id);
        setPayslips((ps) => ps.map((p) => (p.id === id ? { ...p, ...payload, updatedAt: res.updatedAt } : p)).sort(byPeriod));
      } catch (e) {
        authCheck(e);
      }
    },
    [payslips],
  );

  const remove = useCallback(async (id: string) => {
    try {
      const { token } = need();
      await vaultApi(`/api/payslips/${id}`, { method: "DELETE", auth: token });
      files.current.delete(id);
      setPayslips((ps) => ps.filter((p) => p.id !== id));
    } catch (e) {
      authCheck(e);
    }
  }, []);

  const fileBytes = useCallback(async (id: string) => {
    const hit = files.current.get(id);
    if (hit) return hit;
    try {
      const { key, token } = need();
      const { file } = await vaultApi<{ file: string }>(`/api/payslips/${id}/file`, { auth: token });
      const bytes = await openFile(key, id, file);
      files.current.set(id, bytes);
      return bytes;
    } catch (e) {
      return authCheck(e);
    }
  }, []);

  // lock after a while without activity
  useEffect(() => {
    if (status !== "unlocked") return;
    const touch = () => (lastActive.current = Date.now());
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() - lastActive.current > IDLE_MS) lock();
    }, 15_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      window.clearInterval(timer);
    };
  }, [status, lock]);

  const value = useMemo<VaultContext>(
    () => ({ status, lockUntil, payslips, unreadable, check, setup, unlock, lock, changePassword, erase, add, update, remove, fileBytes }),
    [status, lockUntil, payslips, unreadable, check, setup, unlock, lock, changePassword, erase, add, update, remove, fileBytes],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVault(): VaultContext {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVault needs PayslipVaultProvider");
  return v;
}
