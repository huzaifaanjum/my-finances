import { NextRequest } from "next/server";
import { guard, json } from "@/lib/auth";
import { stateCollection } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ID = /^[a-z0-9-]{1,40}$/;

/** GET -> { read: { [ruleId]: timestampWhenMarkedRead } } */
export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const doc = await (await stateCollection()).findOne({ _id: "knowledge" as never });
    const read: Record<string, number> =
      doc && typeof doc.read === "object" && doc.read !== null ? (doc.read as Record<string, number>) : {};
    return json({ read });
  } catch {
    return json({ error: "server" }, 500);
  }
}

/** PUT { id, read } -> marks one rule read or unread (each rule is its own field, so devices never overwrite each other). */
export async function PUT(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => null)) as { id?: unknown; read?: unknown } | null;
    if (!body || typeof body.id !== "string" || !ID.test(body.id) || typeof body.read !== "boolean") {
      return json({ error: "bad body" }, 400);
    }
    const field = `read.${body.id}`;
    const col = await stateCollection();
    const at = Date.now();
    if (body.read) {
      await col.updateOne({ _id: "knowledge" as never }, { $set: { [field]: at } }, { upsert: true });
    } else {
      await col.updateOne({ _id: "knowledge" as never }, { $unset: { [field]: "" } }, { upsert: true });
    }
    return json({ ok: true, at });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export function OPTIONS() {
  return json({ error: "method" }, 405, { Allow: "GET, PUT" });
}
