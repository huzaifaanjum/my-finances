import { Binary } from "mongodb";
import { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/auth";
import { payslipCollection } from "@/lib/server/mongo";
import { ID, isB64, MAX_DATA, MAX_FILE, vaultGuard } from "@/lib/server/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** PUT { data, file? } -> replaces the details; file: base64 replaces the PDF, null removes it, absent keeps it. */
export async function PUT(req: NextRequest, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!ID.test(id)) return json({ error: "bad id" }, 400);
    const v = await vaultGuard(req);
    if ("denied" in v) return v.denied;
    const body = (await req.json().catch(() => null)) as { data?: unknown; file?: unknown } | null;
    if (!body || !isB64(body.data, MAX_DATA)) return json({ error: "bad body" }, 400);
    if (body.file !== undefined && body.file !== null && !isB64(body.file, MAX_FILE)) return json({ error: "too large" }, 413);
    const updatedAt = Date.now();
    const update =
      body.file === null
        ? { $set: { data: body.data, hasFile: false, updatedAt }, $unset: { file: "" } }
        : body.file === undefined
          ? { $set: { data: body.data, updatedAt } }
          : { $set: { data: body.data, file: new Binary(Buffer.from(body.file as string, "base64")), hasFile: true, updatedAt } };
    const res = await (await payslipCollection()).updateOne({ _id: id as never }, update);
    if (!res.matchedCount) return json({ error: "not found" }, 404);
    return json({ ok: true, updatedAt });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!ID.test(id)) return json({ error: "bad id" }, 400);
    const v = await vaultGuard(req);
    if ("denied" in v) return v.denied;
    await (await payslipCollection()).deleteOne({ _id: id as never });
    return json({ ok: true });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export function OPTIONS() {
  return json({ error: "method" }, 405, { Allow: "PUT, DELETE" });
}
