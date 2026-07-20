"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { bannedKeywordFlags, termsVersions } from "./constants";
import { getCurrentUser } from "./auth";
import { getAdminRole } from "./admin-session";
import { id, nowIso, slugify, updateDb } from "./db";
import { calculateUploadFee, estimatePaystackFeeSplit } from "./money";
import { sendNotification } from "./notifications";
import { hashPassword } from "./password";
import { roleForEmail } from "./admin";
import type { ProductType, SellerStatus } from "./types";
import { v2 as cloudinary } from "cloudinary";

function required(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value || fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

async function saveUploadedFile(
  file: FormDataEntryValue | null,
  resourceType: "image" | "raw" = "image"
) {
  console.log("[saveUploadedFile] input:", {
    isFile: file instanceof File,
    name: file instanceof File ? file.name : typeof file,
    size: file instanceof File ? file.size : null,
    type: file instanceof File ? file.type : null,
    resourceType
  });

  if (!(file instanceof File) || !file.name || file.size === 0) {
    console.log("[saveUploadedFile] rejected: not a valid File or empty");
    return undefined;
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  console.log("[saveUploadedFile] buffer length:", bytes.length);

  return new Promise<string | undefined>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "trustbay", resource_type: resourceType },
      (error: any, result: any) => {
        if (error) {
          console.log("[saveUploadedFile] cloudinary error:", error.message || error);
          reject(error);
          return;
        }
        if (!result) {
          console.log("[saveUploadedFile] cloudinary returned no result");
          reject(new Error("No result from Cloudinary"));
          return;
        }
        console.log("[saveUploadedFile] success:", result.secure_url);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(bytes);
  });
}

export async function acceptBuyerTerms() {
  const user = await requireUser();
  await updateDb((db) => {
    db.termsAcceptances.push({
      id: id("term"),
      userId: user.id,
      termType: "buyer_terms",
      version: termsVersions.buyer,
      acceptedAt: nowIso()
    });
  });
  redirect("/seller/choice");
}

export async function registerAccount(formData: FormData) {
  const fullName = required(formData.get("fullName"));
  const email = required(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!fullName || !email || !password) redirect("/register?error=missing");
  if (password.length < 8) redirect("/register?error=short-password");
  if (password !== confirmPassword) redirect("/register?error=password-mismatch");

  let created = false;
  await updateDb((db) => {
    const existing = db.users.find((user) => user.email === email);
    if (existing) return;

    db.users.push({
      id: id("usr"),
      googleSub: "",
      fullName,
      email,
      phone: required(formData.get("phone")),
      department: required(formData.get("department")),
      level: required(formData.get("level")),
      matricNumberEncrypted: required(formData.get("matricNumber")),
      profilePhotoUrl: "",
      passwordHash: hashPassword(password),
      role: roleForEmail(email, db),
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
    created = true;
  });

  if (!created) redirect("/login?error=account-exists");
  await sendNotification("account_created", email, { name: fullName });
  redirect("/login?created=1");
}

export async function acceptDigitalSellerTerms(formData: FormData) {
  const user = await requireUser();
  const bankName = required(formData.get("bankName"));
  const bankAccountNumber = required(formData.get("bankAccountNumber"));
  const bankAccountName = required(formData.get("bankAccountName"));

  await updateDb((db) => {
    db.termsAcceptances.push({
      id: id("term"),
      userId: user.id,
      termType: "digital_seller_terms",
      version: termsVersions.digitalSeller,
      acceptedAt: nowIso()
    });
    if (!db.sellerProfiles.some((profile) => profile.userId === user.id && profile.sellerType === "digital")) {
      db.sellerProfiles.push({
        id: id("seller"),
        userId: user.id,
        sellerType: "digital",
        status: "not_required",
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
    }

    const userRecord = db.users.find((item) => item.id === user.id);
    if (userRecord) {
      if (bankName) userRecord.bankName = bankName;
      if (bankAccountNumber) userRecord.bankAccountNumber = bankAccountNumber;
      if (bankAccountName) userRecord.bankAccountName = bankAccountName;
      userRecord.updatedAt = nowIso();
    }
  });
  redirect("/seller/digital/upload");
}

export async function acceptMarketplaceWarning() {
  const user = await requireUser();
  let alreadyAccepted = false;

  await updateDb((db) => {
    alreadyAccepted = db.termsAcceptances.some(
      (t) => t.userId === user.id && t.termType === "marketplace_warning"
    );
    if (!alreadyAccepted) {
      db.termsAcceptances.push({
        id: id("term"),
        userId: user.id,
        termType: "marketplace_warning",
        version: termsVersions.marketplaceWarning,
        acceptedAt: nowIso()
      });
    }
  });

  if (!alreadyAccepted) {
    await sendNotification("marketplace_safety_reminder", user.email, {});
  }
  redirect("/marketplace");
}

export async function acceptMarketplaceSellerTerms() {
  const user = await requireUser();
  await updateDb((db) => {
    db.termsAcceptances.push({
      id: id("term"),
      userId: user.id,
      termType: "marketplace_seller_terms",
      version: termsVersions.marketplaceSeller,
      acceptedAt: nowIso()
    });
  });
  redirect("/seller/marketplace/upload");
}

export async function submitMarketplaceApplication(formData: FormData) {
  const user = await requireUser();
  const idPhotoUrl = await saveUploadedFile(formData.get("idPhoto"));
  const biodataPhotoUrl = await saveUploadedFile(formData.get("biodataPhoto"));
  const fullName = required(formData.get("fullName"));
  const matricNumber = required(formData.get("matricNumber"));
  const department = required(formData.get("department"));
  const level = required(formData.get("level"));
  const bankName = required(formData.get("bankName"));
  const bankAccountNumber = required(formData.get("bankAccountNumber"));
  const bankAccountName = required(formData.get("bankAccountName"));

  await updateDb((db) => {
    const existing = db.sellerProfiles.find((profile) => profile.userId === user.id && profile.sellerType === "physical");
    const payload = {
      idPhotoUrl,
      biodataPhotoUrl,
      schoolInfo: required(formData.get("schoolInfo")),
      status: "pending" as SellerStatus,
      updatedAt: nowIso()
    };
    if (existing) Object.assign(existing, payload);
    else {
      db.sellerProfiles.push({
        id: id("seller"),
        userId: user.id,
        sellerType: "physical",
        createdAt: nowIso(),
        ...payload
      });
    }

    const userRecord = db.users.find((item) => item.id === user.id);
    if (userRecord) {
      if (fullName) userRecord.fullName = fullName;
      if (matricNumber) userRecord.matricNumberEncrypted = matricNumber;
      if (department) userRecord.department = department;
      if (level) userRecord.level = level;
      if (bankName) userRecord.bankName = bankName;
      if (bankAccountNumber) userRecord.bankAccountNumber = bankAccountNumber;
      if (bankAccountName) userRecord.bankAccountName = bankAccountName;
      userRecord.updatedAt = nowIso();
    }
  });
  redirect("/seller");
}

export async function requestPasswordReset(formData: FormData) {
  const email = required(formData.get("email")).toLowerCase();
  const token = crypto.randomUUID().replaceAll("-", "");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  let matchedEmail = "";
  let matchedName = "";

  await updateDb((db) => {
    const user = db.users.find((item) => item.email === email);
    if (user) {
      user.resetToken = token;
      user.resetTokenExpiresAt = expiresAt;
      user.updatedAt = nowIso();
      matchedEmail = user.email;
      matchedName = user.fullName;
    }
  });

  if (matchedEmail) {
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    await sendNotification("password_reset_requested", matchedEmail, { resetUrl, name: matchedName });
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData) {
  const token = required(formData.get("token"));
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!token) redirect("/forgot-password");
  if (password.length < 8) redirect(`/reset-password?token=${token}&error=short-password`);
  if (password !== confirmPassword) redirect(`/reset-password?token=${token}&error=mismatch`);

  let success = false;

  await updateDb((db) => {
    const user = db.users.find(
      (item) => item.resetToken === token && item.resetTokenExpiresAt && new Date(item.resetTokenExpiresAt) > new Date()
    );
    if (user) {
      user.passwordHash = hashPassword(password);
      user.resetToken = undefined;
      user.resetTokenExpiresAt = undefined;
      user.updatedAt = nowIso();
      success = true;
    }
  });

  if (success) redirect("/login?created=1");
  redirect("/forgot-password");
}

export async function createProduct(productType: ProductType, formData: FormData) {
  const user = await requireUser();
  const title = required(formData.get("title"));
  const price = parseNumber(formData.get("price"));
  const quantity = Math.max(1, parseNumber(formData.get("quantity"), 1));
  const uploadFeeAmount = calculateUploadFee(price, quantity);
  const textToFlag = `${title} ${required(formData.get("description"))}`.toLowerCase();
  const hasRiskFlag = bannedKeywordFlags.some((flag) => textToFlag.includes(flag));
  let productId = "";
  const coverImageUrl = await saveUploadedFile(formData.get("coverImage"));
  const fileUrl = productType === "digital" ? await saveUploadedFile(formData.get("digitalFile"), "raw") : undefined;
  const imageUrls = [
    await saveUploadedFile(formData.get("imageOne")),
    await saveUploadedFile(formData.get("imageTwo"))
  ].filter(Boolean) as string[];

  await updateDb((db) => {
    if (productType === "physical") {
      const profile = db.sellerProfiles.find((item) => item.userId === user.id && item.sellerType === "physical");
      if (!profile || profile.status !== "approved") throw new Error("Marketplace seller approval is required.");
    }

    const baseSlug = slugify(title);
    const slug = db.products.some((product) => product.slug === baseSlug) ? `${baseSlug}-${Date.now()}` : baseSlug;
    productId = id("prd");
    db.products.push({
      id: productId,
      sellerId: user.id,
      productType,
      title,
      slug,
      description: required(formData.get("description")),
      category: required(formData.get("category")) || "Others",
      price,
      quantity,
      remainingQuantity: quantity,
      condition: productType === "physical" ? (required(formData.get("condition")) as "New" | "Used" | "Fairly Used") : "",
      location: required(formData.get("location")),
      status: "awaiting_upload_payment",
      coverImageUrl,
      fileUrl,
      imageUrls,
      uploadFeeAmount,
      uploadFeePaid: false,
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
    db.uploadPayments.push({
      id: id("pay"),
      sellerId: user.id,
      productId,
      amount: uploadFeeAmount,
      paystackReference: `UP-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
      status: "pending",
      createdAt: nowIso()
    });
    if (hasRiskFlag) {
      db.reports.push({
        id: id("rep"),
        reporterId: user.id,
        reportedUserId: user.id,
        productId,
        type: "Automated keyword flag",
        description: "Product contains a keyword that needs admin attention.",
        status: "submitted",
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
    }
  });

  redirect(`/api/paystack/initialize?type=upload_fee&id=${productId}`);
}

export async function startDigitalCheckout(slug: string, formData: FormData) {
  const buyer = await requireUser();
  const accepted = formData.get("acceptTerms") === "on";
  if (!accepted) redirect(`/checkout/digital/${slug}`);

  let orderId = "";

  await updateDb((db) => {
    const product = db.products.find((item) => item.slug === slug && item.productType === "digital" && item.status === "active");
    if (!product) throw new Error("Digital product is not active.");
    const split = estimatePaystackFeeSplit(product.price);
    orderId = id("ord");
    db.digitalOrders.push({
      id: orderId,
      buyerId: buyer.id,
      sellerId: product.sellerId,
      productId: product.id,
      amount: product.price,
      buyerPaystackFeeShare: split.buyerShare,
      sellerPaystackFeeShare: split.sellerShare,
      paystackReference: `TB-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
      status: "pending_payment",
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
  });

  redirect(`/api/paystack/initialize?type=digital_order&id=${orderId}`);
}

export async function startChat(productId: string) {
  const buyer = await requireUser();
  let chatId = "";
  await updateDb((db) => {
    const product = db.products.find((item) => item.id === productId);
    if (!product) throw new Error("Product not found.");
    const existing = db.chats.find(
      (item) => item.buyerId === buyer.id && item.sellerId === product.sellerId
    );
    if (existing) {
      chatId = existing.id;
      return;
    }
    chatId = id("chat");
    db.chats.push({ id: chatId, productId: product.id, buyerId: buyer.id, sellerId: product.sellerId, createdAt: nowIso() });
  });
  redirect(`/chat/${chatId}`);
}

export async function sendChatMessage(chatId: string, formData: FormData) {
  const user = await requireUser();
  let recipientEmail = "";
  let productTitle = "";
  const attachmentUrl = await saveUploadedFile(formData.get("attachment"));
  await updateDb((db) => {
    const chat = db.chats.find((item) => item.id === chatId);
    if (!chat || ![chat.buyerId, chat.sellerId].includes(user.id)) throw new Error("Chat not found.");
    db.messages.push({
      id: id("msg"),
      chatId,
      senderId: user.id,
      message: required(formData.get("message")),
      attachmentUrl,
      createdAt: nowIso()
    });
    const product = db.products.find((item) => item.id === chat.productId);
    productTitle = product?.title || "a product";
    const recipientId = chat.buyerId === user.id ? chat.sellerId : chat.buyerId;
    recipientEmail = db.users.find((item) => item.id === recipientId)?.email || "";
  });
  if (recipientEmail) await sendNotification("new_chat_message", recipientEmail, { productTitle });
  revalidatePath(`/chat/${chatId}`);
}

export async function submitReport(formData: FormData) {
  const user = await requireUser();
  let productTitle = "";
  const proofUrl = await saveUploadedFile(formData.get("proof"));
  await updateDb((db) => {
    const product = db.products.find((item) => item.id === required(formData.get("productId")));
    productTitle = product?.title || "a listing";
    db.reports.push({
      id: id("rep"),
      reporterId: user.id,
      reportedUserId: product?.sellerId,
      productId: product?.id,
      orderId: required(formData.get("orderId")) || undefined,
      type: required(formData.get("type")),
      description: required(formData.get("description")),
      proofUrl,
      status: "submitted",
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
  });
  await sendNotification("product_report_received", user.email, { productTitle });
  redirect("/");
}

export async function adminReviewSeller(formData: FormData) {
  const role = await getAdminRole();
  if (role !== "ceo" && role !== "super_admin") throw new Error("Admin access required.");
  let sellerEmail = "";
  let status = required(formData.get("status")) as SellerStatus;
  let reason = required(formData.get("reason"));
  await updateDb((db) => {
    const profile = db.sellerProfiles.find((item) => item.id === required(formData.get("profileId")));
    if (!profile) throw new Error("Profile not found.");
    profile.status = status;
    profile.rejectionReason = reason;
    profile.reviewedBy = role;
    profile.reviewedAt = nowIso();
    profile.updatedAt = nowIso();
    sellerEmail = db.users.find((item) => item.id === profile.userId)?.email || "";
  });
  if (sellerEmail && status === "approved") await sendNotification("seller_access_granted", sellerEmail, {});
  if (sellerEmail && status === "rejected") await sendNotification("seller_application_rejected", sellerEmail, { reason });
  if (sellerEmail && status === "removed") await sendNotification("account_removed", sellerEmail, {});
  revalidatePath("/admin");
}

export async function adminUpdateProduct(formData: FormData) {
  const role = await getAdminRole();
  if (role !== "ceo" && role !== "super_admin") throw new Error("Admin access required.");
  let sellerEmail = "";
  let productTitle = "";
  let status = required(formData.get("status"));
  await updateDb((db) => {
    const product = db.products.find((item) => item.id === required(formData.get("productId")));
    if (!product) throw new Error("Product not found.");
    product.status = status as never;
    product.updatedAt = nowIso();
    productTitle = product.title;
    sellerEmail = db.users.find((item) => item.id === product.sellerId)?.email || "";
  });
  if (sellerEmail && status === "removed") await sendNotification("product_removed", sellerEmail, { productTitle });
  revalidatePath("/admin");
}

export async function updateAdminNotificationSettings(formData: FormData) {
  const role = await getAdminRole();
  if (role !== "ceo" && role !== "super_admin") throw new Error("Admin access required.");

  const adminEmails = [required(formData.get("adminEmailOne")), required(formData.get("adminEmailTwo"))]
    .map((email) => email.toLowerCase())
    .filter(Boolean);
  const notificationEmails = String(formData.get("notificationEmails") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  await updateDb((db) => {
    db.platformSettings = {
      adminEmails,
      notificationEmails,
      updatedAt: nowIso()
    };

    for (const user of db.users) {
      if (adminEmails[0] === user.email) user.role = "ceo";
      else if (adminEmails[1] === user.email) user.role = "super_admin";
    }
  });

  revalidatePath("/admin");
}