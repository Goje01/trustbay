export function formatMoney(value: number) {
  return `N${Math.round(value || 0).toLocaleString("en-NG")}`;
}

export function calculateUploadFee(price: number, quantity: number) {
  const extraQuantity = Math.max(quantity - 1, 0);
  const quantityBlocks = Math.ceil(extraQuantity / 3);

  // Base fee by price tier
  let baseFee: number;
  if (price < 1000) {
    baseFee = 100;
  } else if (price <= 3000) {
    baseFee = 200;
  } else if (price <= 10000) {
    baseFee = 400;
  } else {
    baseFee = price * 0.05;
  }

  // Extra charge per additional 3 items, by price tier
  let perBlockCharge: number;
  if (price < 1000) {
    perBlockCharge = 50;
  } else if (price <= 9999) {
    perBlockCharge = 75;
  } else {
    perBlockCharge = price * 0.01;
  }

  return Math.round(baseFee + quantityBlocks * perBlockCharge);
}

export function estimatePaystackFeeSplit(amount: number) {
  const estimatedFee = Math.min(amount * 0.015 + 100, 2000);
  return {
    buyerShare: Math.round(estimatedFee / 2),
    sellerShare: Math.round(estimatedFee / 2)
  };
}

// ── Upload-fee launch promo ──────────────────────────────────────────────
export const UPLOAD_PROMO_CODE = "LAUNCH99";
export const UPLOAD_PROMO_DISCOUNT_PERCENT = 99;
// Set to an ISO date string (e.g. "2026-08-31T23:59:59.000Z") to auto-expire
// the promo, or leave as null to keep it open until you change the code.
export const UPLOAD_PROMO_EXPIRES_AT: string | null = null;

export function applyUploadPromoCode(feeAmount: number, rawCode: string | null | undefined) {
  const code = (rawCode || "").trim().toUpperCase();
  const isCorrectCode = code === UPLOAD_PROMO_CODE;
  const isExpired = UPLOAD_PROMO_EXPIRES_AT ? new Date() > new Date(UPLOAD_PROMO_EXPIRES_AT) : false;
  const applied = isCorrectCode && !isExpired;
  const discountedFee = applied
    ? Math.max(0, Math.round(feeAmount * (1 - UPLOAD_PROMO_DISCOUNT_PERCENT / 100)))
    : feeAmount;
  return { applied, discountedFee };
}