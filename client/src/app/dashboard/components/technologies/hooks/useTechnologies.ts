import { useState, useCallback, useMemo } from 'react'
import { Technology, TechnologyFilters, UseTechnologiesReturn } from '../types'
import { mockTechnologies } from '../mockData'
import { filterTechnologies, calculateTechnologyStats, generateId } from '../utils'

export const useTechnologies = (): UseTechnologiesReturn => {
  const [technologies, setTechnologies] = useState<Technology[]>(mockTechnologies)
  const [filters, setFiltersState] = useState<TechnologyFilters>({
    search: '',
    category: 'all',
    status: 'all'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized filtered technologies
  const filteredTechnologies = useMemo(() => {
    return filterTechnologies(technologies, filters)
  }, [technologies, filters])

  // Memoized statistics
  const stats = useMemo(() => {
    return calculateTechnologyStats(technologies)
  }, [technologies])

  // Filter update handler
  const setFilters = useCallback((newFilters: Partial<TechnologyFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Create technology
  const createTechnology = useCallback((newTech: Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const technology: Technology = {
        ...newTech,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setTechnologies(prev => [...prev, technology])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create technology')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update technology
  const updateTechnology = useCallback((updatedTech: Technology) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const technology: Technology = {
        ...updatedTech,
        updatedAt: new Date().toISOString()
      }
      
      setTechnologies(prev => 
        prev.map(tech => tech.id === technology.id ? technology : tech)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update technology')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete technology
  const deleteTechnology = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      setTechnologies(prev => prev.filter(tech => tech.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete technology')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh technologies (for future API integration)
  const refreshTechnologies = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Future: API call to refresh data
      // const data = await fetchTechnologies()
      // setTechnologies(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh technologies')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    technologies,
    filteredTechnologies,
    stats,
    filters,
    isLoading,
    error,
    actions: {
      setFilters,
      createTechnology,
      updateTechnology,
      deleteTechnology,
      refreshTechnologies
    }
  }
}
