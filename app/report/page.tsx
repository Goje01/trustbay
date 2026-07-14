import { submitReport } from "@/lib/actions";

export default async function ReportPage({ searchParams }: { searchParams?: Promise<{ productId?: string; orderId?: string }> }) {
  const params = await searchParams;
  return (
    <main className="shell">
      <section className="page-title"><h1>Report / Dispute</h1><p>Report fake, stolen, illegal, copyrighted, misleading, dangerous, or failed digital products.</p></section>
      <section className="form-panel">
        <form className="form-grid" action={submitReport}>
          <input type="hidden" name="productId" value={params?.productId || ""} />
          <input type="hidden" name="orderId" value={params?.orderId || ""} />
          <label className="field">Complaint type<select name="type"><option>Fake product</option><option>Copyright complaint</option><option>File does not open</option><option>Product not as described</option><option>Stolen item</option><option>Fake document</option><option>Illegal item</option><option>Unsafe item</option><option>Scam report</option></select></label>
          <label className="field">Proof upload<input name="proof" type="file" /></label>
          <label className="wide">Description<textarea name="description" required /></label>
          <button className="btn dark">Submit Report</button>
        </form>
      </section>
    </main>
  );
}
