import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "tb_admin_session";

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function checkAdminCredentials(username: string, password: string): "ceo" | "super_admin" | null {
  const u1 = (process.env.ADMIN_ONE_USERNAME || "").trim();
  const p1 = (process.env.ADMIN_ONE_PASSWORD || "").trim();
  const u2 = (process.env.ADMIN_TWO_USERNAME || "").trim();
  const p2 = (process.env.ADMIN_TWO_PASSWORD || "").trim();

  const typedUsername = username.trim();
  const typedPassword = password.trim();

  if (typedUsername === u1 && typedPassword === p1) {
    return "ceo";
  }
  if (typedUsername === u2 && typedPassword === p2) {
    return "super_admin";
  }
  return null;
}

export async function createAdminSession(role: "ceo" | "super_admin") {
  const signature = sign(role);
  (await cookies()).set(COOKIE_NAME, `${role}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8 // 8 hours
  });
}

export async function getAdminRole(): Promise<"ceo" | "super_admin" | null> {
  const cookie = (await cookies()).get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  const [role, signature] = cookie.split(".");
  if (!role || !signature) return null;
  if (sign(role) !== signature) return null;
  if (role !== "ceo" && role !== "super_admin") return null;
  return role;
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}