import Link from "next/link";
import { registerAccount } from "@/lib/actions";
import { Icons } from "@/components/icons";

const errors: Record<string, string> = {
  missing: "Full name, email, and password are required.",
  "short-password": "Password must be at least 8 characters.",
  "password-mismatch": "Passwords do not match."
};

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="shell auth-screen">
      <section className="auth-card">
        <div className="auth-art">
          <p className="eyebrow"><Icons.LockKeyhole size={16} /> Normal account creation</p>
          <h1>Create a Trust Bay account.</h1>
          <p style={{ color: "rgba(255,255,255,.74)", lineHeight: 1.6 }}>
            Use email and password now. Google sign-in remains available as a second option.
          </p>
        </div>
        <div className="auth-action">
          <h2>Student details</h2>
          <p className="muted">You will accept buyer terms after your first login.</p>
          {params?.error ? <p className="form-error">{errors[params.error] || "Could not create account."}</p> : null}
          <form className="form-grid" action={registerAccount}>
            <label className="field">Full name<input name="fullName" autoComplete="name" required /></label>
            <label className="field">Email<input name="email" type="email" autoComplete="email" required /></label>
            <label className="field">Phone<input name="phone" autoComplete="tel" /></label>
            <label className="field">Department<input name="department" /></label>
            <label className="field">Level<input name="level" /></label>
            <label className="field">Matric number<input name="matricNumber" /></label>
            <label className="field">Password<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
            <label className="field">Confirm password<input name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required /></label>
            <button className="btn dark">Create Account</button>
          </form>
          <p className="auth-note">Already have an account? <Link href="/login">Login</Link></p>
        </div>
      </section>
    </main>
  );
}
