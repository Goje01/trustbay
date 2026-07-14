import { NextRequest, NextResponse } from "next/server";
import { completeSuccessfulPayment, verifyPaystackReference } from "@/lib/payments";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");
  if (!reference) return NextResponse.redirect(new URL("/seller?payment=missing-reference", request.url));

  const verified = await verifyPaystackReference(reference);
  if (!verified) return NextResponse.redirect(new URL(`/seller?payment=unverified&reference=${reference}`, request.url));

  const redirectPath = await completeSuccessfulPayment(reference);
  return NextResponse.redirect(new URL(redirectPath, request.url));
}
