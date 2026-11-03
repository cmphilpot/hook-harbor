import { MongoClient } from "mongodb";

const { MONGO_URL } = process.env;
if (!MONGO_URL) {
  throw new Error("MONGO_URL is not set (see server/.env.example)");
}

// Shared client; like the pg pool, it opens and reuses connections as needed
export const mongoClient = new MongoClient(MONGO_URL);

// Request bodies, one document per request. The document's _id is stored in
// the Postgres requests.body_doc_id column.
export const bodies = mongoClient
  .db("hookharbor")
  .collection<{ body: string }>("bodies");
