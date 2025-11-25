import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global staleTime for all queries (e.g., 5 minutes)
      staleTime: 1000 * 60 * 5,
      // Global cacheTime (how long unused/inactive query data remains in cache)
      gcTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: true, // Refetch data when window regains focus
      refetchOnMount: true, // Refetch data when component mounts
      refetchOnReconnect: true, // Refetch data when network reconnects
      retry: 3, // Retry failed queries 3 times
    },
    mutations: {
      // Global mutation options can be set here
      // For example, a default onError handler
      onError: (error) => {
        console.error('Mutation error:', error);
        // toast.error(`Something went wrong: ${error.message}`); // Handled in individual mutations for specific messages
      },
    },
  },
});
