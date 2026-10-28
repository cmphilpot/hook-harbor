import { randomUUID } from "node:crypto";
import { genId } from "./utils/genId.js";

// In-memory storage. Steps 6–7 replace this file with Postgres and MongoDB;
// routes should only ever talk to these functions.

export interface Bucket {
  id: string;
  createdAt: Date;
}

export interface CapturedRequest {
  id: string;
  method: string;
  requestTime: string;
  headers: string; // JSON string of the request headers
  body: string;
  bodyEncoding: "utf8" | "base64";
  path: string; // part after /b/:bucketId, e.g. "/orders/42"
  query: Record<string, string | string[]>;
}

const buckets = new Map<string, Bucket>();
const requests = new Map<string, CapturedRequest[]>();

export function createBucket(): Bucket {
  let id = genId();
  while (buckets.has(id)) id = genId();
  const bucket = { id, createdAt: new Date() };
  buckets.set(bucket.id, bucket);
  requests.set(bucket.id, []);
  return bucket;
}

export function getBucket(id: string): Bucket | undefined {
  return buckets.get(id);
}

export function addRequest(
  bucketId: string,
  data: Omit<CapturedRequest, "id" | "requestTime">,
): CapturedRequest {
  const request = {
    id: randomUUID(),
    requestTime: new Date().toISOString(),
    ...data,
  };
  requests.get(bucketId)?.push(request);
  return request;
}

// Newest first
export function getRequests(bucketId: string): CapturedRequest[] {
  return [...(requests.get(bucketId) ?? [])].reverse();
}
