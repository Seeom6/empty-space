import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  useTechnologies as useApiTechnologies,
  useTechnologyStatistics,
  useCreateTechnology,
  useUpdateTechnology,
  useDeleteTechnology,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
  ApiError,
  ErrorCodes
} from '@/lib/api'
import {
  Technology as DashboardTechnology,
  TechnologyFilters,
  UseTechnologiesReturn
} from '../types'
import { filterTechnologies, calculateTechnologyStats } from '../utils'

// Use DashboardTechnology as the main Technology type to avoid confusion
type Technology = DashboardTechnology

// Helper function to convert API technology to dashboard technology
const convertApiTechnologyToDashboard = (apiTech: any): Technology => {

  // Handle both API response formats (actual vs expected)
  const normalizeStatus = (status: string): 'active' | 'inactive' => {
    const statusLower = status.toLowerCase();
    return statusLower === 'active' ? 'active' : 'inactive';
  };

  // Normalize category - default to 'Frontend' if unknown
  const normalizeCategory = (category: string): Technology['category'] => {
    const validCategories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Design', 'Testing', 'Analytics'];
    return validCategories.includes(category) ? category as Technology['category'] : 'Frontend';
  };

  const converted = {
    id: apiTech.id,
    name: apiTech.name,
    category: normalizeCategory(apiTech.category),
    description: apiTech.description,
    status: normalizeStatus(apiTech.status),
    version: apiTech.version || '1.0.0',
    icon: apiTech.icon || undefined,
    documentationUrl: apiTech.website || apiTech.documentationUrl || undefined,
    userCount: apiTech.userCount || 0,
    createdAt: apiTech.createdAt instanceof Date ? apiTech.createdAt.toISOString() : String(apiTech.createdAt),
    updatedAt: apiTech.updatedAt instanceof Date ? apiTech.updatedAt.toISOString() : String(apiTech.updatedAt),
    createdBy: apiTech.createdBy || 'System'
  };

  return converted;
}

// Helper function to convert dashboard technology to API create request
const convertDashboardToApiCreate = (dashboardTech: Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>): CreateTechnologyRequest => ({
  name: dashboardTech.name,
  description: dashboardTech.description,
  icon: dashboardTech.icon || 'default-icon.png',
  website: dashboardTech.documentationUrl || '',
  version: dashboardTech.version,
  category: String(dashboardTech.category) // Convert TechnologyCategory to string
})

// Helper function to convert dashboard technology to API update request
const convertDashboardToApiUpdate = (dashboardTech: Technology): UpdateTechnologyRequest => ({
  name: dashboardTech.name,
  description: dashboardTech.description,
  status: dashboardTech.status === 'active' ? 'ACTIVE' : 'INACTIVE',
  icon: dashboardTech.icon || 'default-icon.png',
  website: dashboardTech.documentationUrl || '',
  version: dashboardTech.version,
  category: String(dashboardTech.category) // Convert TechnologyCategory to string
})

export const useTechnologies = (): UseTechnologiesReturn => {
  const [filters, setFiltersState] = useState<TechnologyFilters>({
    search: '',
    category: 'all',
    status: 'all'
  })
  const [error, setError] = useState<string | null>(null)

  // API Queries with error handling

  const {
    data: apiTechnologies,
    isLoading,
    error: apiError,
    refetch
  } = useApiTechnologies({
    retry: false, // Disable retry to prevent infinite loops
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })



  const { data: apiStats } = useTechnologyStatistics({
    retry: false, // Disable retry to prevent infinite loops
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // Handle API errors in useEffect to prevent infinite re-renders
  useEffect(() => {
    if (apiError) {
      if (apiError.code === ErrorCodes.UNAUTHORIZED) {
        setError('You are not authorized to view technologies. Please login as SUPER_ADMIN.')
      } else if (apiError.code === ErrorCodes.FORBIDDEN) {
        setError('Access denied. SUPER_ADMIN role required.')
      } else {
        setError(`Failed to load technologies: ${apiError.message}`)
      }
    } else {
      setError(null)
    }
  }, [apiError])

  // API Mutations
  const createMutation = useCreateTechnology({
    onSuccess: () => {
      refetch()
      setError(null)
    },
    onError: (error: ApiError) => {
      if (error.code === ErrorCodes.TECHNOLOGY_ALREADY_EXISTS) {
        setError('A technology with this name already exists')
      } else if (error.code === ErrorCodes.VALIDATION_ERROR) {
        setError(`Validation error: ${error.message}`)
      } else if (error.isAuthError()) {
        setError('Authentication required. Please login as SUPER_ADMIN.')
      } else {
        setError(`Failed to create technology: ${error.message}`)
      }
    }
  })

  const updateMutation = useUpdateTechnology({
    onSuccess: () => {
      refetch()
      setError(null)
    },
    onError: (error: ApiError) => {
      if (error.code === ErrorCodes.TECHNOLOGY_NOT_FOUND) {
        setError('Technology not found')
      } else if (error.code === ErrorCodes.TECHNOLOGY_ALREADY_EXISTS) {
        setError('A technology with this name already exists')
      } else if (error.code === ErrorCodes.VALIDATION_ERROR) {
        setError(`Validation error: ${error.message}`)
      } else {
        setError(`Failed to update technology: ${error.message}`)
      }
    }
  })

  const deleteMutation = useDeleteTechnology({
    onSuccess: () => {
      refetch()
      setError(null)
    },
    onError: (error: ApiError) => {
      if (error.code === ErrorCodes.TECHNOLOGY_NOT_FOUND) {
        setError('Technology not found')
      } else {
        setError(`Failed to delete technology: ${error.message}`)
      }
    }
  })

  // Convert API technologies to dashboard format
  const technologies = useMemo(() => {
    if (!apiTechnologies || !Array.isArray(apiTechnologies)) {
      return []
    }

    const processedTechnologies = apiTechnologies
      .filter((tech: any) => !tech.isDeleted) // Use any type since API response might differ
      .map(convertApiTechnologyToDashboard)

    return processedTechnologies;
  }, [apiTechnologies])

  // Memoized filtered technologies
  const filteredTechnologies = useMemo(() => {
    return filterTechnologies(technologies, filters);
  }, [technologies, filters])

  // Memoized statistics - convert API stats to dashboard format
  const stats = useMemo(() => {
    if (apiStats && typeof apiStats === 'object' && 'count' in apiStats && 'status' in apiStats) {
      const statsData = apiStats as any // Type assertion for the API response
      const totalCount = statsData.count?.[0]?.count || 0
      const activeCount = statsData.status?.find((s: any) => s.status === 'ACTIVE')?.count || 0
      const inactiveCount = statsData.status?.find((s: any) => s.status === 'INACTIVE')?.count || 0

      return {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        deprecated: 0, // Not supported by API yet
        categories: technologies.reduce((acc, tech) => {
          acc[tech.category] = (acc[tech.category] || 0) + 1
          return acc
        }, {} as Record<Technology['category'], number>)
      }
    }
    return calculateTechnologyStats(technologies)
  }, [apiStats, technologies])

  // Filter update handler
  const setFilters = useCallback((newFilters: Partial<TechnologyFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Create technology
  const createTechnology = useCallback((newTech: Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>) => {
    const apiRequest = convertDashboardToApiCreate(newTech)
    createMutation.mutate(apiRequest)
  }, [createMutation])

  // Update technology
  const updateTechnology = useCallback((updatedTech: Technology) => {
    const apiRequest = convertDashboardToApiUpdate(updatedTech)
    updateMutation.mutate({ id: updatedTech.id, data: apiRequest })
  }, [updateMutation])

  // Delete technology
  const deleteTechnology = useCallback((id: string) => {
    deleteMutation.mutate(id)
  }, [deleteMutation])

  // Refresh technologies
  const refreshTechnologies = useCallback(async () => {
    setError(null)
    refetch()
  }, [refetch])

  return {
    technologies,
    filteredTechnologies,
    stats,
    filters,
    isLoading: isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: error || (apiError ? apiError.message : null),
    actions: {
      setFilters,
      createTechnology,
      updateTechnology,
      deleteTechnology,
      refreshTechnologies
    }
  }
}
