import { Position, PositionFilters, PositionStats, Department, PositionPermissions } from './types'
import { POSITION_ROLE_PERMISSIONS } from './constants'

/**
 * Filter positions based on search, status, and department filters
 */
export const filterPositions = (
  positions: Position[],
  filters: PositionFilters,
  departments: Department[]
): Position[] => {
  return positions.filter(position => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesName = position.name.toLowerCase().includes(searchTerm)
      const matchesDescription = position.description?.toLowerCase().includes(searchTerm) || false
      
      if (!matchesName && !matchesDescription) {
        return false
      }
    }

    // Status filter
    if (filters.status !== 'all' && position.status !== filters.status) {
      return false
    }

    // Department filter
    if (filters.department !== 'all') {
      // Skip department filtering if position has no valid department
      if (!position.departmentId || position.departmentId === 'unknown') {
        return filters.department === 'unknown' || filters.department === 'No Department'
      }

      // If filtering by department name
      const department = departments.find(dept => dept.name === filters.department)
      if (department && position.departmentId !== department.id) {
        return false
      }
      // If filtering by department ID directly
      if (!department && position.departmentId !== filters.department) {
        return false
      }
    }

    return true
  })
}

/**
 * Calculate position statistics
 */
export const calculatePositionStats = (
  positions: Position[],
  departments: Department[] = []
): PositionStats => {
  console.log('📊 calculatePositionStats called with:', {
    positionsCount: positions.length,
    departmentsCount: departments.length,
    positions: positions.slice(0, 2),
    departments: departments.slice(0, 2)
  })

  const activePositions = positions.filter(position => !position.isDeleted)

  const stats: PositionStats = {
    total: activePositions.length,
    active: activePositions.filter(position => position.status === 'ACTIVE').length,
    inactive: activePositions.filter(position => position.status === 'INACTIVE').length,
    departments: {}
  }

  // Calculate positions by department - ensure departments is an array
  if (Array.isArray(departments) && departments.length > 0) {
    departments.forEach(department => {
      const departmentPositions = activePositions.filter(
        position => position.departmentId === department.id
      )
      if (departmentPositions.length > 0) {
        stats.departments[department.name] = departmentPositions.length
      }
    })
  } else {
    // If no departments provided, group by departmentId
    console.log('📊 No departments provided, grouping by departmentId')
    const departmentCounts: Record<string, number> = {}
    activePositions.forEach(position => {
      const deptId = position.departmentId
      departmentCounts[deptId] = (departmentCounts[deptId] || 0) + 1
    })
    stats.departments = departmentCounts
    console.log('📊 Department counts by ID:', departmentCounts)
  }

  console.log('📊 Final stats:', stats)
  return stats
}

/**
 * Get position permissions based on user role
 */
export const getPositionPermissions = (userRole: string): PositionPermissions => {
  const rolePermissions = POSITION_ROLE_PERMISSIONS[userRole as keyof typeof POSITION_ROLE_PERMISSIONS] || []

  return {
    canView: rolePermissions.includes('position:view' as any),
    canCreate: rolePermissions.includes('position:create' as any),
    canEdit: rolePermissions.includes('position:edit' as any),
    canDelete: rolePermissions.includes('position:delete' as any)
  }
}

/**
 * Check if user can edit a specific position
 */
export const canEditPosition = (userRole: string, position: Position): boolean => {
  const permissions = getPositionPermissions(userRole)
  return permissions.canEdit
}

/**
 * Check if user can delete a specific position
 */
export const canDeletePosition = (userRole: string, position: Position): boolean => {
  const permissions = getPositionPermissions(userRole)
  return permissions.canDelete
}

/**
 * Format position status for display
 */
export const formatPositionStatus = (status: Position['status']): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
}

/**
 * Get position status color class
 */
export const getPositionStatusColor = (status: Position['status']): string => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get position status icon
 */
export const getPositionStatusIcon = (status: Position['status']): string => {
  switch (status) {
    case 'ACTIVE':
      return '✅'
    case 'INACTIVE':
      return '⏸️'
    default:
      return '❓'
  }
}

/**
 * Validate position name
 */
export const validatePositionName = (name: string): string | null => {
  if (!name || name.trim() === '') {
    return 'Position name is required'
  }
  
  if (name.length < 3) {
    return 'Position name must be at least 3 characters'
  }
  
  if (name.length > 255) {
    return 'Position name must not exceed 255 characters'
  }
  
  return null
}

/**
 * Validate department ID
 */
export const validateDepartmentId = (departmentId: string): string | null => {
  if (!departmentId || departmentId.trim() === '') {
    return 'Department is required'
  }
  
  // Validate ObjectId format (24 character hex string)
  if (!/^[0-9a-fA-F]{24}$/.test(departmentId)) {
    return 'Invalid department ID format'
  }
  
  return null
}

/**
 * Validate position description
 */
export const validatePositionDescription = (description?: string): string | null => {
  if (description && description.length > 1000) {
    return 'Description must not exceed 1000 characters'
  }
  
  return null
}

/**
 * Validate complete position form data
 */
export const validatePositionForm = (data: {
  name: string
  departmentId: string
  description?: string
}): Record<string, string> => {
  const errors: Record<string, string> = {}
  
  const nameError = validatePositionName(data.name)
  if (nameError) errors.name = nameError
  
  const departmentError = validateDepartmentId(data.departmentId)
  if (departmentError) errors.departmentId = departmentError
  
  const descriptionError = validatePositionDescription(data.description)
  if (descriptionError) errors.description = descriptionError
  
  return errors
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
