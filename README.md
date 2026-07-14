# Trust Bay - Next.js Version

This is the upgraded Trust Bay build using the Next.js App Router with nested route groups, dynamic routes, server actions, email/password auth, Google sign-in, Paystack hooks, real upload persistence, and a full email notification program.

## Main Folders

- `app/(market)` - landing market routes, digital products, physical marketplace, product detail.
- `app/(seller)` - seller choice, terms, approval, uploads, seller dashboard.
- `app/(admin)` - Admin/CEO dashboard.
- `app/api` - Google auth, Paystack initialize/webhook, scheduled notification checks.
- `lib/notifications.ts` - all email templates and sending logic.
- `lib/actions.ts` - server actions that mutate data and trigger notifications.

## Keys To Add

Copy `.env.example` to `.env.local` and replace the placeholders:

```env
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CRON_SECRET=
```

## Email Notifications Covered

- Account creation.
- Buyer terms accepted.
- Marketplace seller application submitted.
- Admin grants seller access.
- Seller application rejected.
- Upload saved pending Paystack payment.
- Upload fee payment successful.
- Product is live.
- Digital purchase confirmation for buyer.
- Digital sale notification for seller.
- Download access released.
- Digital dispute submitted.
- Dispute decision.
- Manual seller payout pending.
- Manual seller payout paid.
- New chat message.
- Product report received.
- Copyright complaint received.
- Product removed.
- Account removed.
- Physical listing renewal reminder.
- Listing taken down after no confirmation.
- Event ticket/order confirmation.
- Event ticket reminder.
- Marketplace safety reminder.

SMTP must be configured in `.env.local` for real emails to leave the app. If SMTP is missing, Trust Bay still writes each email attempt into the Admin notification log with status `skipped`, so you can see what would have been sent.

## Admin Access

Set two admin emails in `.env.local`:

```env
TRUST_BAY_ADMIN_EMAILS=ceo@example.com,superadmin@example.com
TRUST_BAY_NOTIFICATION_EMAILS=ceo@example.com,superadmin@example.com
```

The first email becomes `ceo`; the second becomes `super_admin`. Admins log in at `/admin/login`. The Admin dashboard also has a notification settings form where those two admin emails and extra notification copy emails can be updated.

## Payment Success

Paystack payments now use the stored transaction reference. Success can be confirmed by either:

- `/api/paystack/callback`, which verifies the Paystack reference immediately after redirect.
- `/api/paystack/webhook`, which handles Paystack webhook events.

Upload fee success marks the product `active`, shows it in the marketplace/product list, and sends upload/payment/product-live notifications. Digital purchase success releases the file, opens the 30-minute dispute window, and sends buyer/seller notifications.

## Run

```bash
npm install
npm run dev
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
npm.cmd run dev
```

The app stores local development data in `data/trust-bay.json` and uploads files to `public/uploads`.
