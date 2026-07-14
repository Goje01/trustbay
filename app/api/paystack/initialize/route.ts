import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { readDb, updateDb } from "@/lib/db";

function generateReference(id: string) {
  return `TB-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const type = request.nextUrl.searchParams.get("type");
  const id = request.nextUrl.searchParams.get("id");

  let amount = 0;
  let reference = "";

  if (type === "upload_fee") {
    const db = await readDb();
    const payment = db.uploadPayments.find((item) => item.productId === id && item.sellerId === user.id);
    if (!payment) return NextResponse.redirect(new URL("/seller", request.url));

    amount = payment.amount;
    reference = generateReference(payment.id);

    await updateDb(async (data) => {
      const target = data.uploadPayments.find((item) => item.id === payment.id);
      if (target) target.paystackReference = reference;
    });
  }

  if (type === "digital_order") {
    const db = await readDb();
    const order = db.digitalOrders.find((item) => item.id === id && item.buyerId === user.id);
    if (!order) return NextResponse.redirect(new URL("/", request.url));

    amount = order.amount + order.buyerPaystackFeeShare;
    reference = generateReference(order.id);

    await updateDb(async (data) => {
      const target = data.digitalOrders.find((item) => item.id === order.id);
      if (target) target.paystackReference = reference;
    });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  if (!secret || secret.includes("PASTE_YOUR")) {
    return NextResponse.redirect(new URL(`/seller?payment=pending&reference=${reference}&amount=${amount}`, request.url));
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: user.email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: new URL(`/api/paystack/callback?reference=${reference}`, request.url).toString(),
      metadata: { type, id }
    })
  });

  const payload = await response.json();

  if (!payload.status || !payload.data?.authorization_url) {
    return NextResponse.json(
      { error: payload.message || "Paystack initialization failed" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(payload.data.authorization_url);
}