import { useState, useCallback, useMemo } from 'react'
import { Permission, UsePermissionsReturn, PermissionCategory } from '../types'
import { mockPermissions } from '../mockData'
import { groupPermissionsByCategory } from '../utils'

export const usePermissions = (): UsePermissionsReturn => {
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoized permissions grouped by category
  const permissionsByCategory = useMemo(() => {
    return groupPermissionsByCategory(permissions)
  }, [permissions])

  // Refresh permissions (for future API integration)
  const refreshPermissions = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Future: API call to refresh data
      // const data = await fetchPermissions()
      // setPermissions(data)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh permissions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    permissions,
    permissionsByCategory,
    isLoading,
    error,
    actions: {
      refreshPermissions
    }
  }
}
