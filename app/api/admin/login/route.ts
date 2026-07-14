import { NextRequest, NextResponse } from "next/server";
import { checkAdminCredentials, createAdminSession } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const role = checkAdminCredentials(username, password);
  if (!role) {
    return NextResponse.redirect(new URL("/admin/login?unauthorized=1", request.url));
  }

  await createAdminSession(role);
  return NextResponse.redirect(new URL("/admin", request.url));
}