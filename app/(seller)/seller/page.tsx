import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Icons } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function SellerDashboardPage({ searchParams }: { searchParams?: Promise<{ payment?: string; reference?: string; amount?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const db = await readDb();
  const products = user ? db.products.filter((product) => product.sellerId === user.id) : [];
  const payments = user ? db.uploadPayments.filter((payment) => payment.sellerId === user.id) : [];
  const orders = user ? db.digitalOrders.filter((order) => order.sellerId === user.id) : [];
  const chats = user ? db.chats.filter((chat) => chat.sellerId === user.id || chat.buyerId === user.id) : [];
  const marketplaceProfile = user ? db.sellerProfiles.find((profile) => profile.userId === user.id && profile.sellerType === "physical") : null;

  const unreadCount = user
    ? chats.filter((chat) => {
        const chatMessages = db.messages
          .filter((item) => item.chatId === chat.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        const lastMessage = chatMessages[chatMessages.length - 1];
        return lastMessage ? lastMessage.senderId !== user.id : false;
      }).length
    : 0;

  return (
    <main className="shell">
      <section className="page-title">
        <h1>Seller Dashboard</h1>
        <p>Track products, upload fees, digital sales, chats, reports, renewals, and manual payouts.</p>
      </section>

      {params?.payment === "successful" ? (
        <section className="notice">
          Payment confirmed. Your product has been activated and email notifications were queued.
        </section>
      ) : null}

      {params?.payment === "pending" ? (
        <section className="notice">
          Paystack is not configured yet. Payment record created: {params.reference} for {formatMoney(Number(params.amount || 0))}.
        </section>
      ) : null}

      {params?.payment === "unverified" ? (
        <section className="form-error">
          Paystack could not verify this payment yet. If the debit succeeded, the webhook can still confirm it automatically.
        </section>
      ) : null}

      <section className="dashboard-panel">
        <div className="metric-grid">
          <div className="metric"><span>Marketplace status</span><strong>{marketplaceProfile?.status || "not applied"}</strong></div>
          <div className="metric"><span>Products</span><strong>{products.length}</strong></div>
          <div className="metric"><span>Digital sales</span><strong>{orders.length}</strong></div>
          <div className="metric"><span>Chats</span><strong>{chats.length}</strong></div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
          <Link className="btn dark" href="/seller/choice"><Icons.Upload size={18} /> Upload New Product</Link>
          <Link className="btn ghost" href="/seller/marketplace/apply">Marketplace Approval</Link>
          <Link className="btn ghost" href="/messages">
            Messages {unreadCount > 0 ? `(${unreadCount} new)` : ""}
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Products</h2></div>
        {products.length ? (
          <div className="table"><table><tbody>
            <tr><th>Title</th><th>Type</th><th>Status</th><th>Upload fee</th><th>Created</th></tr>
            {products.map((product) => <tr key={product.id}><td>{product.title}</td><td>{product.productType}</td><td>{product.status}</td><td>{formatMoney(product.uploadFeeAmount)}</td><td>{new Date(product.createdAt).toLocaleString()}</td></tr>)}
          </tbody></table></div>
        ) : <EmptyState title="No seller products yet" body="Your uploaded products will appear here after you choose a selling path." />}
      </section>

      <section className="section">
        <div className="section-head"><h2>Upload Payments</h2></div>
        <div className="table"><table><tbody>
          <tr><th>Reference</th><th>Amount</th><th>Status</th><th>Paid at</th></tr>
          {payments.map((payment) => <tr key={payment.id}><td>{payment.paystackReference}</td><td>{formatMoney(payment.amount)}</td><td>{payment.status}</td><td>{payment.paidAt || "-"}</td></tr>)}
        </tbody></table></div>
      </section>
    </main>
  );
}