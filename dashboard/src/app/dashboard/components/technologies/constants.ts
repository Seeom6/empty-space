import { TechnologyCategory, TechnologyStatus } from './types'

// Technology Categories Configuration
export const TECHNOLOGY_CATEGORIES: readonly TechnologyCategory[] = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Testing',
  'Analytics'
] as const

// Technology Status Configuration
export const TECHNOLOGY_STATUSES: readonly TechnologyStatus[] = [
  'active',
  'inactive', 
  'deprecated'
] as const

// Category Icons Mapping
export const CATEGORY_ICONS: Record<TechnologyCategory, string> = {
  Frontend: '🎨',
  Backend: '⚙️',
  Database: '🗄️',
  DevOps: '🚀',
  Mobile: '📱',
  Design: '🎭',
  Testing: '🧪',
  Analytics: '📊'
}

// Status Colors and Variants
export const STATUS_CONFIG = {
  active: {
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    variant: 'default' as const,
    label: 'Active',
    icon: '✅'
  },
  inactive: {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    variant: 'secondary' as const,
    label: 'Inactive',
    icon: '⏸️'
  },
  deprecated: {
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    variant: 'destructive' as const,
    label: 'Deprecated',
    icon: '❌'
  }
} as const

// Default Form Values
export const DEFAULT_TECHNOLOGY_FORM = {
  name: '',
  category: '' as const,
  description: '',
  status: 'active' as const,
  version: '',
  icon: '',
  documentationUrl: ''
}

// Validation Rules
export const VALIDATION_RULES = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-\.]+$/
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  version: {
    required: true,
    pattern: /^[0-9]+\.[0-9]+(\.[0-9]+)?(-[a-zA-Z0-9]+)?$/
  },
  documentationUrl: {
    required: false,
    pattern: /^https?:\/\/.+/
  }
} as const

// Display Configuration
export const DISPLAY_CONFIG = {
  itemsPerPage: 12,
  maxDescriptionLength: 100,
  maxNameLength: 30,
  gridColumns: {
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
  searchFields: ['name', 'description', 'category'] as const
} as const

// Animation Configuration
export const ANIMATION_CONFIG = {
  duration: 200,
  easing: 'ease-in-out',
  stagger: 50
} as const
