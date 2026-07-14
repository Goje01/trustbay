import { acceptDigitalSellerTerms } from "@/lib/actions";
import { Icons } from "@/components/icons";

export default function DigitalSellerTermsPage() {
  return (
    <main className="shell">
      <section className="page-title"><h1>Digital Seller Terms</h1><p>Ownership and copyright responsibility come before upload.</p></section>
      <section className="form-panel">
        <div className="flow-grid">
          <article className="flow-card"><strong><Icons.BadgeCheck size={18} /></strong><h2>Ownership</h2><p className="muted">You own the product or have the right to sell it.</p></article>
          <article className="flow-card"><strong><Icons.FileWarning size={18} /></strong><h2>No abuse</h2><p className="muted">No stolen, fake, illegal, or copyrighted material you do not own.</p></article>
          <article className="flow-card"><strong><Icons.WalletCards size={18} /></strong><h2>Fees</h2><p className="muted">Upload fees are not refundable after listing goes live.</p></article>
        </div>
        <form action={acceptDigitalSellerTerms} style={{ marginTop: 22 }}><button className="btn dark">Accept and Continue</button></form>
      </section>
    </main>
  );
}
