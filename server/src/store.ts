import { pool } from "./db/pool.js";
import { genId } from "./utils/genId.js";

// Buckets and request metadata live in Postgres. Bodies stay in memory until
// Step 7 moves them to MongoDB. Routes should only ever talk to these functions.

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

// Request bodies by request id; lost on restart until Step 7
const bodies = new Map<string, string>();

interface RequestRow {
  id: string;
  method: string;
  path: string;
  headers: Record<string, unknown>;
  query: Record<string, string | string[]>;
  body_encoding: "utf8" | "base64";
  received_at: Date;
}

const REQUEST_COLUMNS =
  "id, method, path, headers, query, body_encoding, received_at";

// Database row → the shape the API has always returned
function toRequest(row: RequestRow): CapturedRequest {
  return {
    id: row.id,
    method: row.method,
    requestTime: row.received_at.toISOString(),
    headers: JSON.stringify(row.headers),
    body: bodies.get(row.id) ?? "",
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
  const { rows } = await pool.query<RequestRow>(
    `INSERT INTO requests (bucket_id, method, path, headers, query, body_encoding)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${REQUEST_COLUMNS}`,
    [
      bucketId,
      data.method,
      data.path,
      data.headers,
      // Stringified so pg sends it as JSON (it would turn arrays into Postgres arrays)
      JSON.stringify(data.query),
      data.bodyEncoding,
    ],
  );
  const row = rows[0]!;
  bodies.set(row.id, data.body);
  return toRequest(row);
}

// Newest first
export async function getRequests(bucketId: string): Promise<CapturedRequest[]> {
  const { rows } = await pool.query<RequestRow>(
    `SELECT ${REQUEST_COLUMNS} FROM requests
     WHERE bucket_id = $1
     ORDER BY received_at DESC`,
    [bucketId],
  );
  return rows.map(toRequest);
}
