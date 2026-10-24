import { Binary } from "mongodb";
import { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/auth";
import { payslipCollection } from "@/lib/server/mongo";
import { ID, isB64, MAX_DATA, MAX_FILE, vaultGuard } from "@/lib/server/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET -> { wrapped, items: [{ id, data, hasFile, createdAt, updatedAt }] }. Everything stays encrypted. */
export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const v = await vaultGuard(req);
    if ("denied" in v) return v.denied;
    const docs = await (await payslipCollection())
      .find({}, { projection: { data: 1, hasFile: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ createdAt: 1 })
      .toArray();
    return json({
      wrapped: v.vault.wrapped,
      items: docs.map((d) => ({ id: d._id, data: d.data, hasFile: !!d.hasFile, createdAt: d.createdAt, updatedAt: d.updatedAt })),
    });
  } catch {
    return json({ error: "server" }, 500);
  }
}

/** POST { id, data, file? } -> stores a new encrypted payslip. */
export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const v = await vaultGuard(req);
    if ("denied" in v) return v.denied;
    const body = (await req.json().catch(() => null)) as { id?: unknown; data?: unknown; file?: unknown } | null;
    if (!body || typeof body.id !== "string" || !ID.test(body.id) || !isB64(body.data, MAX_DATA)) return json({ error: "bad body" }, 400);
    if (body.file !== undefined && !isB64(body.file, MAX_FILE)) return json({ error: "too large" }, 413);
    const at = Date.now();
    const col = await payslipCollection();
    if (await col.findOne({ _id: body.id as never }, { projection: { _id: 1 } })) return json({ error: "exists" }, 409);
    await col.insertOne({
      _id: body.id as never,
      data: body.data,
      ...(body.file ? { file: new Binary(Buffer.from(body.file as string, "base64")), hasFile: true } : { hasFile: false }),
      createdAt: at,
      updatedAt: at,
    });
    return json({ ok: true, createdAt: at });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export function OPTIONS() {
  return json({ error: "method" }, 405, { Allow: "GET, POST" });
}
