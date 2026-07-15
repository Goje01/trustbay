import "server-only";
import type { TrustBayData } from "./types";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({ connectionString: process.env.DB_URL || process.env.NEON_DATABASE_URL || process.env.DATABASE_URL });

export const emptyData: TrustBayData = {
  users: [],
  sellerProfiles: [],
  products: [],
  uploadPayments: [],
  digitalOrders: [],
  sellerPayouts: [],
  chats: [],
  messages: [],
  reports: [],
  listingRenewals: [],
  eventTickets: [],
  termsAcceptances: [],
  notificationLogs: [],
  platformSettings: {
    adminEmails: [],
    notificationEmails: []
  }
};

async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS kv_store (key text PRIMARY KEY, value jsonb)`);
}

export async function readDb(): Promise<TrustBayData> {
  await ensureTable();
  try {
    const res = await pool.query("SELECT value FROM kv_store WHERE key = $1", ["trust-bay"]);
    if (!res || !res.rows || res.rows.length === 0) return structuredClone(emptyData);
    const row = res.rows[0].value as TrustBayData;
    return { ...emptyData, ...row };
  } catch (err) {
    console.warn("readDb: unable to read from database, falling back to empty data:", err);
    return structuredClone(emptyData);
  }
}

export async function writeDb(data: TrustBayData) {
  await ensureTable();
  try {
    await pool.query(
      `INSERT INTO kv_store(key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      ["trust-bay", data]
    );
  } catch (err) {
    console.warn("writeDb: unable to write to database:", err);
  }
}

export async function updateDb<T>(mutator: (data: TrustBayData) => T | Promise<T>) {
  const data = await readDb();
  const result = await mutator(data);
  await writeDb(data);
  return result;
}

export function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 18)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "product";
}
