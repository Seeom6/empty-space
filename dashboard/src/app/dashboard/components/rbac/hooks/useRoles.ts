import { useState, useCallback, useMemo } from 'react'
import { Role, RoleFilters, UseRolesReturn, UserRoleAssignment, Permission } from '../types'
import { mockRoles, mockUserRoleAssignments, mockPermissions } from '../mockData'
import { filterRoles, calculateRBACStats, generateId, sortRoles } from '../utils'

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [filters, setFiltersState] = useState<RoleFilters>({
    search: '',
    status: 'all',
    category: 'all'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized filtered roles
  const filteredRoles = useMemo(() => {
    const filtered = filterRoles(roles, filters)
    return sortRoles(filtered, 'name', 'asc')
  }, [roles, filters])

  // Memoized statistics
  const stats = useMemo(() => {
    return calculateRBACStats(roles, mockUserRoleAssignments, mockPermissions)
  }, [roles])

  // Filter update handler
  const setFilters = useCallback((newFilters: Partial<RoleFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Create role
  const createRole = useCallback((newRole: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const role: Role = {
        ...newRole,
        id: generateId(),
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setRoles(prev => [...prev, role])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update role
  const updateRole = useCallback((updatedRole: Role) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const role: Role = {
        ...updatedRole,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      setRoles(prev => 
        prev.map(r => r.id === role.id ? role : r)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Delete role
  const deleteRole = useCallback((id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      setRoles(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete role')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Duplicate role
  const duplicateRole = useCallback((role: Role) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const duplicatedRole: Role = {
        ...role,
        id: generateId(),
        name: `${role.name} (Copy)`,
        userCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Current User' // This would come from auth context
      }
      
      setRoles(prev => [...prev, duplicatedRole])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate role')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh roles (for future API integration)
  const refreshRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Future: API call to refresh data
      // const data = await fetchRoles()
      // setRoles(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh roles')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    roles,
    filteredRoles,
    stats,
    filters,
    isLoading,
    error,
    actions: {
      setFilters,
      createRole,
      updateRole,
      deleteRole,
      duplicateRole,
      refreshRoles
    }
  }
}
