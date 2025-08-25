import { 
  InviteCode, 
  InviteFilters, 
  RegistrationData, 
  InviteStats, 
  ValidationResult,
  InviteCodeValidation,
  InviteStatus 
} from './types'
import { 
  INVITE_STATUS_CONFIG, 
  VALIDATION_RULES, 
  CODE_CONFIG,
  DEPARTMENTS,
  ROLES 
} from './constants'

// Filtering Utilities
export const filterInvites = (invites: InviteCode[], filters: InviteFilters): InviteCode[] => {
  return invites.filter(invite => {
    const matchesSearch = filters.search === '' || 
      invite.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      invite.department.toLowerCase().includes(filters.search.toLowerCase()) ||
      invite.role.toLowerCase().includes(filters.search.toLowerCase()) ||
      (invite.usedBy && invite.usedBy.toLowerCase().includes(filters.search.toLowerCase()))
    
    const matchesStatus = filters.status === 'all' || invite.status === filters.status
    const matchesDepartment = filters.department === 'all' || invite.department === filters.department
    const matchesRole = filters.role === 'all' || invite.role === filters.role
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesRole
  })
}

// Sorting Utilities
export const sortInvites = (invites: InviteCode[], field: keyof InviteCode, direction: 'asc' | 'desc'): InviteCode[] => {
  return [...invites].sort((a, b) => {
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
export const calculateInviteStats = (invites: InviteCode[]): InviteStats => {
  const totalInvites = invites.length
  const activeInvites = invites.filter(i => i.status === 'active').length
  const usedInvites = invites.filter(i => i.status === 'used').length
  const expiredInvites = invites.filter(i => i.status === 'expired').length
  const revokedInvites = invites.filter(i => i.status === 'revoked').length
  
  // Calculate recent registrations (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentRegistrations = invites.filter(i => 
    i.status === 'used' && i.usedAt && new Date(i.usedAt) > sevenDaysAgo
  ).length
  
  // Department breakdown
  const departmentBreakdown: Record<string, number> = {}
  DEPARTMENTS.forEach(dept => {
    departmentBreakdown[dept] = invites.filter(i => i.department === dept).length
  })
  
  // Status breakdown
  const statusBreakdown: Record<InviteStatus, number> = {
    active: activeInvites,
    used: usedInvites,
    expired: expiredInvites,
    revoked: revokedInvites
  }

  return {
    totalInvites,
    activeInvites,
    usedInvites,
    expiredInvites,
    revokedInvites,
    recentRegistrations,
    departmentBreakdown,
    statusBreakdown
  }
}

// Status Utilities
export const getInviteStatusConfig = (status: InviteStatus) => {
  return INVITE_STATUS_CONFIG[status]
}

export const getInviteStatusBadgeVariant = (status: InviteStatus) => {
  return INVITE_STATUS_CONFIG[status].variant
}

export const isInviteExpired = (invite: InviteCode): boolean => {
  return new Date(invite.expiresAt) < new Date()
}

export const isInviteActive = (invite: InviteCode): boolean => {
  return invite.status === 'active' && !isInviteExpired(invite)
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

export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return formatDate(dateString)
  } catch {
    return dateString
  }
}

// Code Generation Utilities
export const generateInviteCode = (): string => {
  const year = new Date().getFullYear()
  const suffix = Array.from({ length: CODE_CONFIG.suffixLength }, () => 
    CODE_CONFIG.allowedChars.charAt(Math.floor(Math.random() * CODE_CONFIG.allowedChars.length))
  ).join('')
  
  return `${CODE_CONFIG.prefix}-${year}-${suffix}`
}

// Validation Utilities
export const validateInviteForm = (data: any): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // Department validation
  if (!data.department) {
    errors.department = 'Department is required'
  } else if (!DEPARTMENTS.includes(data.department)) {
    errors.department = 'Invalid department selected'
  }
  
  // Role validation
  if (!data.role) {
    errors.role = 'Role is required'
  } else if (!ROLES.includes(data.role)) {
    errors.role = 'Invalid role selected'
  }
  
  // Permissions validation
  if (!data.permissions || data.permissions.length === 0) {
    errors.permissions = 'At least one permission must be selected'
  }
  
  // Expiry days validation
  if (!data.expiryDays || data.expiryDays < 1 || data.expiryDays > 365) {
    errors.expiryDays = 'Expiry days must be between 1 and 365'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateRegistrationForm = (data: RegistrationData, step: number): ValidationResult => {
  const errors: Record<string, string> = {}
  
  if (step >= 1) {
    // Invite code validation
    if (!data.inviteCode) {
      errors.inviteCode = 'Invite code is required'
    } else if (!VALIDATION_RULES.registration.inviteCode.pattern.test(data.inviteCode)) {
      errors.inviteCode = 'Invalid invite code format'
    }
  }
  
  if (step >= 2) {
    // First name validation
    if (!data.firstName) {
      errors.firstName = 'First name is required'
    } else if (data.firstName.length < VALIDATION_RULES.registration.firstName.minLength) {
      errors.firstName = `First name must be at least ${VALIDATION_RULES.registration.firstName.minLength} characters`
    } else if (!VALIDATION_RULES.registration.firstName.pattern.test(data.firstName)) {
      errors.firstName = 'First name contains invalid characters'
    }
    
    // Last name validation
    if (!data.lastName) {
      errors.lastName = 'Last name is required'
    } else if (data.lastName.length < VALIDATION_RULES.registration.lastName.minLength) {
      errors.lastName = `Last name must be at least ${VALIDATION_RULES.registration.lastName.minLength} characters`
    } else if (!VALIDATION_RULES.registration.lastName.pattern.test(data.lastName)) {
      errors.lastName = 'Last name contains invalid characters'
    }
    
    // Email validation
    if (!data.email) {
      errors.email = 'Email is required'
    } else if (!VALIDATION_RULES.registration.email.pattern.test(data.email)) {
      errors.email = 'Invalid email format'
    }
  }
  
  if (step >= 3) {
    // Password validation
    if (!data.password) {
      errors.password = 'Password is required'
    } else if (data.password.length < VALIDATION_RULES.registration.password.minLength) {
      errors.password = `Password must be at least ${VALIDATION_RULES.registration.password.minLength} characters`
    } else if (!VALIDATION_RULES.registration.password.pattern.test(data.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character'
    }
    
    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateInviteCode = (code: string, invites: InviteCode[]): InviteCodeValidation => {
  if (!code) {
    return { isValid: false, error: 'Invite code is required' }
  }
  
  if (!VALIDATION_RULES.registration.inviteCode.pattern.test(code)) {
    return { isValid: false, error: 'Invalid invite code format' }
  }
  
  const invite = invites.find(i => i.code === code)
  
  if (!invite) {
    return { isValid: false, error: 'Invite code not found' }
  }
  
  if (invite.status !== 'active') {
    return { isValid: false, error: `Invite code is ${invite.status}` }
  }
  
  if (isInviteExpired(invite)) {
    return { isValid: false, error: 'Invite code has expired' }
  }
  
  return { isValid: true, invite }
}

// Permission Utilities
export const canManageInvites = (userRole: string): boolean => {
  return userRole === 'Admin' || userRole === 'HR Manager' || userRole === 'Super Admin'
}

export const canCreateInvites = (userRole: string): boolean => {
  return canManageInvites(userRole)
}

export const canRevokeInvites = (userRole: string): boolean => {
  return userRole === 'Admin' || userRole === 'Super Admin'
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
