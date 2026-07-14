import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { readDb } from "@/lib/db";

export default async function DigitalPage() {
  const db = await readDb();
  const products = db.products.filter((product) => product.status === "active" && product.productType === "digital");

  return (
    <main className="shell">
      <section className="page-title">
        <h1>Digital Products</h1>
        <p>Pay through Paystack, receive file access, and inspect within the 30-minute dispute window.</p>
      </section>
      {products.length ? (
        <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <EmptyState title="No digital products yet" body="Digital files appear here after sellers accept terms and complete upload payment." />
      )}
    </main>
  );
}
