export interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number; // Quantity in cart/order
  image?: string; // Optional image for products
}

export type LoyaltyTier = "bronze" | "silver" | "gold";

export interface User {
  id: number;
  email: string;
  loyaltyTier: LoyaltyTier;
  state: string; // For tax calculation
}

export interface Order {
  id: number;
  items: Item[];
  user: User;
  subtotal: number; // Sum of item prices * quantities
  discount: number; // Loyalty discount applied
  tax: number; // Tax applied
  total: number; // Final total
}

export interface CartItem extends Item {
  // CartItem extends Item, adding no new properties but clarifying its use in the cart
}

export interface OrderSummary {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}
