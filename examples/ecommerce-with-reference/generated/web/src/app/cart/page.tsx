'use client';

import { useCart } from '@/context/cart-context';
import CartItemCard from '@/components/cart-item-card';
import CheckoutSummary from '@/components/checkout-summary';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { User } from '@/types';
import { useState } from 'react';

// Mock user for cart calculations
const MOCK_USER: User = {
  id: 1,
  email: 'test@example.com',
  loyaltyTier: 'silver', // Can be 'bronze', 'silver', 'gold'
  state: 'CA', // Can be 'CA', 'NY', 'TX', 'FL'
};

export default function CartPage() {
  const { cartItems, totalItems, getCartTotals } = useCart();
  const [user, setUser] = useState<User>(MOCK_USER); // State to allow changing user details if needed

  const { subtotal, discount, tax, total } = getCartTotals(user);

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-semibold mb-4 text-secondary-DEFAULT dark:text-secondary-dark">
          Your cart is empty
        </h1>
        <p className="text-lg mb-8 text-text-light dark:text-text-dark">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link href="/">
          <Button className="px-8 py-3 text-lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-primary-DEFAULT dark:text-primary-dark">
        Your Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>
        <div className="lg:col-span-1">
          <CheckoutSummary
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
            totalItems={totalItems}
            user={user}
            onUserChange={setUser} // Allow changing user details for testing
          />
          <Link href="/checkout">
            <Button className="w-full mt-6 py-3 text-lg">Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
