import { Icons } from "@/components/icons";
import { acceptBuyerTerms } from "@/lib/actions";

export default function BuyerTermsPage() {
  return (
    <main className="shell">
      <section className="page-title">
        <h1>Buyer Terms</h1>
        <p>Trust Bay requires buyers to understand the transaction rules before risky actions.</p>
      </section>
      <section className="form-panel">
        <div className="flow-grid">
          <article className="flow-card"><strong><Icons.Download size={18} /></strong><h2>Digital disputes</h2><p className="muted">Digital disputes must be submitted within 30 minutes with proof.</p></article>
          <article className="flow-card"><strong><Icons.ShieldCheck size={18} /></strong><h2>Physical inspection</h2><p className="muted">Inspect physical items before payment. Trust Bay does not guarantee item condition.</p></article>
          <article className="flow-card"><strong><Icons.MessageCircle size={18} /></strong><h2>Chat records</h2><p className="muted">Use Trust Bay chat so records exist if an issue happens.</p></article>
        </div>
        <form action={acceptBuyerTerms} style={{ marginTop: 22 }}>
          <button className="btn dark">I Accept Buyer Terms</button>
        </form>
      </section>
    </main>
  );
}
