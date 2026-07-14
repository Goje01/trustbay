"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoDismissWarning({
  children,
  redirectTo
}: {
  children: React.ReactNode;
  redirectTo: string;
}) {
  const router = useRouter();
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1500);
    const redirectTimer = setTimeout(() => router.push(redirectTo), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [redirectTo, router]);

  return (
    <div
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s ease"
      }}
    >
      {children}
    </div>
  );
}