import { MongoClient, type Collection } from "mongodb";

export interface StateDoc {
  _id: string;
  state: Record<string, unknown>;
  updatedAt: number;
}

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

export async function stateCollection(): Promise<Collection<StateDoc>> {
  return (await client()).db("planner").collection<StateDoc>("state");
}
