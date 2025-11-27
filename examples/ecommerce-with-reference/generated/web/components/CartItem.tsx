import Image from 'next/image';
import { CartItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
      <div className="flex items-center space-x-4">
        <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="80px"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500 dark:text-gray-400 text-xs">No Image</div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
          <p className="text-gray-600 dark:text-gray-300">{formatCurrency(item.price)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
          >
            -
          </button>
          <span className="px-3 text-gray-800 dark:text-white">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            +
          </button>
        </div>
        <button
          onClick={() => removeItem(item.id)}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-500 transition-colors duration-200"
          aria-label={`Remove ${item.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
