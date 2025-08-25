import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { ApiError } from './client';

// Default query options
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Stale time - how long data is considered fresh
    staleTime: 2 * 60 * 1000, // 2 minutes
    
    // Cache time - how long data stays in cache after becoming unused
    
    // Retry configuration
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof ApiError) {
        if (error.code >= 400 && error.code < 500) {
          return false;
        }
      }
      
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus (useful for real-time updates)
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Background refetch interval (disabled by default)
    refetchInterval: false,
    
    // Error handling is now done via global error boundary or individual query error handling
  },
  mutations: {
    // Retry configuration for mutations
    retry: (failureCount, error) => {
      // Don't retry mutations on client errors
      if (error instanceof ApiError) {
        if (error.code >= 400 && error.code < 500) {
          return false;
        }
      }
      
      // Retry once for server errors
      return failureCount < 1;
    },
    
    // Error handling
    onError: (error) => {
      console.error('Mutation Error:', error);
    },
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// Query client configuration for development
if (process.env.NODE_ENV === 'development') {
  // Enable more detailed logging in development
  queryClient.setDefaultOptions({
    queries: {
      ...defaultQueryOptions.queries,
      // Error handling is now done via global error boundary or individual query error handling
    },
    mutations: {
      ...defaultQueryOptions.mutations,
      // Error handling is now done via global error boundary or individual mutation error handling
    },
  });
}

// Utility functions for cache management

/**
 * Clear all cached data
 */
export const clearAllCache = () => {
  queryClient.clear();
};

/**
 * Clear cache for specific system
 */
export const clearSystemCache = (system: 'technology' | 'department' | 'position') => {
  queryClient.removeQueries({ queryKey: [system] });
};

/**
 * Prefetch data for better UX
 */
export const prefetchSystemData = async () => {
  // Import services dynamically to avoid circular dependencies
  const { TechnologyService } = await import('./services/technologyService');
  const { DepartmentService } = await import('./services/departmentService');
  
  // Prefetch commonly used data
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: ['department', 'all'],
      queryFn: DepartmentService.getAll,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: ['technology', 'statistics'],
      queryFn: TechnologyService.getStatistics,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),
  ]);
};

/**
 * Invalidate all data (useful after login/logout)
 */
export const invalidateAllData = () => {
  queryClient.invalidateQueries();
};

/**
 * Get cached data without triggering a fetch
 */
export const getCachedData = <T>(queryKey: unknown[]): T | undefined => {
  return queryClient.getQueryData<T>(queryKey);
};

/**
 * Set cached data manually
 */
export const setCachedData = <T>(queryKey: unknown[], data: T) => {
  queryClient.setQueryData<T>(queryKey, data);
};

/**
 * Check if query is currently fetching
 */
export const isQueryFetching = (queryKey: unknown[]): boolean => {
  return queryClient.isFetching({ queryKey }) > 0;
};

/**
 * Check if mutation is currently running
 */
export const isMutating = (mutationKey?: unknown[]): boolean => {
  return queryClient.isMutating({ mutationKey }) > 0;
};

export default queryClient;
