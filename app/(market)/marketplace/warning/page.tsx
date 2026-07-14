import { acceptMarketplaceWarning } from "@/lib/actions";
import { Icons } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { AutoDismissWarning } from "@/components/auto-dismiss-warning";

export default async function MarketplaceWarningPage() {
  const user = await getCurrentUser();
  const db = await readDb();
  const alreadySeen = user
    ? db.termsAcceptances.some((t) => t.userId === user.id && t.termType === "marketplace_warning")
    : false;

  const content = (
    <>
      <section className="page-title">
        <h1>Marketplace Safety</h1>
        <p>Physical transactions are arranged directly between buyers and sellers.</p>
      </section>
      <section className="form-panel">
        <div className="flow-grid">
          <article className="flow-card"><strong><Icons.MessageCircle size={18} /></strong><h2>Chat here</h2><p className="muted">Keep records inside Trust Bay for dispute support.</p></article>
          <article className="flow-card"><strong><Icons.ShieldCheck size={18} /></strong><h2>Inspect first</h2><p className="muted">Do not pay before seeing and checking the product.</p></article>
          <article className="flow-card"><strong><Icons.Store size={18} /></strong><h2>Meet safely</h2><p className="muted">Use public campus areas like library, cafeteria, security post, or department zones.</p></article>
        </div>
        {!alreadySeen && (
          <form action={acceptMarketplaceWarning} style={{ marginTop: 22 }}>
            <button className="btn dark">I Understand - Continue</button>
          </form>
        )}
      </section>
    </>
  );

  if (alreadySeen) {
    return (
      <AutoDismissWarning redirectTo="/marketplace">
        <main className="shell">{content}</main>
      </AutoDismissWarning>
    );
  }

  return <main className="shell">{content}</main>;
}