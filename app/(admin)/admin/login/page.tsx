import { Icons } from "@/components/icons";

export default function AdminLoginPage() {
  return (
    <main className="shell auth-screen">
      <section className="auth-card">
        <div className="auth-art">
          <p className="eyebrow"><Icons.LockKeyhole size={16} /> Admin access</p>
          <h1>Admin login for Trust Bay.</h1>
          <p style={{ color: "rgba(255,255,255,.74)", lineHeight: 1.6 }}>
            Use your admin username and password to access the dashboard.
          </p>
        </div>
        <div className="auth-action">
          <span className="icon-tile"><Icons.LayoutDashboard size={20} /></span>
          <h2>Admin sign in</h2>
          <p className="muted">Only admin can login to the admin panel.</p>
          <form action="/api/admin/login" method="POST" className="login-stack">
            <label className="field">Username<input name="username" type="text" required /></label>
            <label className="field">Password<input name="password" type="password" required /></label>
            <button className="btn dark">Login</button>
          </form>
        </div>
      </section>
    </main>
  );
}