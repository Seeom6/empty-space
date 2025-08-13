// Core Invitation Types
export interface InviteCode {
  id: string
  code: string
  department: string
  role: string
  permissions: string[]
  status: InviteStatus
  usedBy?: string
  usedByEmail?: string
  createdAt: string
  createdBy: string
  expiresAt: string
  usedAt?: string
  metadata?: InviteMetadata
}

export interface InviteMetadata {
  ipAddress?: string
  userAgent?: string
  registrationUrl?: string
  customFields?: Record<string, any>
}

export interface RegistrationData {
  inviteCode: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms?: boolean
  newsletter?: boolean
}

export interface RegistrationStep {
  id: number
  title: string
  description: string
  completed: boolean
  isActive?: boolean
  icon?: string
}

// Enums and Status Types
export type InviteStatus = 'active' | 'used' | 'expired' | 'revoked'
export type RegistrationStepType = 'invite-code' | 'personal-info' | 'password' | 'complete'

// Filter and Search Types
export interface InviteFilters {
  search: string
  status: string
  department: string
  role: string
  dateRange: string
}

export interface RegistrationFilters {
  search: string
  status: string
  department: string
}

// Statistics Types
export interface InviteStats {
  totalInvites: number
  activeInvites: number
  usedInvites: number
  expiredInvites: number
  revokedInvites: number
  recentRegistrations: number
  departmentBreakdown: Record<string, number>
  statusBreakdown: Record<InviteStatus, number>
}

// Component Props Types
export interface BaseInviteProps {
  userRole: string
  canManage?: boolean
}

export interface InviteActionProps {
  onCopy?: (code: string) => void
  onRevoke?: (inviteId: string) => void
  onResend?: (inviteId: string) => void
  onView?: (invite: InviteCode) => void
}

// Form Types
export interface InviteFormData {
  department: string
  role: string
  permissions: string[]
  expiryDays: number
  customMessage?: string
  sendEmail?: boolean
  recipientEmail?: string
}

export interface RegistrationFormData {
  step: number
  data: RegistrationData
  errors: Partial<RegistrationData>
  isValid: boolean
}

// Modal Types
export interface ModalState<T = any> {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view' | 'resend'
  data?: T | null
}

// Hook Return Types
export interface UseInvitesReturn {
  invites: InviteCode[]
  filteredInvites: InviteCode[]
  stats: InviteStats
  filters: InviteFilters
  isLoading: boolean
  error: string | null
  actions: {
    setFilters: (filters: Partial<InviteFilters>) => void
    createInvite: (invite: Omit<InviteCode, 'id' | 'createdAt' | 'code'>) => void
    revokeInvite: (id: string) => void
    resendInvite: (id: string) => void
    refreshInvites: () => void
  }
}

export interface UseRegistrationReturn {
  currentStep: number
  formData: RegistrationFormData
  steps: RegistrationStep[]
  isLoading: boolean
  error: string | null
  actions: {
    nextStep: () => void
    prevStep: () => void
    updateData: (data: Partial<RegistrationData>) => void
    validateStep: (step: number) => boolean
    submitRegistration: () => Promise<void>
    resetForm: () => void
  }
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface InviteCodeValidation {
  isValid: boolean
  invite?: InviteCode
  error?: string
}

// Configuration Types
export interface InviteConfig {
  defaultExpiryDays: number
  maxPermissions: number
  allowedDepartments: string[]
  allowedRoles: string[]
  requireEmail: boolean
  enableCustomMessage: boolean
}