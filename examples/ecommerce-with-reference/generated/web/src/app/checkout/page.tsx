'use client';

import { useCart } from '@/context/cart-context';
import CheckoutSummary from '@/components/checkout-summary';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User } from '@/types';

// Mock user for checkout calculations
const MOCK_USER: User = {
  id: 1,
  email: 'customer@example.com',
  loyaltyTier: 'silver',
  state: 'CA',
};

export default function CheckoutPage() {
  const { cartItems, totalItems, clearCart, getCartTotals } = useCart();
  const router = useRouter();
  const [user, setUser] = useState<User>(MOCK_USER);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { subtotal, discount, tax, total } = getCartTotals(user);

  const handleProcessPayment = async () => {
    setPaymentProcessing(true);
    setPaymentError(null);

    if (cartItems.length === 0) {
      setPaymentError('Your cart is empty. Please add items before checking out.');
      setPaymentProcessing(false);
      return;
    }

    try {
      // Simulate API call to process payment and create order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          user: user,
          subtotal,
          discount,
          tax,
          total,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed. Please try again.');
      }

      // Payment successful, clear cart and redirect to confirmation
      clearCart();
      router.push('/confirmation');
    } catch (error: any) {
      console.error('Checkout error:', error);
      setPaymentError(error.message || 'An unexpected error occurred during checkout.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-3xl font-semibold mb-4 text-secondary-DEFAULT dark:text-secondary-dark">
          Your cart is empty
        </h1>
        <p className="text-lg mb-8 text-text-light dark:text-text-dark">
          Please add items to your cart before proceeding to checkout.
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
        Checkout
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6 p-6 bg-card-light dark:bg-card-dark rounded-lg shadow-custom-light dark:shadow-custom-dark">
          <h2 className="text-2xl font-semibold mb-4">Shipping & Payment Details</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <Input
                type="email"
                id="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-1">
                Shipping State (for tax calculation)
              </label>
              <Input
                type="text"
                id="state"
                value={user.state}
                onChange={(e) => setUser({ ...user, state: e.target.value.toUpperCase() })}
                placeholder="e.g., CA, NY, TX"
                maxLength={2}
                required
              />
            </div>
            <div>
              <label htmlFor="loyaltyTier" className="block text-sm font-medium mb-1">
                Loyalty Tier
              </label>
              <select
                id="loyaltyTier"
                value={user.loyaltyTier}
                onChange={(e) => setUser({ ...user, loyaltyTier: e.target.value as User['loyaltyTier'] })}
                className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
              </select>
            </div>
            {/* Payment details - simulated */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
                Card Number
              </label>
              <Input
                type="text"
                id="cardNumber"
                placeholder="**** **** **** ****"
                maxLength={19}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                  Expiry Date
                </label>
                <Input type="text" id="expiry" placeholder="MM/YY" maxLength={5} required />
              </div>
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium mb-1">
                  CVV
                </label>
                <Input type="text" id="cvv" placeholder="***" maxLength={3} required />
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <CheckoutSummary
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
            totalItems={totalItems}
            user={user}
            onUserChange={setUser}
          />
          {paymentError && (
            <p className="text-red-500 text-sm text-center">{paymentError}</p>
          )}
          <Button
            onClick={handleProcessPayment}
            className="w-full py-3 text-lg"
            disabled={paymentProcessing || cartItems.length === 0}
          >
            {paymentProcessing ? 'Processing Payment...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
