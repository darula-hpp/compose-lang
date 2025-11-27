import { ProductCard } from '@/components/ProductCard';
import { products } from '@/data/products';

export default function Home() {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-10">
        Welcome to my shop!
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
