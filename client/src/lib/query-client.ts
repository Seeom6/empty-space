import { QueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408, 429
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          if (error?.response?.status === 408 || error?.response?.status === 429) {
            return failureCount < 2
          }
          return false
        }
        // Retry on network errors and 5xx errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      onError: (error: any) => {
        // Error handling is already done in axios interceptors
        // This is just a fallback
        if (!error?.response) {
          toast.error('Network error. Please check your connection.')
        }
      },
    },
  },
})

// Query keys factory
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  
  // Teams
  teams: {
    all: ['teams'] as const,
    lists: () => [...queryKeys.teams.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.teams.lists(), filters] as const,
    details: () => [...queryKeys.teams.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teams.details(), id] as const,
  },
  
  // Technologies
  technologies: {
    all: ['technologies'] as const,
    lists: () => [...queryKeys.technologies.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.technologies.lists(), filters] as const,
    details: () => [...queryKeys.technologies.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.technologies.details(), id] as const,
  },
  
  // Attendance
  attendance: {
    all: ['attendance'] as const,
    lists: () => [...queryKeys.attendance.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.attendance.lists(), filters] as const,
    my: () => [...queryKeys.attendance.all, 'my'] as const,
    myList: (filters: any) => [...queryKeys.attendance.my(), filters] as const,
  },
  
  // Payroll
  payroll: {
    all: ['payroll'] as const,
    lists: () => [...queryKeys.payroll.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.payroll.lists(), filters] as const,
    details: () => [...queryKeys.payroll.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.payroll.details(), id] as const,
  },
  
  // Performance
  performance: {
    all: ['performance'] as const,
    lists: () => [...queryKeys.performance.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.performance.lists(), filters] as const,
    details: () => [...queryKeys.performance.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.performance.details(), id] as const,
    goals: (userId: string) => [...queryKeys.performance.all, 'goals', userId] as const,
  },
  
  // Invites
  invites: {
    all: ['invites'] as const,
    lists: () => [...queryKeys.invites.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.invites.lists(), filters] as const,
  },
  
  // Roles
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
    permissions: ['permissions'] as const,
  },
  
  // Analytics
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    projects: (filters: any) => [...queryKeys.analytics.all, 'projects', filters] as const,
    tasks: (filters: any) => [...queryKeys.analytics.all, 'tasks', filters] as const,
    employees: (filters: any) => [...queryKeys.analytics.all, 'employees', filters] as const,
    attendance: (filters: any) => [...queryKeys.analytics.all, 'attendance', filters] as const,
    payroll: (filters: any) => [...queryKeys.analytics.all, 'payroll', filters] as const,
    reports: () => [...queryKeys.analytics.all, 'reports'] as const,
  },
}
