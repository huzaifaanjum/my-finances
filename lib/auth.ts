import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

function sha(v: string): Buffer {
  return createHash("sha256").update(v).digest();
}

function authorised(req: NextRequest): boolean {
  const expected = process.env.APP_PASSCODE;
  if (!expected) return false;
  return timingSafeEqual(sha(req.headers.get("x-passcode") ?? ""), sha(expected));
}

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });
}

/** Returns a 401 response when the passcode header is wrong, otherwise null. */
export async function guard(req: NextRequest): Promise<NextResponse | null> {
  if (authorised(req)) return null;
  await new Promise((r) => setTimeout(r, 400));
  return json({ error: "auth" }, 401);
}
