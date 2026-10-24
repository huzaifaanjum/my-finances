import { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/auth";
import { payslipCollection, stateCollection } from "@/lib/server/mongo";
import { hashAuth, isAuth, isB64, readVault, VAULT_ID, vaultGuard } from "@/lib/server/vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  salt: string;
  iterations: number;
  wrapped: string;
  auth: string;
}

function parse(body: unknown): Body | null {
  const b = body as Partial<Body> | null;
  if (!b || !isB64(b.salt, 64) || !isB64(b.wrapped, 200) || !isAuth(b.auth)) return null;
  if (typeof b.iterations !== "number" || !Number.isInteger(b.iterations) || b.iterations < 100_000 || b.iterations > 10_000_000) return null;
  return b as Body;
}

/** GET -> { exists, salt, iterations, lockUntil }: what the browser needs to derive keys. No secrets. */
export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const v = await readVault();
    if (!v) return json({ exists: false });
    return json({ exists: true, salt: v.salt, iterations: v.iterations, lockUntil: v.lockUntil && v.lockUntil > Date.now() ? v.lockUntil : 0 });
  } catch {
    return json({ error: "server" }, 500);
  }
}

/** POST { salt, iterations, wrapped, auth } -> creates the vault the first time. */
export async function POST(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = parse(await req.json().catch(() => null));
    if (!body) return json({ error: "bad body" }, 400);
    const res = await (await stateCollection()).updateOne(
      { _id: VAULT_ID as never },
      {
        $setOnInsert: {
          salt: body.salt,
          iterations: body.iterations,
          wrapped: body.wrapped,
          ...hashAuth(body.auth),
          fails: 0,
          lockUntil: 0,
          createdAt: Date.now(),
        },
      },
      { upsert: true },
    );
    if (!res.upsertedCount) return json({ error: "exists" }, 409);
    return json({ ok: true });
  } catch {
    return json({ error: "server" }, 500);
  }
}

/** PUT { salt, iterations, wrapped, auth } with the current x-payslip-auth -> changes the password. */
export async function PUT(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const v = await vaultGuard(req);
    if ("denied" in v) return v.denied;
    const body = parse(await req.json().catch(() => null));
    if (!body) return json({ error: "bad body" }, 400);
    await (await stateCollection()).updateOne(
      { _id: VAULT_ID as never },
      { $set: { salt: body.salt, iterations: body.iterations, wrapped: body.wrapped, ...hashAuth(body.auth), changedAt: Date.now() } },
    );
    return json({ ok: true });
  } catch {
    return json({ error: "server" }, 500);
  }
}

/** DELETE { confirm: "ERASE" } -> forgets the password and deletes every payslip. Only for a forgotten password. */
export async function DELETE(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => null)) as { confirm?: unknown } | null;
    if (body?.confirm !== "ERASE") return json({ error: "bad body" }, 400);
    await (await payslipCollection()).deleteMany({});
    await (await stateCollection()).deleteOne({ _id: VAULT_ID as never });
    return json({ ok: true });
  } catch {
    return json({ error: "server" }, 500);
  }
}
