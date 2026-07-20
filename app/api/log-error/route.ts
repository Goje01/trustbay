import { NextRequest, NextResponse } from "next/server";
import { logClientError } from "@/lib/error-log";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await logClientError({
      message: String(body.message || ""),
      stack: String(body.stack || ""),
      digest: String(body.digest || ""),
      url: String(body.url || ""),
      userAgent: request.headers.get("user-agent") || "",
      userEmail: String(body.userEmail || "")
    });
  } catch (err) {
    console.error("log-error route failed:", err);
  }
  return NextResponse.json({ ok: true });
}