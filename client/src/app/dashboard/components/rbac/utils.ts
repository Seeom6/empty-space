import { 
  Role, 
  Permission, 
  UserRoleAssignment, 
  AuditLog, 
  RoleFilters, 
  UserFilters, 
  AuditFilters,
  RBACStats,
  PermissionCategory 
} from './types'
import { 
  ROLE_STATUS_CONFIG, 
  VALIDATION_RULES, 
  PERMISSION_CATEGORIES,
  SYSTEM_ROLES,
  ROLE_PRIORITIES 
} from './constants'

// Filtering Utilities
export const filterRoles = (roles: Role[], filters: RoleFilters): Role[] => {
  return roles.filter(role => {
    const matchesSearch = filters.search === '' || 
      role.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      role.description.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesStatus = filters.status === 'all' || 
      (filters.status === 'active' && role.isActive) ||
      (filters.status === 'inactive' && !role.isActive)
    
    return matchesSearch && matchesStatus
  })
}

export const filterUserAssignments = (assignments: UserRoleAssignment[], filters: UserFilters): UserRoleAssignment[] => {
  return assignments.filter(assignment => {
    const matchesSearch = filters.search === '' ||
      assignment.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
      assignment.userEmail.toLowerCase().includes(filters.search.toLowerCase()) ||
      assignment.roleName.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesRole = filters.role === 'all' || assignment.roleId === filters.role
    
    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && assignment.isActive) ||
      (filters.status === 'inactive' && !assignment.isActive)
    
    return matchesSearch && matchesRole && matchesStatus
  })
}

export const filterAuditLogs = (logs: AuditLog[], filters: AuditFilters): AuditLog[] => {
  return logs.filter(log => {
    const matchesSearch = filters.search === '' ||
      log.targetName.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
      log.details.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesAction = filters.action === 'all' || log.action === filters.action
    const matchesTargetType = filters.targetType === 'all' || log.targetType === filters.targetType
    
    // Date range filtering would be implemented here
    const matchesDateRange = true // Simplified for now
    
    return matchesSearch && matchesAction && matchesTargetType && matchesDateRange
  })
}

// Sorting Utilities
export const sortRoles = (roles: Role[], field: keyof Role, direction: 'asc' | 'desc'): Role[] => {
  return [...roles].sort((a, b) => {
    // System roles always come first
    if (a.isSystem && !b.isSystem) return -1
    if (!a.isSystem && b.isSystem) return 1
    
    // Then by priority if available
    if (field === 'name') {
      const aPriority = ROLE_PRIORITIES[a.name as keyof typeof ROLE_PRIORITIES] || 999
      const bPriority = ROLE_PRIORITIES[b.name as keyof typeof ROLE_PRIORITIES] || 999
      if (aPriority !== bPriority) {
        return direction === 'asc' ? aPriority - bPriority : bPriority - aPriority
      }
    }
    
    const aValue = a[field]
    const bValue = b[field]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue)
      return direction === 'asc' ? comparison : -comparison
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })
}

// Statistics Calculation
export const calculateRBACStats = (
  roles: Role[], 
  assignments: UserRoleAssignment[], 
  permissions: Permission[]
): RBACStats => {
  const totalRoles = roles.length
  const activeRoles = roles.filter(r => r.isActive).length
  const totalUsers = new Set(assignments.map(a => a.userId)).size
  const assignedUsers = assignments.filter(a => a.isActive).length
  const totalPermissions = permissions.filter(p => p.isActive).length
  
  // Calculate recent changes (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentChanges = roles.filter(r => 
    new Date(r.updatedAt) > sevenDaysAgo
  ).length
  
  // Category breakdown
  const categoryBreakdown = {} as Record<PermissionCategory, number>
  PERMISSION_CATEGORIES.forEach((category: PermissionCategory) => {
    categoryBreakdown[category] = permissions.filter(p => p.category === category && p.isActive).length
  })

  return {
    totalRoles,
    activeRoles,
    totalUsers,
    assignedUsers,
    totalPermissions,
    recentChanges,
    categoryBreakdown
  }
}

// Status Utilities
export const getRoleStatusConfig = (isActive: boolean) => {
  return ROLE_STATUS_CONFIG[isActive ? 'active' : 'inactive']
}

export const getRoleStatusBadgeVariant = (isActive: boolean) => {
  return ROLE_STATUS_CONFIG[isActive ? 'active' : 'inactive'].variant
}

// Permission Utilities
export const groupPermissionsByCategory = (permissions: Permission[]): Record<PermissionCategory, Permission[]> => {
  const grouped = {} as Record<PermissionCategory, Permission[]>

  PERMISSION_CATEGORIES.forEach((category: PermissionCategory) => {
    grouped[category] = permissions.filter(p => p.category === category && p.isActive)
  })

  return grouped
}

export const getPermissionsByRole = (role: Role, allPermissions: Permission[]): Permission[] => {
  return allPermissions.filter(p => role.permissions.includes(p.id))
}

export const hasPermission = (role: Role, permissionId: string): boolean => {
  return role.permissions.includes(permissionId)
}

// Text Utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

export const formatDateTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// Validation Utilities
export const validateRoleForm = (data: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  // Name validation
  if (!data.name || data.name.trim().length < VALIDATION_RULES.role.name.minLength) {
    errors.name = `Name must be at least ${VALIDATION_RULES.role.name.minLength} characters`
  } else if (data.name.length > VALIDATION_RULES.role.name.maxLength) {
    errors.name = `Name must be less than ${VALIDATION_RULES.role.name.maxLength} characters`
  } else if (!VALIDATION_RULES.role.name.pattern.test(data.name)) {
    errors.name = 'Name contains invalid characters'
  }
  
  // Description validation
  if (!data.description || data.description.trim().length < VALIDATION_RULES.role.description.minLength) {
    errors.description = `Description must be at least ${VALIDATION_RULES.role.description.minLength} characters`
  } else if (data.description.length > VALIDATION_RULES.role.description.maxLength) {
    errors.description = `Description must be less than ${VALIDATION_RULES.role.description.maxLength} characters`
  }
  
  // Permissions validation
  if (!data.permissions || data.permissions.length < VALIDATION_RULES.role.permissions.minCount) {
    errors.permissions = 'At least one permission must be selected'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Permission Utilities
export const canManageRoles = (userRole: string): boolean => {
  return userRole === 'Admin' || userRole === 'Super Admin'
}

export const canEditRole = (userRole: string, role: Role): boolean => {
  if (userRole === 'Super Admin') return true
  if (userRole === 'Admin' && !SYSTEM_ROLES.includes(role.name as any)) return true
  return false
}

export const canDeleteRole = (userRole: string, role: Role): boolean => {
  if (SYSTEM_ROLES.includes(role.name as any)) return false
  if (role.userCount > 0) return false
  return canEditRole(userRole, role)
}

export const canAssignRole = (userRole: string, targetRole: Role): boolean => {
  if (userRole === 'Super Admin') return true
  if (userRole === 'Admin' && !SYSTEM_ROLES.includes(targetRole.name as any)) return true
  return false
}

// ID Generation Utility
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Deep Clone Utility
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// Debounce Utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
