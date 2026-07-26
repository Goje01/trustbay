import { categories } from "@/lib/constants";
import { createProduct } from "@/lib/actions";
import { SubmitButton } from "@/components/submit-button";

export const maxDuration = 60;

export default function DigitalUploadPage() {
  return <UploadForm title="Digital Product Upload" productType="digital" />;
}

function UploadForm({ title, productType }: { title: string; productType: "digital" }) {
  return (
    <main className="shell">
      <section className="page-title"><h1>{title}</h1><p>Trust Bay calculates the upload fee after you submit the listing.</p></section>
      <section className="form-panel">
        <form className="form-grid" action={createProduct.bind(null, productType)}>
          <label className="field">Product title<input name="title" required /></label>
          <label className="field">Category<select name="category">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field">Price<input name="price" type="number" min="1" required /></label>
          <label className="field">Quantity<input name="quantity" type="number" min="1" defaultValue="1" required /></label>
          <label className="field">Cover image<input name="coverImage" type="file" accept="image/*" required /></label>
          <label className="field">Digital file<input name="digitalFile" type="file" required /></label>
          <label className="wide">Description<textarea name="description" required /></label>
          <label className="field">Promo code (optional)<input name="promoCode" placeholder="e.g. LAUNCH99" /></label>
          <label className="wide" style={{ display: "flex", gap: 10, alignItems: "center" }}><input style={{ width: 18, minHeight: 18 }} type="checkbox" required /> I accept upload fee terms, copyright responsibility, and account removal policy.</label>
          <SubmitButton>Calculate Fee and Continue to Paystack</SubmitButton>
        </form>
      </section>
    </main>
  );
}