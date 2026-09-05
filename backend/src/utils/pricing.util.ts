export interface PricingResult {
  subtotal: number;
  shippingFee: number;
  taxTotal: number;
  orderTotal: number;
}

/**
 * Single authoritative source for all monetary calculations across the system.
 * Values are calculated and returned in paise (integer arithmetic).
 *
 * Rules:
 * - Free shipping threshold: ₹150 (15000 paise)
 * - Standard shipping fee: ₹5 (500 paise)
 * - Tax rate: 8% of subtotal
 * - Order total: subtotal + shippingFee + taxTotal
 */
export function calculateOrderTotals(subtotal: number): PricingResult {
  if (subtotal < 0 || !Number.isInteger(subtotal)) {
    throw new Error('Invalid subtotal: must be a non-negative integer (in paise).');
  }

  const shippingFee = subtotal >= 15000 ? 0 : 500;
  const taxTotal = Math.round(subtotal * 0.08);
  const orderTotal = subtotal + shippingFee + taxTotal;

  return { subtotal, shippingFee, taxTotal, orderTotal };
}
