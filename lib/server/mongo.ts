import { MongoClient, type Collection, type Document } from "mongodb";

const globalForMongo = globalThis as unknown as { _mongo?: Promise<MongoClient> };

function client(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!globalForMongo._mongo) {
    globalForMongo._mongo = new MongoClient(uri, {
      maxPoolSize: 3,
      serverSelectionTimeoutMS: 8000,
    }).connect();
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
