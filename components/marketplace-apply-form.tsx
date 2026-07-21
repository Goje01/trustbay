"use client";

import { useState, useTransition } from "react";
import { submitMarketplaceApplication } from "@/lib/actions";

async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

export function MarketplaceApplyForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("Compressing images...");

    const idPhoto = formData.get("idPhoto");
    const biodataPhoto = formData.get("biodataPhoto");

    if (idPhoto instanceof File && idPhoto.size > 0) {
      const compressed = await compressImage(idPhoto);
      formData.set("idPhoto", compressed);
    }
    if (biodataPhoto instanceof File && biodataPhoto.size > 0) {
      const compressed = await compressImage(biodataPhoto);
      formData.set("biodataPhoto", compressed);
    }

    setStatus("Uploading... this may take a moment on slow connections, please wait.");

    startTransition(async () => {
      try {
        await submitMarketplaceApplication(formData);
      } catch (err) {
        // redirect() throws internally on success; only real errors land here
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setStatus("Upload failed. This is often caused by a weak connection — please try again on WiFi or a stronger signal.");
        }
      }
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label className="field">Full name<input name="fullName" type="text" required /></label>
      <label className="field">Matric / registration number<input name="matricNumber" type="text" required /></label>
      <label className="field">Department<input name="department" type="text" required /></label>
      <label className="field">Level<input name="level" type="text" placeholder="e.g. 300" required /></label>
      <label className="field">Student ID photo<input name="idPhoto" type="file" accept="image/*" required /></label>
      <label className="field">Biodata/profile picture<input name="biodataPhoto" type="file" accept="image/*" required /></label>
      <label className="wide">School name<textarea name="schoolInfo" placeholder="e.g. Modibbo Adama University" required /></label>
      <label className="field">Bank name<input name="bankName" type="text" required /></label>
      <label className="field">Account number<input name="bankAccountNumber" type="text" required /></label>
      <label className="field">
        Account name
        <input name="bankAccountName" type="text" required />
        <small style={{ display: "block", marginTop: 4, color: "#b45309" }}>
          ⚠️ Enter the exact full name on the bank account — it must match the account number exactly, or your payout may fail or go to the wrong person.
        </small>
      </label>
      {status && (
        <p className="notice" style={{ gridColumn: "1 / -1" }}>{status}</p>
      )}
      <button className="btn dark" disabled={pending}>
        {pending ? "Submitting... please wait" : "Submit For Admin Review"}
      </button>
    </form>
  );
}