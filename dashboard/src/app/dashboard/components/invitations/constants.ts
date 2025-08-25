import { InviteStatus, InviteConfig } from './types'

// Departments Configuration
export const DEPARTMENTS = [
  'Engineering',
  'Marketing', 
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Design',
  'Product',
  'Customer Support',
  'Legal'
] as const

// Roles Configuration
export const ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Marketing Specialist',
  'Sales Representative',
  'HR Coordinator',
  'Financial Analyst',
  'Operations Manager',
  'Customer Support Specialist',
  'Legal Counsel'
] as const

// Invite Status Configuration
export const INVITE_STATUS_CONFIG = {
  active: {
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    variant: 'default' as const,
    label: 'Active',
    icon: '✅'
  },
  used: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    variant: 'secondary' as const,
    label: 'Used',
    icon: '👤'
  },
  expired: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    variant: 'destructive' as const,
    label: 'Expired',
    icon: '⏰'
  },
  revoked: {
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    variant: 'destructive' as const,
    label: 'Revoked',
    icon: '❌'
  }
} as const

// Registration Steps Configuration
export const REGISTRATION_STEPS = [
  {
    id: 1,
    type: 'invite-code',
    title: 'Enter Invite Code',
    description: 'Provide the invitation code you received',
    icon: '📧'
  },
  {
    id: 2,
    type: 'personal-info',
    title: 'Personal Information',
    description: 'Enter your basic details',
    icon: '👤'
  },
  {
    id: 3,
    type: 'password',
    title: 'Set Password',
    description: 'Create a secure password',
    icon: '🔒'
  },
  {
    id: 4,
    type: 'complete',
    title: 'Complete',
    description: 'Registration successful',
    icon: '✅'
  }
] as const

// Default Form Values
export const DEFAULT_INVITE_FORM = {
  department: '',
  role: '',
  permissions: [],
  expiryDays: 30,
  customMessage: '',
  sendEmail: true,
  recipientEmail: ''
}

export const DEFAULT_REGISTRATION_FORM = {
  inviteCode: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  newsletter: false
}

// Validation Rules
export const VALIDATION_RULES = {
  invite: {
    department: {
      required: true
    },
    role: {
      required: true
    },
    permissions: {
      required: true,
      minCount: 1
    },
    expiryDays: {
      required: true,
      min: 1,
      max: 365
    }
  },
  registration: {
    inviteCode: {
      required: true,
      pattern: /^INV-\d{4}-[A-Z0-9]{6}$/
    },
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    }
  }
} as const

// Display Configuration
export const DISPLAY_CONFIG = {
  itemsPerPage: 10,
  maxDescriptionLength: 100,
  maxCodeLength: 20,
  tablePageSizes: [10, 25, 50, 100],
  cardColumns: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  }
} as const

// Search Configuration
export const SEARCH_CONFIG = {
  debounceMs: 300,
  minSearchLength: 2,
  searchFields: ['code', 'department', 'role', 'usedBy'] as const
} as const

// Animation Configuration
export const ANIMATION_CONFIG = {
  duration: 200,
  easing: 'ease-in-out',
  stagger: 50
} as const

// Date Range Options
export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 days' },
  { value: 'last30days', label: 'Last 30 days' },
  { value: 'last90days', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' }
] as const

// Default Configuration
export const DEFAULT_CONFIG: InviteConfig = {
  defaultExpiryDays: 30,
  maxPermissions: 20,
  allowedDepartments: DEPARTMENTS as any,
  allowedRoles: ROLES as any,
  requireEmail: true,
  enableCustomMessage: true
}

// Permission Categories (from RBAC)
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

// Code Generation Configuration
export const CODE_CONFIG = {
  prefix: 'INV',
  yearFormat: 'YYYY',
  suffixLength: 6,
  allowedChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
} as const
