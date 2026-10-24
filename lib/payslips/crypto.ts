// End-to-end encryption for payslips, done in the browser with WebCrypto.
//
//   payslip password --PBKDF2-SHA256 (600k)--> master --HKDF--> key-encryption key (AES-256-GCM)
//                                                       \-HKDF--> auth token (sent to the server)
//   a random data key (AES-256-GCM) encrypts every payslip and PDF; it is stored wrapped by the
//   key-encryption key, so changing the password only re-wraps it.
//
// The server only ever sees ciphertext, the salt and a hash of the auth token; it cannot read
// your payslips or recover the password.

export const ITERATIONS = 600_000;

const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function unb64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export const randomBytes = (n: number) => crypto.getRandomValues(new Uint8Array(n));

/** 32 hex characters, used as a payslip id. */
export const randomId = () => hex(randomBytes(16).buffer);

export interface VaultKeys {
  kek: CryptoKey;
  /** proves the password to the server without revealing it */
  auth: string;
}

export async function deriveKeys(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<VaultKeys> {
  const subtle = crypto.subtle;
  const base = await subtle.importKey("raw", enc.encode(password.normalize("NFKC")), "PBKDF2", false, ["deriveBits"]);
  const master = await subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, base, 256);
  const hk = await subtle.importKey("raw", master, "HKDF", false, ["deriveBits", "deriveKey"]);
  const info = (s: string) => ({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(0), info: enc.encode(s) });
  const kek = await subtle.deriveKey(info("payslips/kek"), hk, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  const auth = hex(await subtle.deriveBits(info("payslips/auth"), hk, 256));
  return { kek, auth };
}

/** iv (12 bytes) followed by the ciphertext, as base64. */
async function sealBytes(key: CryptoKey, bytes: Uint8Array<ArrayBuffer>, aad: string): Promise<string> {
  const iv = randomBytes(12);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: enc.encode(aad) }, key, bytes));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv);
  out.set(ct, 12);
  return b64(out);
}

async function openBytes(key: CryptoKey, sealed: string, aad: string): Promise<Uint8Array<ArrayBuffer>> {
  const raw = unb64(sealed);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.subarray(0, 12), additionalData: enc.encode(aad) }, key, raw.subarray(12));
  return new Uint8Array(pt);
}

/** A new random data key, wrapped by the key-encryption key. */
export async function newWrappedKey(kek: CryptoKey): Promise<string> {
  return sealBytes(kek, randomBytes(32), "payslips/dek");
}

/** Throws when the password is wrong (the auth tag does not match). */
export async function unwrapKey(kek: CryptoKey, wrapped: string): Promise<CryptoKey> {
  const raw = await openBytes(kek, wrapped, "payslips/dek");
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** The same data key, wrapped by a different key-encryption key (for a password change). */
export async function rewrapKey(oldKek: CryptoKey, newKek: CryptoKey, wrapped: string): Promise<string> {
  return sealBytes(newKek, await openBytes(oldKek, wrapped, "payslips/dek"), "payslips/dek");
}

// The record id is bound into each ciphertext, so blobs cannot be swapped between payslips.
export const sealJson = (key: CryptoKey, id: string, value: unknown) => sealBytes(key, enc.encode(JSON.stringify(value)), `payslip/${id}`);
export const openJson = async <T>(key: CryptoKey, id: string, sealed: string): Promise<T> =>
  JSON.parse(dec.decode(await openBytes(key, sealed, `payslip/${id}`))) as T;
export const sealFile = (key: CryptoKey, id: string, bytes: Uint8Array<ArrayBuffer>) => sealBytes(key, bytes, `payslip-file/${id}`);
export const openFile = (key: CryptoKey, id: string, sealed: string) => openBytes(key, sealed, `payslip-file/${id}`);
