// Data Models (as provided in the prompt)
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

interface Order {
  id?: number; // Order ID might be generated later, or passed in for existing orders
  items: Item[];
  user: User;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

// Helper for rounding to 2 decimal places
const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};

// Tax rates (inferred from common practice, as @reference/pricing.py is not provided)
const TAX_RATES: { [key: string]: number } = {
  CA: 0.0825, // California
  NY: 0.0400, // New York
  TX: 0.0625, // Texas
  FL: 0.0600, // Florida
  // Add more states as needed
  DEFAULT: 0.0500, // Default tax rate
};

/**
 * Calculates the discount amount based on loyalty tier and subtotal.
 * Applies discounts before tax calculation.
 * Rounds to 2 decimal places.
 * Minimum order $10 after discounts: If the subtotal is less than $10, no discount is applied.
 * If the subtotal is $10 or more, apply the discount, but the final discounted amount cannot be less than $10.
 *
 * @param subtotal The calculated subtotal before any discounts.
 * @param user The user object with loyalty tier.
 * @returns The calculated discount amount.
 */
export const applyDiscount = (subtotal: number, user: User): number => {
  let discountRate = 0;

  switch (user.loyaltyTier) {
    case "silver":
      discountRate = 0.05; // 5% discount
      break;
    case "gold":
      discountRate = 0.10; // 10% discount
      break;
    case "bronze":
    default:
      discountRate = 0; // No discount for bronze or unknown tiers
      break;
  }

  // No discount if subtotal is less than $10
  if (subtotal < 10) {
    return 0;
  }

  let discountAmount = subtotal * discountRate;

  // Ensure the subtotal after discount is not less than $10
  // This means the discount cannot push the subtotal below $10
  if (subtotal - discountAmount < 10) {
    discountAmount = subtotal - 10; // Cap the discount so remaining subtotal is exactly $10
    if (discountAmount < 0) { // Should not happen if subtotal >= 10 and discountRate >= 0
        discountAmount = 0;
    }
  }

  return roundToTwoDecimals(discountAmount);
};

/**
 * Calculates the total price for an order, including subtotal, discount, tax, and final total.
 *
 * @param items A list of items in the order.
 * @param user The user placing the order.
 * @returns An object containing subtotal, discount, tax, and total.
 */
export const calculateOrderTotal = (items: Item[], user: User): Omit<Order, 'id' | 'items' | 'user'> => {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.price * item.quantity;
  }
  subtotal = roundToTwoDecimals(subtotal);

  const discount = applyDiscount(subtotal, user);

  const subtotalAfterDiscount = subtotal - discount;

  // Get tax rate for the user's state, or use default
  const taxRate = TAX_RATES[user.state.toUpperCase()] || TAX_RATES.DEFAULT;

  // Calculate tax on (subtotal - discount)
  const tax = roundToTwoDecimals(subtotalAfterDiscount * taxRate);

  const total = roundToTwoDecimals(subtotalAfterDiscount + tax);

  return {
    subtotal,
    discount,
    tax,
    total,
  };
};

// Export types for external use if needed
export type { Item, User, Order };