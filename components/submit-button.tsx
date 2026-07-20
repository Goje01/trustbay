"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, className = "btn dark" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();

  return (
    <button className={className} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? "Submitting… please wait" : children}
    </button>
  );
}