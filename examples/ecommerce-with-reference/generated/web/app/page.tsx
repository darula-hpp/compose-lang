import { ItemCard } from '@/components/ItemCard';
import { sampleProducts } from '@/lib/data';

export default function HomePage() {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-10">
        Welcome to MyShop!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sampleProducts.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
