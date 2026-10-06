// Browser-side helpers for the passcode and the JSON API.
const PASS_KEY = "planner_pass";

export function getPasscode(): string {
  try {
    return localStorage.getItem(PASS_KEY) ?? "";
  } catch {
    return "";
  }
}

/** Returns false when the browser blocks storage. */
export function savePasscode(pass: string): boolean {
  try {
    localStorage.setItem(PASS_KEY, pass);
    return true;
  } catch {
    return false;
  }
}

export function clearPasscode(): void {
  try {
    localStorage.removeItem(PASS_KEY);
  } catch {
    /* storage blocked */
  }
}

/** Forgets the passcode and goes to the sign-in page. `rejected` shows the "wrong passcode" message there. */
export function signOut(rejected = false): void {
  clearPasscode();
  window.location.replace(rejected ? "/login?e=1" : "/login");
}

export class AuthError extends Error {
  constructor() {
    super("auth");
  }
}

export async function api<T>(path: string, init: { method?: "GET" | "PUT"; body?: unknown; passcode?: string } = {}): Promise<T> {
  const res = await fetch(path, {
    method: init.method ?? "GET",
    cache: "no-store",
    headers: { "Content-Type": "application/json", "x-passcode": init.passcode ?? getPasscode() },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 401) throw new AuthError();
  if (!res.ok) throw new Error(`http ${res.status}`);
  return (await res.json()) as T;
}
