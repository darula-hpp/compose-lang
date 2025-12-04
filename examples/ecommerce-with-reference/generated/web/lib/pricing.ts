// Data Models (for reference, actual interfaces used below are more specific to function needs)
// Item:
//   id: number
//   name: text
//   price: number
//   quantity: number

// User:
//   id: number
//   email: text
//   loyaltyTier: "bronze" | "silver" | "gold"
//   state: text

// Order:
//   id: number
//   items: list of Item
//   user: User
//   subtotal: number
//   discount: number
//   tax: number
//   total: number

/**
 * Interface for the minimal Item properties required for pricing calculations.
 */
export interface PricedItem {
  price: number;
  quantity: number;
}

/**
 * Interface for the minimal User properties required for pricing calculations.
 */
export interface PricingUser {
  loyaltyTier: "bronze" | "silver" | "gold";
  state: string;
}

/**
 * Interface for the result of the total calculation.
 */
export interface CalculationResult {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Applies a percentage discount to an amount.
 *
 * @param amount Original amount.
 * @param discountPercent Discount as percentage (e.g., 10 for 10%).
 * @returns Discounted amount rounded to 2 decimal places.
 */
export function applyDiscount(amount: number, discountPercent: number): number {
  const discount = amount * (discountPercent / 100);
  return parseFloat((amount - discount).toFixed(2));
}

/**
 * Validates if an order meets a minimum total requirement.
 *
 * @param orderTotal The total amount of the order.
 * @param minimum The minimum required order amount (defaults to 10.00).
 * @returns True if the order total meets or exceeds the minimum, false otherwise.
 */
export function validateOrder(orderTotal: number, minimum: number = 10.00): boolean {
  return orderTotal >= minimum;
}

/**
 * Calculates the order total with all business rules applied,
 * including volume discounts, loyalty tier discounts, and state-specific taxes.
 *
 * @param items A list of items, each with a price and quantity.
 * @param user The user placing the order, including loyalty tier and state.
 * @param taxRateOverride Optional tax rate to override the default state-specific rates.
 * @returns An object containing the subtotal, total discount, tax, and final total, all rounded to 2 decimal places.
 */
export function calculateTotal(
  items: PricedItem[],
  user: PricingUser,
  taxRateOverride?: number
): CalculationResult {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Apply volume discount (10+ items = 10% off)
  let volumeDiscount = 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems >= 10) {
    volumeDiscount = subtotal * 0.10;
  }

  // Apply loyalty tier discount
  const tierDiscounts: Record<PricingUser['loyaltyTier'], number> = {
    'bronze': 0.05, // 5%
    'silver': 0.10, // 10%
    'gold': 0.15    // 15%
  };
  // Use 0 if loyaltyTier is not found or undefined
  const loyaltyDiscount = subtotal * (tierDiscounts[user.loyaltyTier] || 0);

  // Total discount
  const totalDiscount = volumeDiscount + loyaltyDiscount;

  // Determine effective tax rate
  let effectiveTaxRate: number;
  if (taxRateOverride !== undefined && taxRateOverride !== null) {
    effectiveTaxRate = taxRateOverride;
  } else {
    // State-specific tax rates
    effectiveTaxRate = user.state === 'CA' ? 0.08 : 0.05;
  }

  // Calculate tax on the amount after discounts
  const taxableAmount = subtotal - totalDiscount;
  const tax = taxableAmount * effectiveTaxRate;

  // Final total
  const total = subtotal - totalDiscount + tax;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(totalDiscount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  };
}