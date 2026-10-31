import dns from "node:dns";
import { MongoClient, type Collection, type Document } from "mongodb";

const globalForMongo = globalThis as unknown as { _mongo?: Promise<MongoClient> };

function connect(uri: string): Promise<MongoClient> {
  return new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 8000 }).connect();
}

/** The SRV lookup fails when the OS only offers a DNS server Node can't use (e.g. an IPv6 link-local one); retry via public resolvers. */
async function connectWithDnsFallback(uri: string): Promise<MongoClient> {
  try {
    return await connect(uri);
  } catch (err) {
    if (!/querySrv/.test(String((err as Error)?.message))) throw err;
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    return connect(uri);
  }
}

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!globalForMongo._mongo) {
    // Don't keep a failed connection around, or every request fails until the server restarts.
    globalForMongo._mongo = connectWithDnsFallback(uri).catch((err) => {
      globalForMongo._mongo = undefined;
      throw err;
    });
  }
  return globalForMongo._mongo;
}

/**
 * One small collection holds every document:
 *   _id "main"      -> { state, updatedAt }   planner numbers
 *   _id "knowledge" -> { read: { [ruleId]: timestamp } }   checklist progress
 *   _id "payslip-vault" -> { salt, iterations, wrapped, authHash, ... }   payslip password check
 */
export async function stateCollection(): Promise<Collection<Document>> {
  return (await client()).db("planner").collection("state");
}

/** One document per payslip: { _id, data, file?, createdAt, updatedAt }, all encrypted in the browser. */
export async function payslipCollection(): Promise<Collection<Document>> {
  return (await client()).db("planner").collection("payslips");
}
