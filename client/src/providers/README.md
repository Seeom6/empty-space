# Providers Setup

This directory contains the React context providers that wrap the entire application.

## QueryProvider

The `QueryProvider` sets up TanStack Query (React Query) for the entire application.

### Features

- **QueryClient Configuration**: Optimized settings for caching, retries, and background updates
- **Authentication Integration**: Automatically sets JWT token from localStorage
- **Development Tools**: React Query DevTools enabled in development mode
- **Error Handling**: Smart retry logic that doesn't retry on 4xx client errors

### Configuration

```typescript
{
  queries: {
    staleTime: 2 * 60 * 1000,     // 2 minutes - how long data is fresh
    gcTime: 5 * 60 * 1000,        // 5 minutes - how long data stays in cache
    retry: 3,                      // Retry failed requests up to 3 times
    refetchOnWindowFocus: false,   // Don't refetch when window gains focus
    refetchOnReconnect: true,      // Refetch when network reconnects
  },
  mutations: {
    retry: 1,                      // Retry failed mutations once
  }
}
```

### Usage

The QueryProvider is automatically set up in the root layout and provides:

1. **API State Management**: All API calls use React Query for caching and state management
2. **Background Updates**: Data is automatically refreshed in the background
3. **Optimistic Updates**: UI updates immediately, rolls back on error
4. **Loading States**: Automatic loading state management
5. **Error Handling**: Centralized error handling with retry logic

### Authentication Integration

The provider automatically:
- Reads JWT token from localStorage on initialization
- Sets the token in the API client for authenticated requests
- Works with the existing AuthProvider for seamless authentication

### Development Tools

In development mode, the React Query DevTools are available:
- Press the React Query icon in the bottom corner
- Inspect query states, cache contents, and network requests
- Debug performance and caching issues

## Integration with API Client

The QueryProvider works seamlessly with our API client:

```typescript
// The API hooks automatically use the QueryClient
import { useTechnologies, useCreateTechnology } from '@/lib/api'

function TechnologiesPage() {
  const { data: technologies, isLoading } = useTechnologies()
  const createMutation = useCreateTechnology()
  
  // All caching, error handling, and loading states are automatic
}
```

## Error Handling Strategy

The QueryProvider implements smart error handling:

1. **Client Errors (4xx)**: No retry, immediate error display
2. **Server Errors (5xx)**: Retry with exponential backoff
3. **Network Errors**: Retry with exponential backoff
4. **Authentication Errors**: Automatic token cleanup and redirect

## Performance Optimizations

- **Stale While Revalidate**: Show cached data immediately, update in background
- **Garbage Collection**: Unused data is cleaned up after 5 minutes
- **Request Deduplication**: Multiple identical requests are automatically deduplicated
- **Background Refetching**: Data stays fresh without user interaction

## Troubleshooting

### "No QueryClient set" Error

This error occurs when React Query hooks are used outside of the QueryClientProvider. Make sure:

1. QueryProvider is in the root layout
2. All components using API hooks are children of QueryProvider
3. The provider is imported correctly

### Authentication Issues

If API calls return 401 errors:

1. Check that localStorage contains 'auth_token'
2. Verify the token is valid and not expired
3. Ensure the AuthProvider is setting the token correctly

### Cache Issues

If data seems stale or not updating:

1. Check the staleTime and gcTime settings
2. Use React Query DevTools to inspect cache state
3. Consider calling `refetch()` or `invalidateQueries()` manually
