import Link from "next/link";
import { Icons } from "@/components/icons";

export default function SellerChoicePage() {
  return (
    <main className="shell">
      <section className="page-title">
        <h1>What do you want to sell?</h1>
        <p>The first seller decision controls the rules, terms, approval, and upload path.</p>
      </section>
      <section className="flow-grid">
        <Link className="flow-card" href="/seller/digital/terms">
          <strong><Icons.Download size={18} /></strong>
          <h2>Intellectual Property / Digital Product</h2>
          <p className="muted">Ebooks, games, software, templates, designs, notes, courses, music packs, and owned files.</p>
        </Link>
        <Link className="flow-card" href="/seller/marketplace/apply">
          <strong><Icons.Store size={18} /></strong>
          <h2>Marketplace / Physical Product</h2>
          <p className="muted">Phones, perfume, hostel items, books, food, fashion, gadgets, furniture, and campus items.</p>
        </Link>
        <Link className="flow-card" href="/seller">
          <strong><Icons.LayoutDashboard size={18} /></strong>
          <h2>Seller Dashboard</h2>
          <p className="muted">Track products, upload payments, digital sales, chats, reports, renewals, and payout status.</p>
        </Link>
      </section>
    </main>
  );
}
