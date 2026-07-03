import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/bpo";

declare global {
  var _mongoClient: MongoClient | undefined;
  var _mongoDb: Db | undefined;
}

function getClient(): MongoClient {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri);
    }
    return global._mongoClient;
  }
  return new MongoClient(uri);
}

function getDb(client: MongoClient): Db {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoDb) {
      global._mongoDb = client.db();
    }
    return global._mongoDb;
  }
  return client.db();
}

export const client = getClient();
export const db = getDb(client);

export async function connectToDatabase(): Promise<Db> {
  await client.connect();
  return db;
}
