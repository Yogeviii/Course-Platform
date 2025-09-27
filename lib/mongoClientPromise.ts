// lib/mongoClientPromise.ts
import { MongoClient } from "mongodb";
import type { MongoClient as MongoClientType } from "mongodb";

// Reuse the same client across hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClientType> | undefined;
}

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI missing");

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClientType>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
