'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CartItemComponent } from '@/components/CartItem';
import { CheckoutSummary } from '@/components/CheckoutSummary';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { cartItems, orderSummary, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-700 dark:text-gray-300">
        Loading cart...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Your cart is empty.
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
        Your Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <CheckoutSummary summary={orderSummary} />
          <Link
            href="/checkout"
            className="mt-6 w-full block text-center bg-green-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-green-700 transition-colors duration-200"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
