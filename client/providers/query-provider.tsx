'use client'

import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { setAuthToken } from '@/lib/api/index'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Initialize API client with auth token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      console.log('🔧 QueryProvider: Checking for auth token in localStorage:', token ? 'Found' : 'Not found')
      if (token) {
        setAuthToken(token)
        console.log('✅ QueryProvider: Auth token set in API client')
      } else {
        console.log('❌ QueryProvider: No auth token found')
      }
    }
  }, [])

  // Create a stable QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time - how long data is considered fresh
            staleTime: 2 * 60 * 1000, // 2 minutes
            
            // GC time - how long data stays in cache after becoming unused
            gcTime: 5 * 60 * 1000, // 5 minutes
            
            // Retry configuration
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false
              }
              
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Refetch on window focus (useful for real-time updates)
            refetchOnWindowFocus: false,
            
            // Refetch on reconnect
            refetchOnReconnect: true,
            
            // Background refetch interval (disabled by default)
            refetchInterval: false,
          },
          mutations: {
            // Retry configuration for mutations
            retry: (failureCount, error: any) => {
              // Don't retry mutations on client errors
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false
              }
              
              // Retry once for server errors
              return failureCount < 1
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

export default QueryProvider
