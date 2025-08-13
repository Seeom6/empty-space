export interface Permission {
  id: string
  name: string
  description: string
  category: string
  isActive: boolean
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
}

export interface UserRoleAssignment {
  id: string
  userId: string
  userName: string
  userEmail: string
  roleId: string
  roleName: string
  assignedAt: string
  assignedBy: string
  isActive: boolean
}

export interface AuditLog {
  id: string
  action: 'CREATE_ROLE' | 'UPDATE_ROLE' | 'DELETE_ROLE' | 'ASSIGN_ROLE' | 'REVOKE_ROLE' | 'UPDATE_PERMISSIONS'
  targetType: 'ROLE' | 'USER' | 'PERMISSION'
  targetId: string
  targetName: string
  performedBy: string
  performedAt: string
  details: string
  oldValue?: string
  newValue?: string
}

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