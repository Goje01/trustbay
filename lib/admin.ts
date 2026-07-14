import "server-only";
import type { Role, TrustBayData } from "./types";

function splitEmails(value?: string) {
  return (value || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getAdminEmails(data?: TrustBayData) {
  const fromSettings = data?.platformSettings?.adminEmails || [];
  const fromEnv = splitEmails(process.env.TRUST_BAY_ADMIN_EMAILS);
  return Array.from(new Set([...fromSettings, ...fromEnv].map((email) => email.toLowerCase()).filter(Boolean))).slice(0, 2);
}

export function getNotificationEmails(data?: TrustBayData) {
  const fromSettings = data?.platformSettings?.notificationEmails || [];
  const fromEnv = splitEmails(process.env.TRUST_BAY_NOTIFICATION_EMAILS || process.env.TRUST_BAY_ADMIN_EMAILS);
  return Array.from(new Set([...fromSettings, ...fromEnv].map((email) => email.toLowerCase()).filter(Boolean)));
}

export function roleForEmail(email: string, data?: TrustBayData): Role {
  const adminEmails = getAdminEmails(data);
  const normalized = email.toLowerCase();
  if (adminEmails[0] === normalized) return "ceo";
  if (adminEmails[1] === normalized) return "super_admin";
  return "buyer";
}
