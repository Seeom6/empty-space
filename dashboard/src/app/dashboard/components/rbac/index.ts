// Main export file for RBAC module

// Main components
export { RBACManagement } from './RBACManagement'
export { RolesManagementView } from './RolesView'
export { UserRoleAssignmentView } from './UserRoleAssignmentView'
export { PermissionLibraryView } from './PermissionLibraryView'
export { AuditLogsView } from './AuditLogsView'
export { RoleDetailsModal } from './RoleDetailsModal'

// Reusable components
export { RoleCard, RBACStats, EmptyState } from './components'
export { RoleFilters } from './components/RoleFilters'

// Custom hooks
export * from './hooks'

// Types
export type {
  Role,
  Permission,
  UserRoleAssignment,
  AuditLog,
  RoleFilters as RoleFiltersType,
  UserFilters,
  AuditFilters,
  RBACStats as RBACStatsType,
  BaseRBACProps,
  ViewMode,
  PermissionCategory,
  AuditAction,
  AuditTargetType
} from './types'

// Constants and utilities
export * from './constants'
export * from './utils'

// Mock data (for development)
export { mockRoles, mockPermissions, mockUserRoleAssignments, mockAuditLogs } from './mockData'
