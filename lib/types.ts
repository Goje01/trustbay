export type Role = "buyer" | "seller" | "super_admin" | "ceo";
export type ProductType = "digital" | "physical";
export type ProductStatus = "draft" | "awaiting_upload_payment" | "active" | "sold" | "taken_down" | "removed";
export type SellerStatus = "not_required" | "pending" | "approved" | "rejected" | "removed";
export type ReportStatus = "submitted" | "reviewing" | "resolved" | "rejected";
export type OrderStatus = "pending_payment" | "paid" | "download_released" | "disputed" | "accepted" | "refunded";

export type User = {
  id: string;
  googleSub: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  level: string;
  matricNumberEncrypted: string;
  profilePhotoUrl: string;
  passwordHash?: string;
  role: Role;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  resetToken?: string;
  resetTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SellerProfile = {
  id: string;
  userId: string;
  sellerType: ProductType;
  status: SellerStatus;
  idPhotoUrl?: string;
  biodataPhotoUrl?: string;
  schoolInfo?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  sellerId: string;
  productType: ProductType;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  remainingQuantity: number;
  condition?: "New" | "Used" | "Fairly Used" | "";
  location?: string;
  status: ProductStatus;
  coverImageUrl?: string;
  fileUrl?: string;
  imageUrls: string[];
  uploadFeeAmount: number;
  uploadFeePaid: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UploadPayment = {
  id: string;
  sellerId: string;
  productId: string;
  amount: number;
  paystackReference: string;
  status: "pending" | "successful" | "failed";
  createdAt: string;
  paidAt?: string;
};

export type DigitalOrder = {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  amount: number;
  buyerPaystackFeeShare: number;
  sellerPaystackFeeShare: number;
  paystackReference: string;
  status: OrderStatus;
  disputeDeadlineAt?: string;
  downloadedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SellerPayout = {
  id: string;
  sellerId: string;
  orderId: string;
  amount: number;
  status: "pending_manual_payment" | "paid" | "withheld";
  createdAt: string;
  paidBy?: string;
  paidAt?: string;
  note?: string;
};

export type Chat = {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  createdAt: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  attachmentUrl?: string;
  createdAt: string;
};

export type Report = {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  productId?: string;
  orderId?: string;
  type: string;
  description: string;
  proofUrl?: string;
  status: ReportStatus;
  adminDecision?: string;
  createdAt: string;
  updatedAt: string;
};

export type ListingRenewal = {
  id: string;
  productId: string;
  sellerId: string;
  reminderSentAt: string;
  confirmBy: string;
  confirmedAt?: string;
  status: "pending" | "confirmed" | "expired_taken_down";
};

export type EventTicket = {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  eventName: string;
  eventStartsAt: string;
  reminderSentAt?: string;
  createdAt: string;
};

export type TermsAcceptance = {
  id: string;
  userId: string;
  termType: string;
  version: string;
  acceptedAt: string;
  ipAddress?: string;
};

export type NotificationLog = {
  id: string;
  type: NotificationType;
  recipientEmail: string;
  subject: string;
  status: "sent" | "skipped" | "failed";
  error?: string;
  createdAt: string;
};

export type PlatformSettings = {
  adminEmails: string[];
  notificationEmails: string[];
  updatedAt?: string;
};

export type NotificationType =
  | "account_created"
  | "buyer_terms_accepted"
  | "seller_application_submitted"
  | "seller_access_granted"
  | "seller_application_rejected"
  | "upload_fee_payment_successful"
  | "product_live"
  | "product_uploaded_pending_payment"
  | "digital_purchase_successful_buyer"
  | "digital_purchase_successful_seller"
  | "download_access_released"
  | "digital_dispute_submitted"
  | "dispute_decision"
  | "manual_payout_pending"
  | "manual_payout_paid"
  | "new_chat_message"
  | "product_report_received"
  | "product_removed"
  | "account_removed"
  | "listing_renewal_reminder"
  | "listing_taken_down_no_confirmation"
  | "event_ticket_confirmation"
  | "event_ticket_reminder"
  | "marketplace_safety_reminder"
  | "copyright_complaint_received"
  | "password_reset_requested";

export type TrustBayData = {
  users: User[];
  sellerProfiles: SellerProfile[];
  products: Product[];
  uploadPayments: UploadPayment[];
  digitalOrders: DigitalOrder[];
  sellerPayouts: SellerPayout[];
  chats: Chat[];
  messages: Message[];
  reports: Report[];
  listingRenewals: ListingRenewal[];
  eventTickets: EventTicket[];
  termsAcceptances: TermsAcceptance[];
  notificationLogs: NotificationLog[];
  platformSettings: PlatformSettings;
};