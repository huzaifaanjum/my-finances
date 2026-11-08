import { NextRequest } from "next/server";
import { guard, json } from "@/lib/server/auth";
import { stateCollection, storeCollection } from "@/lib/server/mongo";
import { limitValue, LSA_YEARLY } from "@/lib/benefits";
import { CLAIMED_IDS, STORE, type StoreItem } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC = "store";
const ID = /^[a-z0-9-]{1,40}$/;

/**
 * Adds any product from the bundled catalog that isn't in the collection yet, so new products in lib/store.ts reach Mongo.
 * $setOnInsert never overwrites a product already there, and two requests at once can't duplicate one.
 */
async function items(): Promise<StoreItem[]> {
  const col = await storeCollection();
  let docs = await col.find({}).toArray();
  const have = new Set(docs.map((d) => String(d._id)));
  const missing = STORE.filter((i) => !have.has(i.id));
  if (missing.length) {
    await col.bulkWrite(
      missing.map(({ id, ...rest }) => ({ updateOne: { filter: { _id: id as never }, update: { $setOnInsert: rest }, upsert: true } })),
      { ordered: false },
    );
    docs = await col.find({}).toArray();
  }
  return docs.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }) as StoreItem);
}

/** GET -> { items, lsaUsed, used, wishlist }: the product catalog, what you've already claimed from the spending account and each health limit, and wished item ids, oldest first. */
export async function GET(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const [list, doc] = await Promise.all([items(), (await stateCollection()).findOne({ _id: DOC as never })]);
    const lsaUsed = doc && typeof doc.lsaUsed === "number" ? doc.lsaUsed : 0;
    const wished = doc && typeof doc.wish === "object" && doc.wish !== null ? (doc.wish as Record<string, number>) : {};
    const wishlist = Object.keys(wished).sort((a, b) => wished[a] - wished[b]);
    const used = doc && typeof doc.used === "object" && doc.used !== null ? (doc.used as Record<string, number>) : {};
    return json({ items: list, lsaUsed, used, wishlist });
  } catch {
    return json({ error: "server" }, 500);
  }
}

/**
 * PUT { lsaUsed } -> saves what you've already claimed from the spending account this year.
 * PUT { wish: { id, on } } -> adds or removes one wishlist item (each is its own field, so devices never overwrite each other).
 * PUT { used: { id, value } } -> saves what you've already claimed against one health limit (glasses, massage, ...).
 */
export async function PUT(req: NextRequest) {
  const denied = await guard(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => null)) as { lsaUsed?: unknown; wish?: { id?: unknown; on?: unknown }; used?: { id?: unknown; value?: unknown } } | null;
    const col = await stateCollection();
    if (body?.used) {
      const { id, value } = body.used;
      if (typeof id !== "string" || !CLAIMED_IDS.includes(id)) return json({ error: "bad body" }, 400);
      const max = limitValue(id) ?? 0;
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) return json({ error: "bad value" }, 400);
      await col.updateOne({ _id: DOC as never }, { $set: { [`used.${id}`]: value } }, { upsert: true });
      return json({ ok: true });
    }
    if (body?.wish) {
      const { id, on } = body.wish;
      if (typeof id !== "string" || !ID.test(id) || typeof on !== "boolean") return json({ error: "bad body" }, 400);
      const field = `wish.${id}`;
      await col.updateOne({ _id: DOC as never }, on ? { $set: { [field]: Date.now() } } : { $unset: { [field]: "" } }, { upsert: true });
      return json({ ok: true });
    }
    const v = body?.lsaUsed;
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > LSA_YEARLY) return json({ error: "bad value" }, 400);
    await col.updateOne({ _id: DOC as never }, { $set: { lsaUsed: v } }, { upsert: true });
    return json({ ok: true });
  } catch {
    return json({ error: "server" }, 500);
  }
}

export function OPTIONS() {
  return json({ error: "method" }, 405, { Allow: "GET, PUT" });
}
