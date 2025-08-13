import { Technology, TechnologyFilters, TechnologyStats, TechnologyCategory, TechnologyStatus } from './types'
import { STATUS_CONFIG, TECHNOLOGY_CATEGORIES, VALIDATION_RULES } from './constants'

// Filtering Utilities
export const filterTechnologies = (
  technologies: Technology[],
  filters: TechnologyFilters
): Technology[] => {
  return technologies.filter(tech => {
    const matchesSearch = filters.search === '' || 
      tech.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      tech.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      tech.category.toLowerCase().includes(filters.search.toLowerCase())
    
    const matchesCategory = filters.category === 'all' || tech.category === filters.category
    const matchesStatus = filters.status === 'all' || tech.status === filters.status
    
    return matchesSearch && matchesCategory && matchesStatus
  })
}

// Sorting Utilities
export const sortTechnologies = (
  technologies: Technology[],
  field: keyof Technology,
  direction: 'asc' | 'desc'
): Technology[] => {
  return [...technologies].sort((a, b) => {
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
export const calculateTechnologyStats = (technologies: Technology[]): TechnologyStats => {
  const total = technologies.length
  const active = technologies.filter(t => t.status === 'active').length
  const inactive = technologies.filter(t => t.status === 'inactive').length
  const deprecated = technologies.filter(t => t.status === 'deprecated').length
  
  const categories = {} as Record<TechnologyCategory, number>
  TECHNOLOGY_CATEGORIES.forEach(category => {
    categories[category] = technologies.filter(t => t.category === category).length
  })

  return { total, active, inactive, deprecated, categories }
}

// Status Utilities
export const getStatusConfig = (status: TechnologyStatus) => {
  return STATUS_CONFIG[status]
}

export const getStatusBadgeVariant = (status: TechnologyStatus) => {
  return STATUS_CONFIG[status].variant
}

export const getStatusColor = (status: TechnologyStatus) => {
  return STATUS_CONFIG[status].color
}

// Most Used Technologies
export const getMostUsedTechnologies = (technologies: Technology[], limit: number = 5) => {
  return technologies
    .filter(tech => tech.status === 'active')
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, limit)
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

// Validation Utilities
export const validateTechnologyForm = (data: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {}
  
  // Name validation
  if (!data.name || data.name.trim().length < VALIDATION_RULES.name.minLength) {
    errors.name = `Name must be at least ${VALIDATION_RULES.name.minLength} characters`
  } else if (data.name.length > VALIDATION_RULES.name.maxLength) {
    errors.name = `Name must be less than ${VALIDATION_RULES.name.maxLength} characters`
  } else if (!VALIDATION_RULES.name.pattern.test(data.name)) {
    errors.name = 'Name contains invalid characters'
  }
  
  // Category validation
  if (!data.category) {
    errors.category = 'Category is required'
  }
  
  // Description validation
  if (!data.description || data.description.trim().length < VALIDATION_RULES.description.minLength) {
    errors.description = `Description must be at least ${VALIDATION_RULES.description.minLength} characters`
  } else if (data.description.length > VALIDATION_RULES.description.maxLength) {
    errors.description = `Description must be less than ${VALIDATION_RULES.description.maxLength} characters`
  }
  
  // Version validation
  if (!data.version) {
    errors.version = 'Version is required'
  } else if (!VALIDATION_RULES.version.pattern.test(data.version)) {
    errors.version = 'Version format is invalid (e.g., 1.0.0)'
  }
  
  // Documentation URL validation
  if (data.documentationUrl && !VALIDATION_RULES.documentationUrl.pattern.test(data.documentationUrl)) {
    errors.documentationUrl = 'Documentation URL must be a valid HTTP/HTTPS URL'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Search Utilities
export const highlightSearchTerm = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text
  
  const regex = new RegExp(`(${searchTerm})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
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

// Permission Utilities
export const canManageTechnologies = (userRole: string): boolean => {
  return userRole === 'Admin' || userRole === 'HR'
}

export const canEditTechnology = (userRole: string, technology: Technology): boolean => {
  return canManageTechnologies(userRole) || technology.createdBy === userRole
}

export const canDeleteTechnology = (userRole: string, technology: Technology): boolean => {
  return userRole === 'Admin' || technology.createdBy === userRole
}

// ID Generation Utility
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Deep Clone Utility
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}
