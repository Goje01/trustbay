import { acceptMarketplaceSellerTerms } from "@/lib/actions";
import { Icons } from "@/components/icons";

export default function MarketplaceTermsPage() {
  return (
    <main className="shell">
      <section className="page-title"><h1>Marketplace Seller Terms</h1><p>Physical marketplace rules protect buyers, sellers, and the school community.</p></section>
      <section className="form-panel">
        <div className="flow-grid">
          <article className="flow-card"><strong><Icons.BadgeCheck size={18} /></strong><h2>Genuine products</h2><p className="muted">No stolen, fake, illegal, unsafe products, or school fraud materials.</p></article>
          <article className="flow-card"><strong><Icons.ShieldCheck size={18} /></strong><h2>Inspection advised</h2><p className="muted">Buyers are told to inspect before payment and chat on-platform.</p></article>
          <article className="flow-card"><strong><Icons.FileWarning size={18} /></strong><h2>Removal policy</h2><p className="muted">Trust Bay can remove listings or accounts for serious abuse.</p></article>
        </div>
        <form action={acceptMarketplaceSellerTerms} style={{ marginTop: 22 }}><button className="btn dark">Accept and Upload Physical Product</button></form>
      </section>
    </main>
  );
}
