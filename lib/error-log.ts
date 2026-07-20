import "server-only";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DB_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL });

async function ensureErrorLogTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS error_logs (
    id text PRIMARY KEY,
    message text,
    stack text,
    digest text,
    url text,
    user_agent text,
    user_email text,
    created_at timestamptz DEFAULT now()
  )`);
}

export async function logClientError(input: {
  message: string;
  stack?: string;
  digest?: string;
  url?: string;
  userAgent?: string;
  userEmail?: string;
}) {
  try {
    await ensureErrorLogTable();
    const id = `err_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
    await pool.query(
      `INSERT INTO error_logs (id, message, stack, digest, url, user_agent, user_email) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        id,
        (input.message || "").slice(0, 2000),
        (input.stack || "").slice(0, 4000),
        input.digest || "",
        input.url || "",
        input.userAgent || "",
        input.userEmail || ""
      ]
    );
  } catch (err) {
    console.error("Failed to save client error log:", err);
  }
}

export async function getRecentErrorLogs(limit = 50) {
  try {
    await ensureErrorLogTable();
    const res = await pool.query(
      `SELECT id, message, stack, digest, url, user_agent, user_email, created_at FROM error_logs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.rows as Array<{
      id: string;
      message: string;
      stack: string;
      digest: string;
      url: string;
      user_agent: string;
      user_email: string;
      created_at: string;
    }>;
  } catch (err) {
    console.error("Failed to read client error logs:", err);
    return [];
  }
}