import { Icons } from "@/components/icons";
import { requestPasswordReset } from "@/lib/actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams?: Promise<{ sent?: string }> }) {
  const params = await searchParams;
  return (
    <main className="shell auth-screen">
      <section className="auth-card">
        <div className="auth-art">
          <p className="eyebrow"><Icons.LockKeyhole size={16} /> Reset access</p>
          <h1>Forgot your password?</h1>
          <p style={{ color: "rgba(255,255,255,.74)", lineHeight: 1.6 }}>
            Enter your email and we'll send you a link to reset it.
          </p>
        </div>
        <div className="auth-action">
          <span className="icon-tile"><Icons.ShieldCheck size={20} /></span>
          <h2>Reset password</h2>
          {params?.sent ? (
            <>
              <p className="notice">If that email has an account, a reset link has been sent.</p>
              <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
                Don't see it? Check your Spam or Junk folder — mark it "Not spam" so future emails land in your inbox.
                {" "}
                <details style={{ display: "inline", cursor: "pointer" }}>
                  <summary style={{ display: "inline", color: "#1b1b1b", fontWeight: 600 }}>Don't know how?</summary>
                  <span style={{ display: "block", marginTop: 8 }}>
                    Open Gmail on your computer or mobile app.
                    <br />
                    In the left-hand sidebar (you may need to click "More" first), click on the Spam folder.
                    <br />
                    Find and open the email from Trust Bay.
                    <br />
                    At the top of the email, click the grey button that says "Report not spam".
                  </span>
                </details>
              </p>
            </>
          ) : (
            <form className="login-stack" action={requestPasswordReset}>
              <label className="field">Email<input name="email" type="email" required /></label>
              <button className="btn dark">Send reset link</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}