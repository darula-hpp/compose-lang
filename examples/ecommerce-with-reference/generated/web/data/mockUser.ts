import { User } from '@/lib/types';

export const mockUser: User = {
  id: 1,
  email: 'john.doe@example.com',
  loyaltyTier: 'silver', // Can be 'bronze', 'silver', 'gold'
  state: 'CA', // For tax calculation
};
