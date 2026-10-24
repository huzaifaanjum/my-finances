import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { json } from "./auth";
import { stateCollection } from "./mongo";

// The payslip password never reaches the server. The browser derives an auth token from it,
// and the server keeps only a salted hash of that token. Five wrong tries lock the vault for 15 minutes.

export const VAULT_ID = "payslip-vault";
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;

export interface VaultDoc {
  salt: string;
  iterations: number;
  wrapped: string;
  authHash: string;
  authSalt: string;
  fails?: number;
  lockUntil?: number;
}

/** payslip ids are 32 random hex characters made in the browser */
export const ID = /^[0-9a-f]{32}$/;
/** encrypted payslip details */
export const MAX_DATA = 300_000;
/** an encrypted PDF of up to 3 MB, as base64 */
export const MAX_FILE = 4_200_000;

const AUTH = /^[0-9a-f]{64}$/;
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;

export const isAuth = (v: unknown): v is string => typeof v === "string" && AUTH.test(v);
export const isB64 = (v: unknown, max: number): v is string => typeof v === "string" && v.length > 0 && v.length <= max && B64.test(v);

export function hashAuth(auth: string, salt = randomBytes(16).toString("hex")) {
  return { authSalt: salt, authHash: createHash("sha256").update(`${salt}:${auth}`).digest("hex") };
}

export async function readVault(): Promise<VaultDoc | null> {
  const doc = await (await stateCollection()).findOne({ _id: VAULT_ID as never });
  return doc as unknown as VaultDoc | null;
}

/** Checks the x-payslip-auth header. Returns the vault, or the error response to send. */
export async function vaultGuard(req: NextRequest): Promise<{ vault: VaultDoc } | { denied: NextResponse }> {
  const vault = await readVault();
  if (!vault) return { denied: json({ error: "no vault" }, 404) };
  const now = Date.now();
  if (vault.lockUntil && vault.lockUntil > now) return { denied: json({ error: "locked", until: vault.lockUntil }, 429) };

  const auth = req.headers.get("x-payslip-auth") ?? "";
  const ok =
    isAuth(auth) && timingSafeEqual(Buffer.from(hashAuth(auth, vault.authSalt).authHash, "hex"), Buffer.from(vault.authHash, "hex"));
  const col = await stateCollection();
  if (!ok) {
    const fails = (vault.fails ?? 0) + 1;
    const lock = fails >= MAX_FAILS;
    await col.updateOne({ _id: VAULT_ID as never }, { $set: lock ? { fails: 0, lockUntil: now + LOCK_MS } : { fails } });
    await new Promise((r) => setTimeout(r, 400));
    return lock
      ? { denied: json({ error: "locked", until: now + LOCK_MS }, 429) }
      : { denied: json({ error: "vault", left: MAX_FAILS - fails }, 403) };
  }
  if (vault.fails || vault.lockUntil) await col.updateOne({ _id: VAULT_ID as never }, { $set: { fails: 0, lockUntil: 0 } });
  return { vault };
}
