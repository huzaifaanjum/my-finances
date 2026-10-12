import { appIcon } from "@/lib/appIcon";

const SIZES = new Set([192, 512]);

/** Manifest icons. `?maskable` adds extra padding for Android's adaptive-icon crop. */
export async function GET(req: Request, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  const maskable = new URL(req.url).searchParams.has("maskable");
  return appIcon(size, { inset: maskable ? 0.24 : 0.12 });
}

export function generateStaticParams() {
  return [...SIZES].map((size) => ({ size: String(size) }));
}
