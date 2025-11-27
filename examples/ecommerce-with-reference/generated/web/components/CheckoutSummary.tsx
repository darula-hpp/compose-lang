import { formatCurrency } from '@/lib/utils';
import { OrderSummary } from '@/lib/types';

interface CheckoutSummaryProps {
  summary: OrderSummary;
}

export function CheckoutSummary({ summary }: CheckoutSummaryProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount:</span>
          <span className="text-red-500">- {formatCurrency(summary.discount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{formatCurrency(summary.tax)}</span>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
          <span>Total:</span>
          <span>{formatCurrency(summary.total)}</span>
        </div>
      </div>
    </div>
  );
}
