import "server-only";
import nodemailer from "nodemailer";
import { id, nowIso, readDb, updateDb } from "./db";
import { getNotificationEmails } from "./admin";
import type { NotificationLog, NotificationType } from "./types";

type TemplateData = Record<string, string | number | undefined>;

const subjects: Record<NotificationType, string> = {
  account_created: "Welcome to Trust Bay",
  buyer_terms_accepted: "Buyer terms accepted",
  seller_application_submitted: "Marketplace seller application received",
  seller_access_granted: "You can now start selling on Trust Bay",
  seller_application_rejected: "Marketplace seller application update",
  upload_fee_payment_successful: "Upload fee payment confirmed",
  product_live: "Your product is live on Trust Bay",
  product_uploaded_pending_payment: "Product upload saved, payment required",
  digital_purchase_successful_buyer: "Your Trust Bay purchase is confirmed",
  digital_purchase_successful_seller: "New digital sale on Trust Bay",
  download_access_released: "Download access is ready",
  digital_dispute_submitted: "Digital dispute submitted",
  dispute_decision: "Trust Bay dispute decision",
  manual_payout_pending: "Manual seller payout pending",
  manual_payout_paid: "Seller payout marked paid",
  new_chat_message: "New Trust Bay chat message",
  product_report_received: "Report received by Trust Bay",
  product_removed: "Product removed from Trust Bay",
  account_removed: "Trust Bay account removed",
  listing_renewal_reminder: "Confirm your listing is still available",
  listing_taken_down_no_confirmation: "Listing taken down after no confirmation",
  event_ticket_confirmation: "Event ticket/order confirmation",
  event_ticket_reminder: "Event reminder from Trust Bay",
  marketplace_safety_reminder: "Marketplace safety reminder",
  copyright_complaint_received: "Copyright complaint received"
};

const bodies: Record<NotificationType, (data: TemplateData) => string> = {
  account_created: (d) => `Hi ${d.name}, your Trust Bay account has been created successfully.`,
  buyer_terms_accepted: () => "Your buyer terms acceptance has been recorded.",
  seller_application_submitted: () => "Your marketplace seller application was received. An admin will review your documents.",
  seller_access_granted: () => "Your marketplace seller access has been approved. You can now upload physical products after accepting seller terms.",
  seller_application_rejected: (d) => `Your marketplace seller application was not approved. Reason: ${d.reason || "Not specified"}.`,
  upload_fee_payment_successful: (d) => `Your upload fee payment for ${d.productTitle} has been confirmed.`,
  product_live: (d) => `Payment confirmed and ${d.productTitle} is now live on Trust Bay.`,
  product_uploaded_pending_payment: (d) => `${d.productTitle} was saved. Complete the upload fee payment to publish it.`,
  digital_purchase_successful_buyer: (d) => `Your purchase of ${d.productTitle} is confirmed and download access is ready. You have 30 minutes to inspect and submit proof if there is a dispute.`,
  digital_purchase_successful_seller: (d) => `${d.productTitle} has been purchased. Payout becomes eligible after the dispute window closes.`,
  download_access_released: (d) => `Download access for ${d.productTitle} is ready. You have 30 minutes to inspect and submit proof if there is a dispute.`,
  digital_dispute_submitted: (d) => `A digital dispute was submitted for ${d.productTitle}. Admin review is required.`,
  dispute_decision: (d) => `A decision has been made on your Trust Bay dispute: ${d.decision || "Decision recorded"}.`,
  manual_payout_pending: (d) => `A manual payout is pending for ${d.productTitle}.`,
  manual_payout_paid: (d) => `Your seller payout of ${d.amount || ""} has been marked paid.`,
  new_chat_message: (d) => `You have a new message about ${d.productTitle}. Keep the conversation on Trust Bay for safety.`,
  product_report_received: (d) => `Your report for ${d.productTitle || "a listing"} has been received.`,
  product_removed: (d) => `${d.productTitle} has been removed from Trust Bay.`,
  account_removed: () => "This Trust Bay account has been removed due to a serious policy issue.",
  listing_renewal_reminder: (d) => `Is ${d.productTitle} still available? Confirm within 3 days or it will be taken down.`,
  listing_taken_down_no_confirmation: (d) => `${d.productTitle} was taken down because availability was not confirmed.`,
  event_ticket_confirmation: (d) => `Your event ticket/order for ${d.eventName} is confirmed.`,
  event_ticket_reminder: (d) => `Reminder: ${d.eventName} starts on ${d.eventStartsAt}.`,
  marketplace_safety_reminder: () => "Inspect before payment, meet in safe campus locations, and keep chat inside Trust Bay.",
  copyright_complaint_received: (d) => `A copyright complaint for ${d.productTitle || "a digital product"} has been received for admin review.`
};

// High-frequency, routine types that should NOT also CC both admin inboxes.
const skipAdminCopyTypes = new Set<NotificationType>([
  "new_chat_message",
  "digital_purchase_successful_buyer",
  "digital_purchase_successful_seller",
  "product_live"
]);

function transporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass || host.includes("PASTE_YOUR")) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user, pass }
  });
}

export async function sendNotification(type: NotificationType, recipientEmail: string, data: TemplateData = {}) {
  const subject = subjects[type];
  const text = bodies[type](data);
  const mailer = transporter();
  const db = await readDb();
  const normalizedRecipient = recipientEmail.toLowerCase();

  const recipients = skipAdminCopyTypes.has(type)
    ? [normalizedRecipient]
    : Array.from(new Set([normalizedRecipient, ...getNotificationEmails(db)])).filter(Boolean);

  const logs: NotificationLog[] = [];

  for (const recipient of recipients) {
    let status: "sent" | "skipped" | "failed" = "skipped";
    let error: string | undefined;

    try {
      if (mailer) {
        await mailer.sendMail({
          from: process.env.SMTP_FROM || "Trust Bay <notifications@trustbay.local>",
          to: recipient,
          subject: recipient === normalizedRecipient ? subject : `[Admin copy] ${subject}`,
          text
        });
        status = "sent";
      }
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : "Unknown email failure";
    }

    logs.push({
      id: id("mail"),
      type,
      recipientEmail: recipient,
      subject: recipient === normalizedRecipient ? subject : `[Admin copy] ${subject}`,
      status,
      error,
      createdAt: nowIso()
    });
  }

  await updateDb((db) => {
    db.notificationLogs.push(...logs);
  });
}