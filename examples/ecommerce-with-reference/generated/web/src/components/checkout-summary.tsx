import { User, LoyaltyTier } from '@/types';
import Input from './ui/input';
import { Dispatch, SetStateAction } from 'react';

interface CheckoutSummaryProps {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalItems: number;
  user: User;
  onUserChange: Dispatch<SetStateAction<User>>;
}

export default function CheckoutSummary({
  subtotal,
  discount,
  tax,
  total,
  totalItems,
  user,
  onUserChange,
}: CheckoutSummaryProps) {
  return (
    <div className="bg-card-light dark:bg-card-dark p-6 rounded-lg shadow-custom-light dark:shadow-custom-dark space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-primary-DEFAULT dark:text-primary-dark">
        Order Summary
      </h2>
      <div className="space-y-2 text-text-light dark:text-text-dark">
        <div className="flex justify-between">
          <span>Items ({totalItems}) Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span className="text-red-500">-${discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({user.state}):</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between text-xl font-bold">
          <span>Order Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
          Customer Details (for calculation)
        </h3>
        <div>
          <label htmlFor="summary-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="summary-email"
            type="email"
            value={user.email}
            onChange={(e) => onUserChange({ ...user, email: e.target.value })}
            placeholder="customer@example.com"
            className="text-sm"
          />
        </div>
        <div>
          <label htmlFor="summary-state" className="block text-sm font-medium mb-1">
            State (for Tax)
          </label>
          <Input
            id="summary-state"
            type="text"
            value={user.state}
            onChange={(e) => onUserChange({ ...user, state: e.target.value.toUpperCase() })}
            placeholder="e.g., CA, NY"
            maxLength={2}
            className="text-sm"
          />
        </div>
        <div>
          <label htmlFor="summary-loyalty" className="block text-sm font-medium mb-1">
            Loyalty Tier (for Discount)
          </label>
          <select
            id="summary-loyalty"
            value={user.loyaltyTier}
            onChange={(e) => onUserChange({ ...user, loyaltyTier: e.target.value as LoyaltyTier })}
            className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-DEFAULT focus:border-primary-DEFAULT text-sm"
          >
            <option value="bronze">Bronze</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
          </select>
        </div>
      </div>
    </div>
  );
}
