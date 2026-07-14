import "server-only";
import crypto from "crypto";
import { nowIso, updateDb } from "./db";
import { sendNotification } from "./notifications";

export async function completeSuccessfulPayment(reference: string) {
  let redirectPath = "/seller?payment=unknown";
  const queuedEmails: Array<Parameters<typeof sendNotification>> = [];

  await updateDb((db) => {
    const uploadPayment = db.uploadPayments.find((item) => item.paystackReference === reference);
    if (uploadPayment) {
      if (uploadPayment.status === "successful") {
        const existingProduct = db.products.find((item) => item.id === uploadPayment.productId);
        redirectPath = existingProduct ? `/seller?payment=successful&product=${existingProduct.slug}` : "/seller?payment=successful";
        return;
      }
      uploadPayment.status = "successful";
      uploadPayment.paidAt = nowIso();
      const product = db.products.find((item) => item.id === uploadPayment.productId);
      const seller = db.users.find((item) => item.id === uploadPayment.sellerId);

      if (product) {
        product.status = "active";
        product.uploadFeePaid = true;
        product.updatedAt = nowIso();
        redirectPath = `/seller?payment=successful&product=${product.slug}`;

        if (product.productType === "physical" && !db.listingRenewals.some((item) => item.productId === product.id && item.status === "pending")) {
          db.listingRenewals.push({
            id: crypto.randomUUID(),
            productId: product.id,
            sellerId: product.sellerId,
            reminderSentAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            confirmBy: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "pending"
          });
        }

        if (seller) {
          queuedEmails.push(["product_live", seller.email, { productTitle: product.title }]);
        }
      }
      return;
    }

    const order = db.digitalOrders.find((item) => item.paystackReference === reference);
    if (order) {
      if (order.status !== "pending_payment") {
        redirectPath = `/download/${order.id}?payment=successful`;
        return;
      }
      order.status = "download_released";
      order.disputeDeadlineAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      order.updatedAt = nowIso();
      redirectPath = `/download/${order.id}?payment=successful`;

      const product = db.products.find((item) => item.id === order.productId);
      const buyer = db.users.find((item) => item.id === order.buyerId);
      const seller = db.users.find((item) => item.id === order.sellerId);

      if (buyer && product) {
        queuedEmails.push(["digital_purchase_successful_buyer", buyer.email, { productTitle: product.title }]);
      }
      if (seller && product) queuedEmails.push(["digital_purchase_successful_seller", seller.email, { productTitle: product.title }]);
    }
  });

  for (const args of queuedEmails) await sendNotification(...args);
  return redirectPath;
}

export async function verifyPaystackReference(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY || "";
  if (!secret || secret.includes("PASTE_YOUR")) return false;

  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store"
  });
  if (!response.ok) return false;
  const payload = await response.json();
  return payload?.data?.status === "success";
}