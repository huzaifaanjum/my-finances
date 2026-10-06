import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { stateCollection } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const MAX_CHARS = 200_000;

function sha(v: string): Buffer {
  return createHash("sha256").update(v).digest();
}

function authorised(req: NextRequest): boolean {
  const expected = process.env.APP_PASSCODE;
  if (!expected) return false;
  return timingSafeEqual(sha(req.headers.get("x-passcode") ?? ""), sha(expected));
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...extra } });
}

async function guard(req: NextRequest): Promise<NextResponse | null> {
  if (authorised(req)) return null;
  await new Promise((r) => setTimeout(r, 400));
  return json({ error: "auth" }, 401);
}

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const doc = await (await stateCollection()).findOne({ _id: "main" });
    return json(doc ? { state: doc.state, updatedAt: doc.updatedAt } : { state: null, updatedAt: 0 });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export async function PUT(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body: unknown = await req.json().catch(() => null);
    const state = (body as { state?: unknown } | null)?.state;
    if (typeof state !== "object" || state === null || Array.isArray(state)) {
      return json({ error: "bad body" }, 400);
    }
    if (JSON.stringify(state).length > MAX_CHARS) return json({ error: "too large" }, 413);
    const updatedAt = Date.now();
    await (await stateCollection()).updateOne(
      { _id: "main" },
      { $set: { state: state as Record<string, unknown>, updatedAt } },
      { upsert: true },
    );
    return json({ ok: true, updatedAt });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export function OPTIONS() {
  return json({ error: "method" }, 405, { Allow: "GET, PUT" });
}
