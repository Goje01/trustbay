import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { readDb } from "@/lib/db";

export default async function MarketplacePage() {
  const db = await readDb();
  const products = db.products.filter((product) => product.status === "active" && product.productType === "physical");

  return (
    <main className="shell">
      <section className="page-title">
        <h1>Physical Marketplace</h1>
        <p>Browse verified student sellers. Inspect before payment and keep chats inside Trust Bay.</p>
      </section>
      {products.length ? (
        <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <EmptyState title="No physical products yet" body="Approved marketplace sellers can publish products after upload fee confirmation." />
      )}
    </main>
  );
}
