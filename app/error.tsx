"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        url: typeof window !== "undefined" ? window.location.href : ""
      })
    }).catch(() => {});
  }, [error]);

  return (
    <main className="shell">
      <section className="empty-state">
        <h2>Something went wrong</h2>
        <p className="muted">We've logged this issue and we're looking into it. Please try again.</p>
        <button className="btn dark" onClick={() => reset()} style={{ marginTop: 12 }}>
          Try again
        </button>
      </section>
    </main>
  );
}