import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { readDb } from "@/lib/db";

export default async function DownloadPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams?: Promise<{ payment?: string }> }) {
  const user = await getCurrentUser();
  const { orderId } = await params;
  const query = await searchParams;
  const db = await readDb();
  const order = db.digitalOrders.find((item) => item.id === orderId && item.buyerId === user?.id);
  if (!order) notFound();
  const product = db.products.find((item) => item.id === order.productId);

  return (
    <main className="shell">
      <section className="page-title"><h1>Digital Download</h1><p>Download access and dispute tracking for your purchase.</p></section>
      <section className="form-panel">
        {query?.payment === "successful" ? <div className="notice">Payment confirmed. Your file access is ready and email notifications were queued.</div> : null}
        <div className="spec-grid">
          <div><span>Product</span><strong>{product?.title}</strong></div>
          <div><span>Status</span><strong>{order.status}</strong></div>
          <div><span>Receipt</span><strong>{order.paystackReference}</strong></div>
          <div><span>Dispute deadline</span><strong>{order.disputeDeadlineAt ? new Date(order.disputeDeadlineAt).toLocaleString() : "-"}</strong></div>
        </div>
        {product?.fileUrl ? <a className="btn dark" href={product.fileUrl}>Download File</a> : null}
        <a className="btn ghost" style={{ marginLeft: 10 }} href={`/report?productId=${product?.id}&orderId=${order.id}`}>Submit Dispute</a>
      </section>
    </main>
  );
}
