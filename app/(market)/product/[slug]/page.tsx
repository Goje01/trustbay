import { notFound } from "next/navigation";
import { Icons } from "@/components/icons";
import { startChat } from "@/lib/actions";
import { readDb } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const product = db.products.find((item) => item.slug === slug && item.status === "active");
  if (!product) notFound();
  const seller = db.users.find((item) => item.id === product.sellerId);

  return (
    <main className="shell detail-layout">
      <section className="gallery">
        {product.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.coverImageUrl} alt={product.title} />
        ) : (
          <div className="media-empty" style={{ width: "100%", height: "100%", border: 0 }}>Trust Bay</div>
        )}
      </section>

      <aside className="detail-card">
        <div className="tag-row">
          <span className="tag dark">{product.productType === "digital" ? "Digital Product" : "Physical Marketplace"}</span>
          {product.productType === "physical" ? <span className="tag"><Icons.BadgeCheck size={14} /> Verified seller</span> : null}
        </div>
        <h1>{product.title}</h1>
        <p className="price">{formatMoney(product.price)}</p>
        <p className="muted">{product.description}</p>

        <div className="spec-grid">
          <div><span>Category</span><strong>{product.category}</strong></div>
          <div><span>Quantity</span><strong>{product.remainingQuantity}</strong></div>
          <div><span>Seller</span><strong>{seller?.fullName || "Student seller"}</strong></div>
          <div><span>Department</span><strong>{seller?.department || "Private"}</strong></div>
          {product.productType === "physical" ? (
            <>
              <div><span>Condition</span><strong>{product.condition}</strong></div>
              <div><span>Pickup area</span><strong>{product.location || "Campus"}</strong></div>
            </>
          ) : null}
        </div>

        {product.productType === "digital" ? (
          <>
            <div className="notice">After payment, you have 30 minutes to check the product and submit a dispute with proof.</div>
            <a className="btn dark" href={`/checkout/digital/${product.slug}`}><Icons.WalletCards size={18} /> Buy Digital Product</a>
          </>
        ) : (
          <>
            <div className="notice">Inspect before payment. Chat on Trust Bay. Meet only at approved public campus locations.</div>
            <form action={startChat.bind(null, product.id)}>
              <button className="btn dark"><Icons.MessageCircle size={18} /> Chat With Seller</button>
            </form>
          </>
        )}
        <a className="btn ghost" style={{ marginTop: 12 }} href={`/report?productId=${product.id}`}>
          <Icons.FileWarning size={18} /> Report Listing
        </a>
      </aside>
    </main>
  );
}
