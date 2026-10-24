import type { Binary } from "mongodb";
import { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/auth";
import { payslipCollection } from "@/lib/server/mongo";
import { ID, vaultGuard } from "@/lib/server/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET -> { file }: the encrypted PDF as base64. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    if (!ID.test(id)) return json({ error: "bad id" }, 400);
    const v = await vaultGuard(req);
    if ("denied" in v) return v.denied;
    const doc = await (await payslipCollection()).findOne({ _id: id as never }, { projection: { file: 1 } });
    if (!doc?.file) return json({ error: "not found" }, 404);
    return json({ file: (doc.file as Binary).toString("base64") });
  } catch {
    return json({ error: "server" }, 500);
  }
}
