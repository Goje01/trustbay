import { Icons } from "@/components/icons";
import { readDb } from "@/lib/db";
import { resetPassword } from "@/lib/actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams?: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = params?.token || "";
  const db = await readDb();
  const user = db.users.find(
    (item) => item.resetToken === token && item.resetTokenExpiresAt && new Date(item.resetTokenExpiresAt) > new Date()
  );

  if (!token || !user) {
    return (
      <main className="shell auth-screen">
        <section className="auth-card">
          <div className="auth-action">
            <h2>Invalid or expired link</h2>
            <p className="muted">This reset link is invalid or has expired. Please request a new one.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell auth-screen">
      <section className="auth-card">
        <div className="auth-art">
          <p className="eyebrow"><Icons.LockKeyhole size={16} /> Reset access</p>
          <h1>Choose a new password.</h1>
        </div>
        <div className="auth-action">
          <span className="icon-tile"><Icons.ShieldCheck size={20} /></span>
          <h2>New password</h2>
          <form className="login-stack" action={resetPassword}>
            <input type="hidden" name="token" value={token} />
            <label className="field">New password<input name="password" type="password" minLength={8} required /></label>
            <label className="field">Confirm password<input name="confirmPassword" type="password" minLength={8} required /></label>
            <button className="btn dark">Reset password</button>
          </form>
        </div>
      </section>
    </main>
  );
}