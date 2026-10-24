import { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/auth";
import { stateCollection } from "@/lib/server/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC = "benefit-limits";
const ID = /^[a-z0-9-]{1,40}$/;

/** GET -> { limits: { [limitId]: number } }: claim limits you entered from your benefits booklet. */
export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const doc = await (await stateCollection()).findOne({ _id: DOC as never });
    const limits = doc && typeof doc.limits === "object" && doc.limits !== null ? (doc.limits as Record<string, number>) : {};
    return json({ limits });
  } catch {
    return json({ error: "server" }, 500);
  }
}

/** PUT { id, value } -> saves one limit; value null clears it. Each limit is its own field, so devices never overwrite each other. */
export async function PUT(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => null)) as { id?: unknown; value?: unknown } | null;
    if (!body || typeof body.id !== "string" || !ID.test(body.id)) return json({ error: "bad body" }, 400);
    const v = body.value;
    if (v !== null && (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 10_000_000)) return json({ error: "bad value" }, 400);
    const field = `limits.${body.id}`;
    const col = await stateCollection();
    if (v === null) await col.updateOne({ _id: DOC as never }, { $unset: { [field]: "" } }, { upsert: true });
    else await col.updateOne({ _id: DOC as never }, { $set: { [field]: v } }, { upsert: true });
    return json({ ok: true });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export function OPTIONS() {
  return json({ error: "method" }, 405, { Allow: "GET, PUT" });
}
