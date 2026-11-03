import { pool } from "./pool.js";

// Creates the tables if they don't exist yet; run once at server start.
// Kept in a .ts file (not .sql) so `tsc` includes it in dist without a copy step.
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS buckets (
      id         text PRIMARY KEY,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS requests (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id     text NOT NULL REFERENCES buckets (id) ON DELETE CASCADE,
      method        text NOT NULL,
      path          text NOT NULL,
      headers       jsonb NOT NULL,
      query         jsonb NOT NULL,
      body_encoding text NOT NULL CHECK (body_encoding IN ('utf8', 'base64')),
      received_at   timestamptz NOT NULL DEFAULT now(),
      -- MongoDB document holding the body; filled in from Step 7
      body_doc_id   text
    );

    -- A bucket's requests are always listed newest first
    CREATE INDEX IF NOT EXISTS requests_bucket_received
      ON requests (bucket_id, received_at DESC);
  `);
}
