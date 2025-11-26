'use client';

import { Item } from '@/types';
import Button from './ui/button';
import { useCart } from '@/context/cart-context';

interface ProductCardProps {
  product: Item;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-custom-light dark:shadow-custom-dark p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-semibold mb-2 text-text-light dark:text-text-dark">{product.name}</h3>
      <p className="text-2xl font-bold text-primary-DEFAULT dark:text-primary-dark mb-4">${product.price.toFixed(2)}</p>
      <Button onClick={() => addItem(product)} className="mt-auto px-6 py-2">
        Add to Cart
      </Button>
    </div>
  );
}
