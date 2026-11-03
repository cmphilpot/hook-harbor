import pg from "pg";

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (see server/.env.example)");
}

// Shared connection pool; pg opens and reuses connections as queries need them
export const pool = new pg.Pool({ connectionString: DATABASE_URL });
