import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import Link from "next/link";
import { MarketplaceApplyForm } from "@/components/marketplace-apply-form";

export const maxDuration = 120;

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
        <MarketplaceApplyForm />
      </section>
    </main>
  );
}