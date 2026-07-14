import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { TrustBayData } from "./types";

const dbPath = path.join(process.cwd(), "data", "trust-bay.json");

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

export async function readDb(): Promise<TrustBayData> {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return { ...emptyData, ...JSON.parse(raw) };
  } catch {
    await writeDb(emptyData);
    return structuredClone(emptyData);
  }
}

export async function writeDb(data: TrustBayData) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
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
