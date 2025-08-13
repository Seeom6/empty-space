import { 
  AnalyticsFilters, 
  KPIData, 
  ChartDataPoint, 
  TimeSeriesData, 
  AnalyticsPermissions,
  ValidationResult,
  ReportValidation,
  SavedReport
} from './types'
import { ROLE_PERMISSIONS, VALIDATION_RULES } from './constants'

// Permission Utilities
export const getAnalyticsPermissions = (userRole: string): AnalyticsPermissions => {
  return ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.Employee
}

export const canViewModule = (userRole: string, module: string): boolean => {
  const permissions = getAnalyticsPermissions(userRole)
  
  switch (module) {
    case 'overview':
      return permissions.canViewOverview
    case 'projects':
      return permissions.canViewProjects
    case 'employees':
      return permissions.canViewEmployees
    case 'payroll':
      return permissions.canViewPayroll
    case 'reports':
      return permissions.canCreateReports
    default:
      return false
  }
}

export const canPerformAction = (userRole: string, action: keyof AnalyticsPermissions): boolean => {
  const permissions = getAnalyticsPermissions(userRole)
  return permissions[action]
}

// Data Formatting Utilities
export const formatKPIValue = (value: number, format: 'number' | 'currency' | 'percentage' = 'number'): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case 'percentage':
      return `${value}%`
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value)
  }
}

export const formatTrendValue = (change: number): string => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change}%`
}

export const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'text-green-500'
    case 'down':
      return 'text-red-500'
    case 'stable':
    default:
      return 'text-gray-500'
  }
}

export const getTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return 'TrendingUp'
    case 'down':
      return 'TrendingDown'
    case 'stable':
    default:
      return 'Minus'
  }
}

// Date Utilities
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj)
}

export const formatDateRange = (from: Date | undefined, to: Date | undefined): string => {
  if (!from && !to) return 'All time'
  if (!from) return `Until ${formatDate(to!)}`
  if (!to) return `From ${formatDate(from)}`
  return `${formatDate(from)} - ${formatDate(to)}`
}

export const getDateRangeInDays = (from: Date | undefined, to: Date | undefined): number => {
  if (!from || !to) return 0
  const diffTime = Math.abs(to.getTime() - from.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Chart Data Utilities
export const processChartData = (data: any[], valueKey: string, labelKey: string): ChartDataPoint[] => {
  return data.map((item, index) => ({
    name: item[labelKey] || `Item ${index + 1}`,
    value: Number(item[valueKey]) || 0,
    label: item[labelKey],
    color: item.color
  }))
}

export const processTimeSeriesData = (data: any[], dateKey: string, valueKey: string): TimeSeriesData[] => {
  return data.map(item => ({
    date: formatDate(item[dateKey]),
    value: Number(item[valueKey]) || 0,
    category: item.category
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export const aggregateDataByPeriod = (
  data: TimeSeriesData[], 
  period: 'day' | 'week' | 'month' | 'quarter'
): TimeSeriesData[] => {
  const grouped = new Map<string, number[]>()
  
  data.forEach(item => {
    const date = new Date(item.date)
    let key: string
    
    switch (period) {
      case 'week':
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
        key = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1
        key = `${date.getFullYear()}-Q${quarter}`
        break
      case 'day':
      default:
        key = item.date
        break
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(item.value)
  })
  
  return Array.from(grouped.entries()).map(([date, values]) => ({
    date,
    value: values.reduce((sum, val) => sum + val, 0) / values.length,
    category: 'aggregated'
  }))
}

// Filter Utilities
export const applyFilters = <T extends Record<string, any>>(
  data: T[], 
  filters: Partial<AnalyticsFilters>
): T[] => {
  return data.filter(item => {
    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      const itemDate = new Date(item.date || item.createdAt || item.updatedAt)
      if (filters.dateRange.from && itemDate < filters.dateRange.from) return false
      if (filters.dateRange.to && itemDate > filters.dateRange.to) return false
    }
    
    // Department filter
    if (filters.department && filters.department !== 'All Departments') {
      if (item.department !== filters.department) return false
    }
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (item.status !== filters.status) return false
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableFields = ['name', 'title', 'description', 'department', 'status']
      const matches = searchableFields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm)
      )
      if (!matches) return false
    }
    
    return true
  })
}

// Validation Utilities
export const validateReportName = (name: string): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!name.trim()) {
    errors.push('Report name is required')
  } else if (name.length < VALIDATION_RULES.reportName.minLength) {
    errors.push(`Report name must be at least ${VALIDATION_RULES.reportName.minLength} characters`)
  } else if (name.length > VALIDATION_RULES.reportName.maxLength) {
    errors.push(`Report name must not exceed ${VALIDATION_RULES.reportName.maxLength} characters`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export const validateReportFields = (fields: string[]): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (fields.length < VALIDATION_RULES.selectedFields.minCount) {
    errors.push(`At least ${VALIDATION_RULES.selectedFields.minCount} field must be selected`)
  } else if (fields.length > VALIDATION_RULES.selectedFields.maxCount) {
    errors.push(`No more than ${VALIDATION_RULES.selectedFields.maxCount} fields can be selected`)
  }
  
  if (fields.length > 10) {
    warnings.push('Selecting many fields may impact report performance')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export const validateDateRange = (from: Date | undefined, to: Date | undefined): ValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (from && to) {
    if (from > to) {
      errors.push('Start date must be before end date')
    } else {
      const daysDiff = getDateRangeInDays(from, to)
      if (daysDiff > VALIDATION_RULES.dateRange.maxDays) {
        errors.push(`Date range cannot exceed ${VALIDATION_RULES.dateRange.maxDays} days`)
      } else if (daysDiff > 90) {
        warnings.push('Large date ranges may impact report performance')
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export const validateReport = (report: Partial<SavedReport>): ReportValidation => {
  const nameValidation = validateReportName(report.name || '')
  const fieldsValidation = validateReportFields(report.fields || [])
  const dateValidation = validateDateRange(
    report.filters?.dateRange?.from,
    report.filters?.dateRange?.to
  )
  
  const allErrors = [
    ...nameValidation.errors,
    ...fieldsValidation.errors,
    ...dateValidation.errors
  ]
  
  const allWarnings = [
    ...nameValidation.warnings,
    ...fieldsValidation.warnings,
    ...dateValidation.warnings
  ]
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    missingFields: !report.fields?.length ? ['At least one field is required'] : [],
    invalidFilters: []
  }
}

// Export Utilities
export const generateReportFilename = (reportName: string, format: string): string => {
  const timestamp = new Date().toISOString().split('T')[0]
  const sanitizedName = reportName.replace(/[^a-zA-Z0-9]/g, '_')
  return `${sanitizedName}_${timestamp}.${format}`
}

export const calculateKPIChange = (current: number, previous: number): KPIData['change'] => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export const determineKPITrend = (change: number): KPIData['trend'] => {
  if (change > 0) return 'up'
  if (change < 0) return 'down'
  return 'stable'
}
