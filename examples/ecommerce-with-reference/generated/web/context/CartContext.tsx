'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CartItem, Item, LoyaltyTier, OrderSummary } from '@/lib/types';
import { calculateOrderTotals } from '@/lib/pricing';
import { mockUser } from '@/data/mockUser'; // Assuming a mock user for calculations

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Item) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  orderSummary: OrderSummary;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    discount: 0,
    tax: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const storedCart = localStorage.getItem('myShopCart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) { // Only save after initial load to prevent overwriting
      localStorage.setItem('myShopCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Recalculate order summary whenever cart items change
  useEffect(() => {
    const summary = calculateOrderTotals(
      cartItems,
      mockUser.state, // Use mock user's state for tax
      mockUser.loyaltyTier // Use mock user's loyalty tier for discount
    );
    setOrderSummary(summary);
  }, [cartItems]);

  const addItem = useCallback((item: Item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  }, []);

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== itemId);
      }
      return prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const value = {
    cartItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    orderSummary,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    // This is the fix for "Error: useCart must be used within a CartProvider"
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
