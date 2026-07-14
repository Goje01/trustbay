import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";
import { Icons } from "./icons";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-media">
        {product.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.coverImageUrl} alt={product.title} />
        ) : (
          <div className="media-empty">Trust Bay</div>
        )}
      </div>
      <div className="product-info">
        <div className="tag-row">
          <span className="tag dark">{product.productType === "digital" ? "Digital" : "Physical"}</span>
          {product.productType === "physical" ? <span className="tag"><Icons.BadgeCheck size={14} /> Verified</span> : null}
        </div>
        <h3>{product.title}</h3>
        <p>{product.category}</p>
        <div className="price-row">
          <span className="price">{formatMoney(product.price)}</span>
          <span className="mini-arrow"><Icons.ArrowRight size={18} /></span>
        </div>
      </div>
    </Link>
  );
}
