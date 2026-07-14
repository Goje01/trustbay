import { NextRequest, NextResponse } from "next/server";
import { nowIso, updateDb } from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.nextUrl.searchParams.get("secret") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const now = Date.now();
  const queuedEmails: Array<Parameters<typeof sendNotification>> = [];

  await updateDb((db) => {
    for (const order of db.digitalOrders) {
      if (order.status === "download_released" && order.disputeDeadlineAt && Date.parse(order.disputeDeadlineAt) <= now) {
        order.status = "accepted";
        order.updatedAt = nowIso();
        const product = db.products.find((item) => item.id === order.productId);
        const seller = db.users.find((item) => item.id === order.sellerId);
        if (!db.sellerPayouts.some((item) => item.orderId === order.id)) {
          db.sellerPayouts.push({
            id: crypto.randomUUID(),
            sellerId: order.sellerId,
            orderId: order.id,
            amount: Math.max(order.amount - order.sellerPaystackFeeShare, 0),
            status: "pending_manual_payment",
            createdAt: nowIso()
          });
        }
        if (seller && product) queuedEmails.push(["manual_payout_pending", seller.email, { productTitle: product.title }]);
      }
    }

    for (const renewal of db.listingRenewals) {
      const product = db.products.find((item) => item.id === renewal.productId);
      const seller = db.users.find((item) => item.id === renewal.sellerId);
      if (!product || !seller || renewal.status !== "pending") continue;
      if (Date.parse(renewal.reminderSentAt) <= now && !renewal.confirmedAt) {
        queuedEmails.push(["listing_renewal_reminder", seller.email, { productTitle: product.title }]);
        renewal.reminderSentAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
      }
      if (Date.parse(renewal.confirmBy) <= now && !renewal.confirmedAt) {
        renewal.status = "expired_taken_down";
        product.status = "taken_down";
        product.updatedAt = nowIso();
        queuedEmails.push(["listing_taken_down_no_confirmation", seller.email, { productTitle: product.title }]);
      }
    }

    for (const ticket of db.eventTickets) {
      if (ticket.reminderSentAt) continue;
      const startsInHours = (Date.parse(ticket.eventStartsAt) - now) / (60 * 60 * 1000);
      if (startsInHours > 0 && startsInHours <= 24) {
        const buyer = db.users.find((item) => item.id === ticket.buyerId);
        if (buyer) queuedEmails.push(["event_ticket_reminder", buyer.email, { eventName: ticket.eventName, eventStartsAt: ticket.eventStartsAt }]);
        ticket.reminderSentAt = nowIso();
      }
    }
  });

  for (const args of queuedEmails) await sendNotification(...args);
  return NextResponse.json({ ok: true, sentOrQueued: queuedEmails.length });
}
