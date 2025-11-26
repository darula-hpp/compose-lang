// Data Models
export interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export type LoyaltyTier = "bronze" | "silver" | "gold";

export interface User {
  id: number;
  email: string;
  loyaltyTier: LoyaltyTier;
  state: string; // e.g., "CA", "NY"
}

export interface Order {
  id: number;
  items: Item[];
  user: User;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  // Add other order details like status, createdAt, etc.
}

// Pricing Calculation Result
export interface PricingResult {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}