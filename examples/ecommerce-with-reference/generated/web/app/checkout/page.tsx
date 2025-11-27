'use client';

import { useCart } from '@/context/CartContext';
import { CheckoutSummary } from '@/components/CheckoutSummary';
import { mockUser } from '@/data/mockUser';
import { formatCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckoutPage() {
  const { cartItems, orderSummary, clearCart, isLoading } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && cartItems.length === 0 && !paymentSuccess) {
      router.push('/'); // Redirect to home if cart is empty and not just completed payment
    }
  }, [cartItems, isLoading, paymentSuccess, router]);

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real application, you would send order details to a backend
    // and handle payment gateway integration here.
    console.log('Processing payment for:', {
      items: cartItems,
      user: mockUser,
      orderSummary,
    });

    // Simulate success
    setPaymentSuccess(true);
    clearCart(); // Clear cart after successful payment
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-700 dark:text-gray-300">
        Loading checkout details...
      </div>
    );
  }

  if (cartItems.length === 0 && !paymentSuccess) {
    return null; // Redirect handled by useEffect
  }

  if (paymentSuccess) {
    return (
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-4">
          Order Confirmed!
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
          Thank you for your purchase, {mockUser.email}!
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          Your order total was {formatCurrency(orderSummary.total)}. A confirmation email has been sent.
        </p>
        <button
          onClick={() => router.push('/')}
          className="inline-block bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
        Checkout
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Shipping Information
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              Email: <span className="font-semibold">{mockUser.email}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Loyalty Tier: <span className="font-semibold capitalize">{mockUser.loyaltyTier}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Shipping Address: <span className="font-semibold">123 Main St, {mockUser.state}, 90210</span> (Mock)
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Payment Method
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p className="text-gray-700 dark:text-gray-300">
              Credit Card: **** **** **** 1234 (Mock)
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              Expiry: 12/25 (Mock)
            </p>
          </div>
        </div>
        <div>
          <CheckoutSummary summary={orderSummary} />
          <button
            onClick={handleProcessPayment}
            disabled={isProcessing}
            className="mt-6 w-full block text-center bg-blue-600 text-white py-3 px-6 rounded-md text-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing Payment...' : `Pay ${formatCurrency(orderSummary.total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
