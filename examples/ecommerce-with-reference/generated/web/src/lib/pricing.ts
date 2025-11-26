import { Item, User, LoyaltyTier, PricingResult } from '@/types';

// --- Reference Implementation Translation ---
// Based on the Python reference implementation description:
// - TAX_RATES: Dictionary of state to tax percentage.
// - LOYALTY_DISCOUNTS: Dictionary of loyalty tier to discount percentage.
// - calculate_total(items, user): Calculates subtotal, discount, tax, total.
// - apply_discount(subtotal, loyaltyTier): Applies loyalty discount.

// Constants for tax rates and loyalty discounts
const TAX_RATES: { [key: string]: number } = {
  'CA': 0.0725, // California
  'NY': 0.04,   // New York (state only, local taxes vary)
  'TX': 0.0625, // Texas
  'FL': 0.06,   // Florida
  'DEFAULT': 0.05 // Default tax rate for other states
};

const LOYALTY_DISCOUNTS: { [key in LoyaltyTier]: number } = {
  'bronze': 0.02, // 2% discount
  'silver': 0.05, // 5% discount
  'gold': 0.10    // 10% discount
};

/**
 * Rounds a number to a specified number of decimal places.
 * @param value The number to round.
 * @param decimals The number of decimal places.
 * @returns The rounded number.
 */
function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Applies loyalty tier discounts to the subtotal.
 * @param subtotal The initial subtotal before discounts.
 * @param loyaltyTier The user's loyalty tier.
 * @returns The calculated discount amount.
 */
function applyDiscount(subtotal: number, loyaltyTier: LoyaltyTier): number {
  const discountPercentage = LOYALTY_DISCOUNTS[loyaltyTier] || 0;
  const discountAmount = subtotal * discountPercentage;
  return roundToTwoDecimals(discountAmount);
}

/**
 * Calculates the complete order totals including subtotal, discount, tax, and final total.
 * Preserves all business rules:
 * - Discounts applied before tax.
 * - Round to 2 decimal places.
 * - Minimum order $10 after discounts.
 * - Store tax separately.
 *
 * @param items A list of items in the cart.
 * @param user The user object with loyalty tier and state.
 * @returns An object containing subtotal, discount, tax, and total.
 */
export function calculateOrderTotals(items: Item[], user: User): PricingResult {
  let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  subtotal = roundToTwoDecimals(subtotal);

  // Apply loyalty tier discount
  let discount = applyDiscount(subtotal, user.loyaltyTier);

  // Calculate amount after discount
  let amountAfterDiscount = subtotal - discount;

  // Business Rule: Minimum order $10 after discounts
  if (amountAfterDiscount < 10 && subtotal > 0) {
    // If the discount makes the total less than $10,
    // adjust the discount so that amountAfterDiscount is exactly $10
    // unless the original subtotal was already less than $10.
    if (subtotal >= 10) {
      discount = subtotal - 10;
      amountAfterDiscount = 10;
    } else {
      // If subtotal was already less than $10, no discount should be applied
      // to prevent negative totals or further reduction.
      discount = 0;
      amountAfterDiscount = subtotal;
    }
  }
  discount = roundToTwoDecimals(discount);
  amountAfterDiscount = roundToTwoDecimals(amountAfterDiscount);


  // Get tax rate for the user's state, default if not found
  const stateTaxRate = TAX_RATES[user.state] || TAX_RATES['DEFAULT'];

  // Calculate tax on (subtotal - discount)
  let tax = amountAfterDiscount * stateTaxRate;
  tax = roundToTwoDecimals(tax);

  // Calculate final total
  let total = amountAfterDiscount + tax;
  total = roundToTwoDecimals(total);

  return {
    subtotal,
    discount,
    tax,
    total,
  };
}
