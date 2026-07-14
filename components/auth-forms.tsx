"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { Icons } from "./icons";

export function LoginForm({ callbackUrl = "/terms/buyer" }: { callbackUrl?: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="login-stack"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await signIn("credentials", {
            email: String(formData.get("email") || ""),
            password: String(formData.get("password") || ""),
            redirect: false,
            callbackUrl
          });

          if (result?.error) {
            setError("Invalid email or password.");
            return;
          }

          window.location.href = result?.url || callbackUrl;
        });
      }}
    >
      <label className="field">Email<input name="email" type="email" autoComplete="email" required /></label>
      <label className="field">Password<input name="password" type="password" autoComplete="current-password" required /></label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="btn dark" disabled={pending}>{pending ? "Signing in..." : "Login"}</button>
    </form>
  );
}

export function GoogleButton({ callbackUrl = "/terms/buyer" }: { callbackUrl?: string }) {
  return (
    <button className="google-btn" onClick={() => signIn("google", { callbackUrl })}>
      <Icons.ShieldCheck size={18} />
      Continue with Google
    </button>
  );
}
