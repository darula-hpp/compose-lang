import ProductCard from '@/components/product-card';
import { Item } from '@/types';

// Mock product data
const products: Item[] = [
  { id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1 },
  { id: 2, name: 'Smartwatch', price: 199.99, quantity: 1 },
  { id: 3, name: 'Portable Bluetooth Speaker', price: 49.99, quantity: 1 },
  { id: 4, name: 'Ergonomic Office Chair', price: 249.99, quantity: 1 },
  { id: 5, name: '4K UHD Monitor', price: 349.99, quantity: 1 },
  { id: 6, name: 'Mechanical Keyboard', price: 79.99, quantity: 1 },
  { id: 7, name: 'Gaming Mouse', price: 39.99, quantity: 1 },
  { id: 8, name: 'External SSD 1TB', price: 129.99, quantity: 1 },
];

export default function Home() {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-primary-DEFAULT dark:text-primary-dark">
        Our Products
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
