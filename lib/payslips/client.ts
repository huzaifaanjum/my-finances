// Browser calls to the payslip API. Both passcodes travel as headers; bodies are already encrypted.
import { AuthError, getPasscode } from "@/lib/api/client";

export class VaultError extends Error {
  constructor(
    public kind: "wrong" | "locked" | "missing",
    /** when locked: time the lock ends; when wrong: tries left */
    public detail = 0,
  ) {
    super(kind);
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

export async function vaultApi<T>(path: string, init: { method?: Method; body?: unknown; auth?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", "x-passcode": getPasscode() };
  if (init.auth) headers["x-payslip-auth"] = init.auth;
  const res = await fetch(path, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401) throw new AuthError();
  const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (res.status === 403) throw new VaultError("wrong", Number(j.left) || 0);
  if (res.status === 429) throw new VaultError("locked", Number(j.until) || Date.now() + 15 * 60_000);
  if (res.status === 404 && j.error === "no vault") throw new VaultError("missing");
  if (res.status === 413) throw new Error("That file is too large to store. Keep PDFs under 3 MB.");
  if (!res.ok) throw new Error(`http ${res.status}`);
  return j as T;
}

export interface VaultInfo {
  exists: boolean;
  salt?: string;
  iterations?: number;
  lockUntil?: number;
}

export interface SealedPayslip {
  id: string;
  data: string;
  hasFile: boolean;
  createdAt: number;
  updatedAt: number;
}
