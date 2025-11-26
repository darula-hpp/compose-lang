import { Item, User } from './types';

/**
 * @reference/pricing.py - Tax Rates
 * Example tax rates based on state.
 */
const TAX_RATES: Record<string, number> = {
  "CA": 0.075, // California
  "NY": 0.08875, // New York
  "TX": 0.0625, // Texas
  "FL": 0.06, // Florida
  "IL": 0.0625, // Illinois
  "DEFAULT": 0.05, // Default tax rate for unknown states
};

/**
 * @reference/pricing.py::apply_discount
 * Applies loyalty tier discounts to a subtotal.
 * - Discounts are applied before tax calculation.
 * - Rounds to 2 decimal places.
 * - Minimum order $10 after discounts.
 *
 * @param subtotal The subtotal before any discounts.
 * @param loyaltyTier The user's loyalty tier.
 * @returns The calculated discount amount.
 */
export function applyDiscount(subtotal: number, loyaltyTier: User['loyaltyTier']): number {
  let discountPercentage = 0;
  switch (loyaltyTier) {
    case "silver":
      discountPercentage = 0.05; // 5% discount
      break;
    case "gold":
      discountPercentage = 0.10; // 10% discount
      break;
    case "bronze":
    default:
      discountPercentage = 0; // No discount for bronze
      break;
  }

  let discountAmount = subtotal * discountPercentage;
  let discountedSubtotal = subtotal - discountAmount;

  // Preserve business rule: Minimum order $10 after discounts
  // If the discounted subtotal falls below $10, and the original subtotal was at least $10,
  // adjust the discount so the final subtotal is exactly $10.
  if (subtotal >= 10 && discountedSubtotal < 10) {
    discountAmount = subtotal - 10; // Adjust discount to make final subtotal $10
  } else if (discountedSubtotal < 0) {
    // This case should ideally not happen with positive subtotals and discounts < 100%
    // but as a safeguard, ensure discountedSubtotal doesn't go negative.
    discountAmount = subtotal; // Max discount is subtotal itself
  }

  // Round to 2 decimal places
  return parseFloat(discountAmount.toFixed(2));
}

/**
 * @reference/pricing.py::calculate_total
 * Calculates the complete order totals including subtotal, discount, tax, and final total.
 *
 * @param items A list of items in the cart, each with its quantity.
 * @param user The user making the purchase, for loyalty tier and state-based tax.
 * @returns An object containing subtotal, discount, tax, and total.
 */
export function calculateOrderTotals(
  items: Item[],
  user: User
): { subtotal: number; discount: number; tax: number; total: number } {
  // Calculate initial subtotal (sum of price * quantity for all items)
  const initialSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Apply discounts before tax calculation
  const discount = applyDiscount(initialSubtotal, user.loyaltyTier);
  const subtotalAfterDiscount = initialSubtotal - discount;

  // Calculate tax on (subtotal - discount)
  const taxRate = TAX_RATES[user.state] || TAX_RATES["DEFAULT"];
  const tax = parseFloat((subtotalAfterDiscount * taxRate).toFixed(2)); // Store tax separately, rounded

  // Calculate final total
  const total = parseFloat((subtotalAfterDiscount + tax).toFixed(2));

  return {
    subtotal: parseFloat(initialSubtotal.toFixed(2)), // Ensure subtotal is also rounded
    discount,
    tax,
    total,
  };
}
