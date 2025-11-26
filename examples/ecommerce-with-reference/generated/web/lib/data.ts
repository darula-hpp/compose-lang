import { Item, User } from './types';

export const sampleProducts: Item[] = [
  { id: 1, name: 'Wireless Mouse', price: 25.99, quantity: 1 },
  { id: 2, name: 'Mechanical Keyboard', price: 79.99, quantity: 1 },
  { id: 3, name: 'USB-C Hub', price: 39.99, quantity: 1 },
  { id: 4, name: 'Monitor Stand', price: 49.99, quantity: 1 },
  { id: 5, name: 'Webcam 1080p', price: 59.99, quantity: 1 },
  { id: 6, name: 'Noise-Cancelling Headphones', price: 129.99, quantity: 1 },
  { id: 7, name: 'External SSD 1TB', price: 99.99, quantity: 1 },
  { id: 8, name: 'Ergonomic Chair', price: 299.99, quantity: 1 },
];

export const defaultUser: User = {
  id: 1,
  email: 'john.doe@example.com',
  loyaltyTier: 'gold', // Can be 'bronze', 'silver', 'gold' for testing discounts
  state: 'CA', // Can be 'NY', 'TX', 'FL', 'IL', 'DEFAULT' for testing tax
};
