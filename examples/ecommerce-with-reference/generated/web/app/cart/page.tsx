'use client';

import { CartItemCard } from '@/components/CartItemCard';
import { CartSummary } from '@/components/CartSummary';
import { useCart } from '@/components/providers/CartProvider';

export default function CartPage() {
  const { cartItems } = useCart();

  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-10">
        Your Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-700 dark:text-gray-300 text-xl">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => <CartItemCard key={item.id} item={item} />)
          )}
        </div>
        <div className="lg:col-span-1">
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
