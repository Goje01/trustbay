import { submitMarketplaceApplication } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import Link from "next/link";

export default async function MarketplaceApplyPage() {
  const user = await getCurrentUser();
  const db = await readDb();
  const profile = user
    ? db.sellerProfiles.find((item) => item.userId === user.id && item.sellerType === "physical")
    : undefined;

  if (profile?.status === "approved") {
    return (
      <main className="shell">
        <section className="empty-state">
          <h2>You're already an approved marketplace seller.</h2>
          <p className="muted">You can start listing physical products now.</p>
          <Link href="/seller/marketplace/upload" className="btn dark">Go to upload page</Link>
        </section>
      </main>
    );
  }

  if (profile?.status === "pending") {
    return (
      <main className="shell">
        <section className="empty-state">
          <h2>Application submitted.</h2>
          <p className="muted">Your marketplace seller application is waiting for admin review. You'll get an email once it's approved.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="page-title"><h1>Marketplace Seller Approval</h1><p>Physical sellers need admin approval before listing products.</p></section>

      {profile?.status === "rejected" && (
        <section className="form-panel" style={{ marginBottom: 16 }}>
          <p className="form-error">
            Your previous application was rejected{profile.rejectionReason ? `: ${profile.rejectionReason}` : "."} You can apply again below.
          </p>
        </section>
      )}

      <section className="form-panel">
        <form className="form-grid" action={submitMarketplaceApplication}>
          <label className="field">Full name<input name="fullName" type="text" required /></label>
          <label className="field">Matric / registration number<input name="matricNumber" type="text" required /></label>
          <label className="field">Department<input name="department" type="text" required /></label>
          <label className="field">Level<input name="level" type="text" placeholder="e.g. 300" required /></label>
          <label className="field">Student ID photo<input name="idPhoto" type="file" accept="image/*" required /></label>
          <label className="field">Biodata/profile picture<input name="biodataPhoto" type="file" accept="image/*" required /></label>
          <label className="wide">School name<textarea name="schoolInfo" placeholder="e.g. Modibbo Adama University" required /></label>
          <label className="field">Bank name<input name="bankName" type="text" required /></label>
          <label className="field">Account number<input name="bankAccountNumber" type="text" required /></label>
          <label className="field">
            Account name
            <input name="bankAccountName" type="text" required />
            <small style={{ display: "block", marginTop: 4, color: "#b45309" }}>
              ⚠️ Enter the exact full name on the bank account — it must match the account number exactly, or your payout may fail or go to the wrong person.
            </small>
          </label>
          <button className="btn dark">Submit For Admin Review</button>
        </form>
      </section>
    </main>
  );
}