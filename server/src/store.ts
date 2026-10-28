import { randomUUID } from "node:crypto";

// In-memory storage. Steps 6–7 replace this file with Postgres and MongoDB;
// routes should only ever talk to these functions.

export interface Bucket {
  id: string;
  createdAt: Date;
}

const buckets = new Map<string, Bucket>();

export function createBucket(): Bucket {
  const bucket = { id: randomUUID(), createdAt: new Date() };
  buckets.set(bucket.id, bucket);
  return bucket;
}

export function getBucket(id: string): Bucket | undefined {
  return buckets.get(id);
}
