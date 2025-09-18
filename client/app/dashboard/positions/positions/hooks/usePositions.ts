import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import PositionService from '@/lib/api/services/positionService'
import DepartmentService from '@/lib/api/services/departmentService'
import {
  Position,
  PositionWithDepartment,
  CreatePositionRequest,
  UpdatePositionRequest,
  Department
} from '@/lib/api/types'
import {
  PositionFilters,
  PositionStats
} from '../types'
import {
  POSITION_QUERY_KEYS,
  POSITION_CACHE_TIMES,
  DEFAULT_POSITION_FILTERS
} from '../constants'
import { filterPositions, calculatePositionStats } from '../utils'

/**
 * Main hook for Position management
 * Provides comprehensive state management for positions with React Query
 */
export const usePositions = () => {
  const queryClient = useQueryClient()
  
  // Local state for filters and UI
  const [filters, setFiltersState] = useState<PositionFilters>(DEFAULT_POSITION_FILTERS)
  const [error, setError] = useState<string | null>(null)

  // API Queries with error handling
  const {
    data: apiPositions,
    isLoading,
    error: apiError,
    refetch
  } = useQuery({
    queryKey: POSITION_QUERY_KEYS.ALL,
    queryFn: async () => {
      console.log('🚀 Fetching positions from API...')
      const result = await PositionService.getAll()
      console.log('📦 Raw API Response:', result)
      console.log('📊 Positions count:', Array.isArray(result) ? result.length : 'Not an array')
      return result
    },
    staleTime: POSITION_CACHE_TIMES.STALE_TIME,
    gcTime: POSITION_CACHE_TIMES.GC_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Departments query for dropdowns
  const {
    data: departments,
    isLoading: isDepartmentsLoading
  } = useQuery({
    queryKey: ['departments'],
    queryFn: DepartmentService.getAll,
    staleTime: POSITION_CACHE_TIMES.STALE_TIME,
    gcTime: POSITION_CACHE_TIMES.GC_TIME,
  })

  // Position statistics query
  const {
    data: apiStats,
    isLoading: isStatsLoading
  } = useQuery({
    queryKey: POSITION_QUERY_KEYS.STATS(),
    queryFn: PositionService.getStatistics,
    staleTime: POSITION_CACHE_TIMES.STATS_STALE_TIME,
    gcTime: POSITION_CACHE_TIMES.GC_TIME,
  })

  // Convert API positions to dashboard format
  const positions = useMemo(() => {
    console.log('🔄 Processing API positions:', apiPositions)

    if (!apiPositions || !Array.isArray(apiPositions)) {
      console.log('❌ No positions data or not an array:', apiPositions)
      return []
    }

    console.log('📋 Raw positions before filtering:', apiPositions.length)

    const filtered = apiPositions.filter((position: any) => {
      // If isDeleted field exists, filter by it, otherwise include all
      const shouldInclude = position.isDeleted === undefined || !position.isDeleted
      console.log(`🔍 Position ${position.name}: isDeleted=${position.isDeleted}, include=${shouldInclude}`)
      return shouldInclude
    })

    console.log('📋 Positions after filtering:', filtered.length)

    const transformed = filtered.map((position: any) => ({
      id: position.id || position._id,
      name: position.name || 'Unnamed Position',
      departmentId: position.departmentId || position.department || 'unknown',
      description: position.description || '',
      status: position.status || 'ACTIVE',
      isDeleted: position.isDeleted || false,
      createdAt: position.createdAt,
      updatedAt: position.updatedAt
    }))

    console.log('✅ Final transformed positions:', transformed)
    return transformed
  }, [apiPositions])

  // Return positions without filtering for now
  const filteredPositions = useMemo(() => {
    return positions
  }, [positions])

  // Memoized statistics
  const stats = useMemo(() => {
    if (apiStats) {
      // Convert byDepartment to departments for compatibility
      return {
        total: apiStats.total,
        active: apiStats.active,
        inactive: apiStats.inactive,
        departments: apiStats.byDepartment || {}
      }
    }
    // Ensure departments is always an array
    const safeDepartments = Array.isArray(departments) ? departments : []
    return calculatePositionStats(positions, safeDepartments)
  }, [apiStats, positions, departments])

  // Filter update handler
  const setFilters = useCallback((newFilters: Partial<PositionFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Create position mutation
  const createMutation = useMutation({
    mutationFn: PositionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.ALL })
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.STATS() })
      toast.success('Position created successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to create position. Please try again.'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Update position mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePositionRequest }) =>
      PositionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.ALL })
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.STATS() })
      toast.success('Position updated successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to update position. Please try again.'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Delete position mutation
  const deleteMutation = useMutation({
    mutationFn: PositionService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.ALL })
      queryClient.invalidateQueries({ queryKey: POSITION_QUERY_KEYS.STATS() })
      toast.success('Position deleted successfully!')
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to delete position. Please try again.'
      toast.error(errorMessage)
      setError(errorMessage)
    }
  })

  // Refresh positions
  const refreshPositions = useCallback(async () => {
    setError(null)
    refetch()
  }, [refetch])

  // Create position
  const createPosition = useCallback((newPosition: CreatePositionRequest) => {
    createMutation.mutate(newPosition)
  }, [createMutation])

  // Update position
  const updatePosition = useCallback((id: string, updatedPosition: UpdatePositionRequest) => {
    updateMutation.mutate({ id, data: updatedPosition })
  }, [updateMutation])

  // Delete position
  const deletePosition = useCallback((id: string) => {
    deleteMutation.mutate(id)
  }, [deleteMutation])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Get position by ID
  const getPositionById = useCallback((id: string) => {
    return positions.find(position => position.id === id)
  }, [positions])

  // Get positions by department
  const getPositionsByDepartment = useCallback((departmentId: string) => {
    return positions.filter(position => position.departmentId === departmentId)
  }, [positions])

  // Get active positions
  const getActivePositions = useCallback(() => {
    return positions.filter(position => position.status === 'ACTIVE')
  }, [positions])

  return {
    // Data
    positions: filteredPositions,
    allPositions: positions,
    departments: departments || [],
    stats,
    
    // Loading states
    isLoading: isLoading || isDepartmentsLoading,
    isStatsLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Error states
    error: error || apiError?.message || null,
    
    // Filters
    filters,
    
    // Actions
    actions: {
      setFilters,
      refreshPositions,
      createPosition,
      updatePosition,
      deletePosition,
      clearError,
      getPositionById,
      getPositionsByDepartment,
      getActivePositions
    }
  }
}

/**
 * Hook for fetching a single position by ID
 */
export const usePosition = (id: string) => {
  return useQuery({
    queryKey: POSITION_QUERY_KEYS.DETAIL(id),
    queryFn: () => PositionService.getById(id),
    enabled: !!id,
    staleTime: POSITION_CACHE_TIMES.STALE_TIME,
    gcTime: POSITION_CACHE_TIMES.GC_TIME,
  })
}

/**
 * Hook for searching positions
 */
export const usePositionSearch = (query: string) => {
  return useQuery({
    queryKey: POSITION_QUERY_KEYS.SEARCH(query),
    queryFn: () => PositionService.search(query),
    enabled: !!query && query.length >= 2,
    staleTime: POSITION_CACHE_TIMES.SEARCH_STALE_TIME,
    gcTime: POSITION_CACHE_TIMES.GC_TIME,
  })
}

/**
 * Hook for getting positions by department
 */
export const usePositionsByDepartment = (departmentId: string) => {
  return useQuery({
    queryKey: POSITION_QUERY_KEYS.BY_DEPARTMENT(departmentId),
    queryFn: () => PositionService.getByDepartment(departmentId),
    enabled: !!departmentId,
    staleTime: POSITION_CACHE_TIMES.STALE_TIME,
    gcTime: POSITION_CACHE_TIMES.GC_TIME,
  })
}

/**
 * Hook for getting active positions only
 */
export const useActivePositions = () => {
  return useQuery({
    queryKey: POSITION_QUERY_KEYS.ACTIVE(),
    queryFn: PositionService.getActive,
    staleTime: POSITION_CACHE_TIMES.STALE_TIME,
    gcTime: POSITION_CACHE_TIMES.GC_TIME,
  })
}
