import Image from 'next/image';
import { Item } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Item;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{product.name}</h3>
        <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{formatCurrency(product.price)}</p>
        <button
          onClick={() => addItem(product)}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
