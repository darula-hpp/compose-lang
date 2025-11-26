'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from './providers/CartProvider';

export function CartSummary() {
  const { cartItems, getCartSubtotal } = useCart();
  const subtotal = getCartSubtotal();

  if (cartItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
        <p className="text-gray-700 dark:text-gray-300 text-lg">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Cart Summary</h2>
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
        <p className="text-lg text-gray-700 dark:text-gray-300">Subtotal:</p>
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">${subtotal.toFixed(2)}</p>
      </div>
      <Link href="/checkout" className="block w-full text-center bg-green-600 text-white py-3 px-4 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
        Proceed to Checkout
      </Link>
    </div>
  );
}
