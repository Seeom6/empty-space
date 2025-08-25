// Core RBAC Types
export interface Permission {
  id: string
  name: string
  description: string
  category: PermissionCategory
  isActive: boolean
  resource?: string
  action?: string
  level?: 'read' | 'write' | 'admin'
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  userCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
  isSystem?: boolean
  priority?: number
}

export interface UserRoleAssignment {
  id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  roleId: string
  roleName: string
  assignedAt: string
  assignedBy: string
  isActive: boolean
  expiresAt?: string
}

export interface AuditLog {
  id: string
  action: AuditAction
  targetType: AuditTargetType
  targetId: string
  targetName: string
  performedBy: string
  performedAt: string
  details: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  userAgent?: string
}

// Enums and Constants
export const PERMISSION_CATEGORIES = [
  'Dashboard',
  'Employee Management',
  'Project Management',
  'Task Management',
  'Team Management',
  'Attendance Management',
  'Payroll Management',
  'Performance Management',
  'Analytics & Reports',
  'Settings & Configuration'
] as const

export type PermissionCategory = typeof PERMISSION_CATEGORIES[number]

export type AuditAction =
  | 'CREATE_ROLE'
  | 'UPDATE_ROLE'
  | 'DELETE_ROLE'
  | 'ASSIGN_ROLE'
  | 'REVOKE_ROLE'
  | 'UPDATE_PERMISSIONS'
  | 'CREATE_PERMISSION'
  | 'UPDATE_PERMISSION'
  | 'DELETE_PERMISSION'

export type AuditTargetType = 'ROLE' | 'USER' | 'PERMISSION'

export type ViewMode = 'list' | 'grid' | 'table'

// Filter and Search Types
export interface RoleFilters {
  search: string
  status: string
  category: string
}

export interface UserFilters {
  search: string
  role: string
  status: string
}

export interface AuditFilters {
  search: string
  action: string
  targetType: string
  dateRange: string
}

// Statistics Types
export interface RBACStats {
  totalRoles: number
  activeRoles: number
  totalUsers: number
  assignedUsers: number
  totalPermissions: number
  recentChanges: number
  categoryBreakdown: Record<PermissionCategory, number>
}

// Component Props Types
export interface BaseRBACProps {
  userRole: string
  canManage?: boolean
}

export interface RoleActionProps {
  onEdit?: (role: Role) => void
  onDelete?: (roleId: string) => void
  onView?: (role: Role) => void
  onDuplicate?: (role: Role) => void
}

export interface UserActionProps {
  onAssignRole?: (userId: string, roleId: string) => void
  onRevokeRole?: (assignmentId: string) => void
  onView?: (assignment: UserRoleAssignment) => void
}

// Form Types
export interface RoleFormData {
  name: string
  description: string
  permissions: string[]
  isActive: boolean
}

export interface UserRoleFormData {
  userId: string
  roleId: string
  expiresAt?: string
}

// Modal Types
export interface ModalState<T = any> {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view' | 'duplicate'
  data?: T | null
}

// Hook Return Types
export interface UseRolesReturn {
  roles: Role[]
  filteredRoles: Role[]
  stats: RBACStats
  filters: RoleFilters
  isLoading: boolean
  error: string | null
  actions: {
    setFilters: (filters: Partial<RoleFilters>) => void
    createRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateRole: (role: Role) => void
    deleteRole: (id: string) => void
    duplicateRole: (role: Role) => void
    refreshRoles: () => void
  }
}

export interface UsePermissionsReturn {
  permissions: Permission[]
  permissionsByCategory: Record<PermissionCategory, Permission[]>
  isLoading: boolean
  error: string | null
  actions: {
    refreshPermissions: () => void
  }
}

export interface UseAuditLogsReturn {
  logs: AuditLog[]
  filteredLogs: AuditLog[]
  filters: AuditFilters
  isLoading: boolean
  error: string | null
  actions: {
    setFilters: (filters: Partial<AuditFilters>) => void
    refreshLogs: () => void
  }
}