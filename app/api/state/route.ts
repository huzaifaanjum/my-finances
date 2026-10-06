import { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/auth";
import { stateCollection } from "@/lib/server/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 200_000;

export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const doc = await (await stateCollection()).findOne({ _id: "main" as never });
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
      { _id: "main" as never },
      { $set: { state, updatedAt } },
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
