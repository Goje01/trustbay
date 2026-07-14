import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Icons } from "./icons";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="shell nav">
        <Link href="/" className="brand">
          <span className="brand-mark">TB</span>
          <span className="brand-word">
            Trust Bay
            <small>Campus verified</small>
          </span>
        </Link>

        <form className="search-bar" action="/">
          <Icons.Search size={18} />
          <input name="q" placeholder="Search products, categories, sellers" />
          <button className="btn dark" type="submit">Search</button>
        </form>

        <nav className="nav-links">
          <Link href="/digital">Digital</Link>
          <Link href="/marketplace/warning">Marketplace</Link>
          <Link href="/seller/choice">Sell</Link>
          {user ? (
            <>
              <Link href="/seller">Dashboard</Link>
              {["ceo", "super_admin"].includes(user.role) ? <Link href="/admin">Admin</Link> : null}
              <Link className="btn ghost" href="/api/auth/signout">Logout</Link>
            </>
          ) : (
            <Link className="btn dark" href="/login">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
