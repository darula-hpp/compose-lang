import { Item } from '@/types';
import { useCart } from '@/context/cart-context';
import Button from './ui/button';
import Input from './ui/input';

interface CartItemCardProps {
  item: Item;
}

export default function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };

  return (
    <div className="flex items-center bg-card-light dark:bg-card-dark p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">{item.name}</h3>
        <p className="text-secondary-DEFAULT dark:text-secondary-dark">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center space-x-4">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          className="w-20 text-center"
          aria-label={`Quantity for ${item.name}`}
        />
        <Button
          onClick={() => removeItem(item.id)}
          variant="danger"
          className="px-3 py-2 text-sm"
          aria-label={`Remove ${item.name} from cart`}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
