// Data Models (as interfaces, assuming they are not globally available or imported from a common types file)
interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface User {
  id: number;
  email: string;
  loyaltyTier: "bronze" | "silver" | "gold";
  state: string;
}

// Return type for calculateTotal
interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

/**
 * Calculates the order total with all business rules applied.
 *
 * @param items List of items with price and quantity.
 * @param user User details including loyalty tier and state.
 * @param taxRate Optional tax rate override.
 * @returns An object containing subtotal, discount, tax, and total.
 */
export function calculateTotal(
  items: Item[],
  user: User,
  taxRate: number | null = null
): OrderSummary {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Apply volume discount (10+ items = 10% off)
  let volumeDiscount = 0;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  if (totalItems >= 10) {
    volumeDiscount = subtotal * 0.10;
  }

  // Apply loyalty tier discount
  const tierDiscounts: { [key in User['loyaltyTier']]: number } = {
    'bronze': 0.05, // 5%
    'silver': 0.10, // 10%
    'gold': 0.15    // 15%
  };
  // Use 0 if loyaltyTier is not found in tierDiscounts (e.g., for new tiers or undefined)
  const loyaltyDiscount = subtotal * (tierDiscounts[user.loyaltyTier] || 0);

  // Total discount
  const totalDiscount = volumeDiscount + loyaltyDiscount;

  // Calculate tax
  let effectiveTaxRate = taxRate;
  if (effectiveTaxRate === null) {
    // State-specific tax rates
    effectiveTaxRate = user.state === 'CA' ? 0.08 : 0.05;
  }

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
 * Validates if an order meets a minimum requirement.
 *
 * @param orderTotal Total order amount.
 * @param minimum Minimum order amount (default $10).
 * @returns True if valid, False otherwise.
 */
export function validateOrder(orderTotal: number, minimum: number = 10.00): boolean {
  return orderTotal >= minimum;
}