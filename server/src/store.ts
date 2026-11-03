import { ObjectId } from "mongodb";
import { bodies } from "./db/mongo.js";
import { pool } from "./db/pool.js";
import { genId } from "./utils/genId.js";

// Buckets and request metadata live in Postgres, request bodies in MongoDB.
// Routes should only ever talk to these functions.

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

interface RequestRow {
  id: string;
  method: string;
  path: string;
  headers: Record<string, unknown>;
  query: Record<string, string | string[]>;
  body_encoding: "utf8" | "base64";
  received_at: Date;
  body_doc_id: string | null; // null for requests saved before Step 7
}

const REQUEST_COLUMNS =
  "id, method, path, headers, query, body_encoding, received_at, body_doc_id";

// Database row and its MongoDB body → the shape the API has always returned
function toRequest(row: RequestRow, body: string): CapturedRequest {
  return {
    id: row.id,
    method: row.method,
    requestTime: row.received_at.toISOString(),
    headers: JSON.stringify(row.headers),
    body,
    bodyEncoding: row.body_encoding,
    path: row.path,
    query: row.query,
  };
}

export async function createBucket(): Promise<Bucket> {
  // On the rare id collision nothing is inserted, so try another id
  for (;;) {
    const { rows } = await pool.query<{ id: string; created_at: Date }>(
      `INSERT INTO buckets (id) VALUES ($1)
       ON CONFLICT (id) DO NOTHING
       RETURNING id, created_at`,
      [genId()],
    );
    const row = rows[0];
    if (row) return { id: row.id, createdAt: row.created_at };
  }
}

export async function getBucket(id: string): Promise<Bucket | undefined> {
  const { rows } = await pool.query<{ id: string; created_at: Date }>(
    "SELECT id, created_at FROM buckets WHERE id = $1",
    [id],
  );
  const row = rows[0];
  return row && { id: row.id, createdAt: row.created_at };
}

export async function addRequest(
  bucketId: string,
  data: Omit<CapturedRequest, "id" | "requestTime">,
): Promise<CapturedRequest> {
  // Body first, so the Postgres row can point to its document
  const { insertedId } = await bodies.insertOne({ body: data.body });
  try {
    const { rows } = await pool.query<RequestRow>(
      `INSERT INTO requests
         (bucket_id, method, path, headers, query, body_encoding, body_doc_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${REQUEST_COLUMNS}`,
      [
        bucketId,
        data.method,
        data.path,
        data.headers,
        // Stringified so pg sends it as JSON (it would turn arrays into Postgres arrays)
        JSON.stringify(data.query),
        data.bodyEncoding,
        insertedId.toHexString(),
      ],
    );
    return toRequest(rows[0]!, data.body);
  } catch (error) {
    // No row points to the body now, so don't leave it behind
    await bodies.deleteOne({ _id: insertedId });
    throw error;
  }
}

// Newest first
export async function getRequests(bucketId: string): Promise<CapturedRequest[]> {
  const { rows } = await pool.query<RequestRow>(
    `SELECT ${REQUEST_COLUMNS} FROM requests
     WHERE bucket_id = $1
     ORDER BY received_at DESC`,
    [bucketId],
  );

  // All of this bucket's bodies in one MongoDB query, not one per request
  const docIds = rows.flatMap((r) =>
    r.body_doc_id ? [new ObjectId(r.body_doc_id)] : [],
  );
  const docs =
    docIds.length > 0
      ? await bodies.find({ _id: { $in: docIds } }).toArray()
      : [];
  const bodyById = new Map(docs.map((d) => [d._id.toHexString(), d.body]));

  return rows.map((r) => toRequest(r, bodyById.get(r.body_doc_id ?? "") ?? ""));
}
