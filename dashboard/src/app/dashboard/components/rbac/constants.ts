import { PermissionCategory, AuditAction, AuditTargetType, PERMISSION_CATEGORIES } from './types'

// Re-export PERMISSION_CATEGORIES for use in other files
export { PERMISSION_CATEGORIES }

// Audit Actions Configuration
export const AUDIT_ACTIONS: readonly AuditAction[] = [
  'CREATE_ROLE',
  'UPDATE_ROLE',
  'DELETE_ROLE',
  'ASSIGN_ROLE',
  'REVOKE_ROLE',
  'UPDATE_PERMISSIONS',
  'CREATE_PERMISSION',
  'UPDATE_PERMISSION',
  'DELETE_PERMISSION'
] as const

// Audit Target Types
export const AUDIT_TARGET_TYPES: readonly AuditTargetType[] = [
  'ROLE',
  'USER',
  'PERMISSION'
] as const

// Category Icons Mapping
export const CATEGORY_ICONS: Record<PermissionCategory, string> = {
  'Dashboard': '📊',
  'Employee Management': '👥',
  'Project Management': '📋',
  'Task Management': '✅',
  'Team Management': '🤝',
  'Attendance Management': '⏰',
  'Payroll Management': '💰',
  'Performance Management': '📈',
  'Analytics & Reports': '📊',
  'Settings & Configuration': '⚙️'
}

// Role Status Configuration
export const ROLE_STATUS_CONFIG = {
  active: {
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    variant: 'default' as const,
    label: 'Active',
    icon: '✅'
  },
  inactive: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    variant: 'secondary' as const,
    label: 'Inactive',
    icon: '⏸️'
  }
} as const

// Action Icons Mapping
export const ACTION_ICONS: Record<AuditAction, string> = {
  'CREATE_ROLE': '➕',
  'UPDATE_ROLE': '✏️',
  'DELETE_ROLE': '🗑️',
  'ASSIGN_ROLE': '👤',
  'REVOKE_ROLE': '❌',
  'UPDATE_PERMISSIONS': '🔐',
  'CREATE_PERMISSION': '🆕',
  'UPDATE_PERMISSION': '📝',
  'DELETE_PERMISSION': '🗑️'
}

// Default Form Values
export const DEFAULT_ROLE_FORM = {
  name: '',
  description: '',
  permissions: [],
  isActive: true
}

export const DEFAULT_USER_ROLE_FORM = {
  userId: '',
  roleId: '',
  expiresAt: undefined
}

// Validation Rules
export const VALIDATION_RULES = {
  role: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-]+$/
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 200
    },
    permissions: {
      required: true,
      minCount: 1
    }
  },
  userRole: {
    userId: {
      required: true
    },
    roleId: {
      required: true
    }
  }
} as const

// Display Configuration
export const DISPLAY_CONFIG = {
  itemsPerPage: 10,
  maxDescriptionLength: 100,
  maxNameLength: 30,
  gridColumns: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  tablePageSizes: [10, 25, 50, 100]
} as const

// Search Configuration
export const SEARCH_CONFIG = {
  debounceMs: 300,
  minSearchLength: 2,
  searchFields: ['name', 'description'] as const
} as const

// Animation Configuration
export const ANIMATION_CONFIG = {
  duration: 200,
  easing: 'ease-in-out',
  stagger: 50
} as const

// Date Range Options for Audit Logs
export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'last90days', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' }
] as const

// System Roles (cannot be deleted/modified)
export const SYSTEM_ROLES = ['Super Admin', 'System'] as const

// Permission Levels
export const PERMISSION_LEVELS = ['read', 'write', 'admin'] as const

// Role Priorities (for display order)
export const ROLE_PRIORITIES = {
  'Super Admin': 1,
  'Admin': 2,
  'HR Manager': 3,
  'Project Manager': 4,
  'Team Lead': 5,
  'Finance Manager': 6,
  'Employee': 10
} as const
