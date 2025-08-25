import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Technology, TechnologyFilters, TechnologyStats } from '../types'

// Create a custom render function that includes providers
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock data factories
export const createMockTechnology = (overrides: Partial<Technology> = {}): Technology => ({
  id: 'test-tech-1',
  name: 'Test Technology',
  category: 'Frontend',
  description: 'A test technology for unit testing',
  status: 'active',
  version: '1.0.0',
  icon: '🧪',
  documentationUrl: 'https://test.com',
  userCount: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdBy: 'Test User',
  ...overrides,
})

export const createMockTechnologies = (count: number = 3): Technology[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockTechnology({
      id: `test-tech-${index + 1}`,
      name: `Test Technology ${index + 1}`,
      category: ['Frontend', 'Backend', 'Database'][index % 3] as Technology['category'],
      status: ['active', 'inactive'][index % 2] as Technology['status'],
      userCount: Math.floor(Math.random() * 20) + 1,
    })
  )
}

export const createMockFilters = (overrides: Partial<TechnologyFilters> = {}): TechnologyFilters => ({
  search: '',
  category: 'all',
  status: 'all',
  ...overrides,
})

export const createMockStats = (overrides: Partial<TechnologyStats> = {}): TechnologyStats => ({
  total: 10,
  active: 7,
  inactive: 2,
  deprecated: 1,
  categories: {
    Frontend: 4,
    Backend: 3,
    Database: 2,
    DevOps: 1,
    Mobile: 0,
    Design: 0,
    Testing: 0,
    Analytics: 0,
  },
  ...overrides,
})

// Mock API responses
export const createMockApiResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
})

export const createMockApiError = (message: string, code?: string) => ({
  message,
  code,
  isAuthError: () => code === '4013' || code === '4001',
  response: {
    status: 400,
    data: { message, code },
  },
})

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export const mockConsoleMethod = (method: 'log' | 'error' | 'warn') => {
  const originalMethod = console[method]
  const mockMethod = jest.fn()
  console[method] = mockMethod
  
  return {
    mockMethod,
    restore: () => {
      console[method] = originalMethod
    },
  }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }
