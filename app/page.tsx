import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Icons } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { readDb } from "@/lib/db";

export default async function Home({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string }> }) {
  const params = await searchParams;
  const query = (params?.q || "").toLowerCase();
  const category = params?.category || "";
  const db = await readDb();
  const products = db.products
    .filter((product) => product.status === "active")
    .filter((product) => !query || `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(query))
    .filter((product) => !category || product.category === category);

  return (
    <main>
      <section className="shell hero">
        <div className="hero-copy">
          <p className="eyebrow"><Icons.ShieldCheck size={16} /> Student-only campus commerce</p>
          <h1>Trust Bay</h1>
          <p>
            A polished campus marketplace for digital products, verified physical sellers, protected records,
            Paystack-powered payments, and safety-first student transactions.
          </p>
          <div className="hero-actions">
            <Link className="btn lime" href="/seller/choice"><Icons.Upload size={18} /> Become a Seller</Link>
            <Link className="btn" href="/marketplace/warning"><Icons.Store size={18} /> Enter Marketplace</Link>
            <Link className="btn ghost" href="/digital"><Icons.Download size={18} /> Digital Products</Link>
          </div>

          <div className="trust-strip">
            <div><strong>30 min</strong><span>digital dispute window</span></div>
            <div><strong>Google</strong><span> Account sign-in</span></div>
            <div><strong>Admin</strong><span>seller access control</span></div>
          </div>
        </div>

        <aside className="hero-panel">
          <div className="market-console">
            <div className="console-top">
              <strong>Marketplace Control</strong>
              <span className="pill active"><Icons.Bell size={14} /> Email alerts on</span>
            </div>
            <div className="console-tabs">
              <Link className="pill active" href="/">All</Link>
              <Link className="pill" href="/digital">Digital</Link>
              <Link className="pill" href="/marketplace/warning">Physical</Link>
              <Link className="pill" href="/seller">Seller dashboard</Link>
            </div>
          </div>

          <div className="insight-card">
            <h2>Built for real campus risk</h2>
            <p className="muted">Listings go live after upload payment, while reports, chats, warnings, and admin removal keep the marketplace controlled.</p>
            <div className="insight-list">
              <div><span className="icon-tile"><Icons.MessageCircle size={18} /></span><span>Chat records stay on Trust Bay for dispute support.</span></div>
              <div><span className="icon-tile"><Icons.WalletCards size={18} /></span><span>Digital checkout and upload fees route through Paystack.</span></div>
              <div><span className="icon-tile"><Icons.FileWarning size={18} /></span><span>Reports cover fake, stolen, illegal, unsafe, and copyright issues.</span></div>
            </div>
          </div>

          <div className="flow-card">
            <strong>UX</strong>
            <h2>No dead ends</h2>
            <p className="muted">Every risky action has a terms gate, a clear next step, and an email trail for the user.</p>
          </div>
        </aside>
      </section>

      <section className="shell section">
        <div className="section-head">
          <div>
            <h2>Live Listings</h2>
            <p>{products.length ? "Fresh products from student sellers." : "The marketplace is ready for real seller uploads."}</p>
          </div>
          <Link className="btn dark" href="/seller/choice">Upload Product</Link>
        </div>
        {products.length ? (
          <div className="product-grid">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <EmptyState title="No live listings yet" body="Trust Bay stays clean until real sellers upload products and complete upload-fee payment." />
        )}
      </section>

      <section className="shell section">
        <div className="section-head">
          <div>
            <h2>How Trust Bay Handles It</h2>
            <p>Digital selling and physical selling are separated because they carry different risks.</p>
          </div>
        </div>
        <div className="flow-grid">
          <article className="flow-card">
            <strong>01</strong>
            <h2>Choose what to sell</h2>
            <p className="muted">Sellers choose digital product or physical marketplace before any upload flow begins.</p>
          </article>
          <article className="flow-card">
            <strong>02</strong>
            <h2>Pay upload fee</h2>
            <p className="muted">Upload fees are calculated from price and quantity, then routed to Paystack.</p>
          </article>
          <article className="flow-card">
            <strong>03</strong>
            <h2>Email trail</h2>
            <p className="muted">Users receive key account, approval, purchase, renewal, payout, report, and event reminders.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
