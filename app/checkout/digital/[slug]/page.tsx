import { notFound } from "next/navigation";
import { startDigitalCheckout } from "@/lib/actions";
import { readDb } from "@/lib/db";
import { estimatePaystackFeeSplit, formatMoney } from "@/lib/money";

export default async function DigitalCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const product = db.products.find((item) => item.slug === slug && item.productType === "digital" && item.status === "active");
  if (!product) notFound();
  const split = estimatePaystackFeeSplit(product.price);

  return (
    <main className="shell">
      <section className="page-title"><h1>Digital Checkout</h1><p>Review the Paystack split and dispute window before payment.</p></section>
      <section className="form-panel">
        <div className="spec-grid">
          <div><span>Product price</span><strong>{formatMoney(product.price)}</strong></div>
          <div><span>Buyer fee share</span><strong>{formatMoney(split.buyerShare)}</strong></div>
          <div><span>Seller fee share</span><strong>{formatMoney(split.sellerShare)}</strong></div>
          <div><span>Total buyer pays</span><strong>{formatMoney(product.price + split.buyerShare)}</strong></div>
        </div>
        <div className="notice">After payment, download access is released and the 30-minute dispute window starts.</div>
        <form action={startDigitalCheckout.bind(null, product.slug)}>
          <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}><input name="acceptTerms" style={{ width: 18, minHeight: 18 }} type="checkbox" required /> I accept digital purchase terms.</label>
          <button className="btn dark">Pay With Paystack</button>
        </form>
      </section>
    </main>
  );
}
