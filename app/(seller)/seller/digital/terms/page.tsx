import { acceptDigitalSellerTerms } from "@/lib/actions";
import { Icons } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";

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

        <form className="form-grid" action={acceptDigitalSellerTerms} style={{ marginTop: 22 }}>
          <label className="field">Bank name<input name="bankName" type="text" required /></label>
          <label className="field">Account number<input name="bankAccountNumber" type="text" required /></label>
          <label className="field">
            Account name
            <input name="bankAccountName" type="text" required />
            <small style={{ display: "block", marginTop: 4, color: "#b45309" }}>
              ⚠️ Enter the exact full name on the bank account — it must match the account number exactly, or your payout may fail or go to the wrong person.
            </small>
          </label>
          <SubmitButton>Accept and Continue</SubmitButton>
        </form>
      </section>
    </main>
  );
}