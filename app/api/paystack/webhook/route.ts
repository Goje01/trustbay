import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { completeSuccessfulPayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  const signature = request.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", secret).update(body).digest("hex");

  if (secret && !secret.includes("PASTE_YOUR") && signature !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const event = JSON.parse(body);
  if (event.event !== "charge.success") return NextResponse.json({ ok: true });
  const reference = event.data.reference as string;

  await completeSuccessfulPayment(reference);
  return NextResponse.json({ ok: true });
}
