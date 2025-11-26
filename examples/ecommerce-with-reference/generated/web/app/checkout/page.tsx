import { CheckoutSummary } from '@/components/CheckoutSummary';
import { CartItemCard } from '@/components/CartItemCard';
import { useCart } from '@/components/providers/CartProvider';

// This component is a client component because it uses useCart hook
export default function CheckoutPage() {
  const { cartItems } = useCart();

  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 dark:text-gray-100 mb-10">
        Checkout
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Items in your cart</h2>
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-700 dark:text-gray-300 text-xl">Your cart is empty. Please add items to proceed.</p>
          ) : (
            cartItems.map((item) => <CartItemCard key={item.id} item={item} />)
          )}
        </div>
        <div className="lg:col-span-1">
          <CheckoutSummary />
        </div>
      </div>
    </div>
  );
}
