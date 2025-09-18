import { PositionStatus, PositionFilters } from './types'

// Position Status Constants
export const POSITION_STATUSES: PositionStatus[] = ['ACTIVE', 'INACTIVE']

export const POSITION_STATUS_LABELS: Record<PositionStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
}

export const POSITION_STATUS_COLORS: Record<PositionStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
  INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200'
}

// Default Values
export const DEFAULT_POSITION_FILTERS: PositionFilters = {
  search: '',
  status: 'all',
  department: 'all'
}

// Basic validation constants
export const POSITION_NAME_MIN_LENGTH = 3
export const POSITION_NAME_MAX_LENGTH = 255

// Role-based Access
export const POSITION_ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['position:view', 'position:create', 'position:edit', 'position:delete'],
  ADMIN: ['position:view', 'position:create', 'position:edit', 'position:delete'],
  EMPLOYEE: ['position:view'],
  OPERATOR: ['position:view', 'position:create', 'position:edit']
} as const

// Query Keys for React Query
export const POSITION_QUERY_KEYS = {
  ALL: ['positions'] as const,
  LISTS: () => [...POSITION_QUERY_KEYS.ALL, 'list'] as const,
  DETAILS: () => [...POSITION_QUERY_KEYS.ALL, 'detail'] as const,
  DETAIL: (id: string) => [...POSITION_QUERY_KEYS.DETAILS(), id] as const,
  STATS: () => [...POSITION_QUERY_KEYS.ALL, 'stats'] as const,
  SEARCH: (query: string) => [...POSITION_QUERY_KEYS.ALL, 'search', query] as const,
  BY_DEPARTMENT: (departmentId: string) => [...POSITION_QUERY_KEYS.ALL, 'department', departmentId] as const,
  ACTIVE: () => [...POSITION_QUERY_KEYS.ALL, 'active'] as const
} as const

// Cache Times (in milliseconds)
export const POSITION_CACHE_TIMES = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  SEARCH_STALE_TIME: 30 * 1000, // 30 seconds
  STATS_STALE_TIME: 2 * 60 * 1000 // 2 minutes
} as const
