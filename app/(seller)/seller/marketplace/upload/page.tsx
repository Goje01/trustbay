import { categories } from "@/lib/constants";
import { createProduct } from "@/lib/actions";

export default function PhysicalUploadPage() {
  return (
    <main className="shell">
      <section className="page-title"><h1>Physical Product Upload</h1><p>Approved sellers can publish after upload fee payment through Paystack.</p></section>
      <section className="form-panel">
        <form className="form-grid" action={createProduct.bind(null, "physical")}>
          <label className="field">Product title<input name="title" required /></label>
          <label className="field">Category<select name="category">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="field">Price per item<input name="price" type="number" min="1" required /></label>
          <label className="field">Quantity/stock<input name="quantity" type="number" min="1" defaultValue="1" required /></label>
          <label className="field">Condition<select name="condition"><option>New</option><option>Used</option><option>Fairly Used</option></select></label>
          <label className="field">Pickup/delivery area<input name="location" required /></label>
          <label className="field">Cover image<input name="coverImage" type="file" accept="image/*" required /></label>
          <label className="field">Extra image<input name="imageOne" type="file" accept="image/*" /></label>
          <label className="wide">Description<textarea name="description" required /></label>
          <label className="wide" style={{ display: "flex", gap: 10, alignItems: "center" }}><input style={{ width: 18, minHeight: 18 }} type="checkbox" required /> I accept marketplace terms, inspection warning, upload fee terms, and removal policy.</label>
          <button className="btn dark">Calculate Fee and Continue to Paystack</button>
        </form>
      </section>
    </main>
  );
}
