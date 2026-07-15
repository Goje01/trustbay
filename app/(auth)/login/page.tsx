import { Icons } from "@/components/icons";
import { GoogleButton, LoginForm } from "@/components/auth-forms";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ created?: string; error?: string; next?: string }> }) {
  const params = await searchParams;
  const callbackUrl = params?.next || "/terms/buyer";
  return (
    <main className="shell auth-screen">
      <section className="auth-card">
        <div className="auth-art">
          <p className="eyebrow"><Icons.LockKeyhole size={16} /> Flexible access</p>
          <h1>Enter Trust Bay with email or Google.</h1>
          <p style={{ color: "rgba(255,255,255,.74)", lineHeight: 1.6 }}>
            Create a normal account if Google is giving you stress, or use Google when your OAuth keys are ready.
          </p>
        </div>
        <div className="auth-action">
          <span className="icon-tile"><Icons.ShieldCheck size={20} /></span>
          <h2>Sign in securely</h2>
          <p className="muted">Buyer terms appear after sign-in before transactions and marketplace access.</p>
          {params?.created ? (
            <>
              <p className="notice">Account created. You can now log in.</p>
              <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                Didn't get a welcome email? Check your Spam or Junk folder and mark it "Not spam".
              </p>
            </>
          ) : null}
          {params?.error === "account-exists" ? <p className="form-error">That email already has an account. Please log in.</p> : null}
          <LoginForm callbackUrl={callbackUrl} />
          <p style={{ marginTop: 10 }}><Link href="/forgot-password" style={{ fontSize: 14 }}>Forgot password?</Link></p>
          <div className="auth-divider"><span>or</span></div>
          <GoogleButton callbackUrl={callbackUrl} />
          <p className="auth-note">New here? <Link href="/register">Create an account</Link></p>
        </div>
      </section>
    </main>
  );
}