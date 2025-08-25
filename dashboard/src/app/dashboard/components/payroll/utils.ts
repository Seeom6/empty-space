import { 
  PayrollEntry, 
  PayrollFilters, 
  PayrollSummary, 
  PayrollStatus,
  ValidationResult,
  PayrollFormData,
  BonusFormData,
  DeductionFormData,
  SalaryRange,
  PayrollDepartmentSummary
} from './types'
import { 
  PAYROLL_STATUS_CONFIG, 
  VALIDATION_RULES, 
  DISPLAY_CONFIG,
  DEPARTMENTS,
  TAX_RATES 
} from './constants'

// Filtering Utilities
export const filterPayrollEntries = (entries: PayrollEntry[], filters: PayrollFilters): PayrollEntry[] => {
  return entries.filter(entry => {
    const matchesSearch = filters.search === '' || 
      entry.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.department.toLowerCase().includes(filters.search.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(filters.search.toLowerCase()))
    
    const matchesMonth = filters.month === 'all' || entry.month === filters.month
    const matchesYear = filters.year === 'all' || entry.year.toString() === filters.year
    const matchesDepartment = filters.department === 'all' || entry.department === filters.department
    const matchesStatus = filters.status === 'all' || entry.status === filters.status
    
    const matchesSalaryRange = filters.salaryRange ? 
      entry.netSalary >= filters.salaryRange.min && entry.netSalary <= filters.salaryRange.max : true
    
    return matchesSearch && matchesMonth && matchesYear && matchesDepartment && matchesStatus && matchesSalaryRange
  })
}

// Sorting Utilities
export const sortPayrollEntries = (entries: PayrollEntry[], field: keyof PayrollEntry, direction: 'asc' | 'desc'): PayrollEntry[] => {
  return [...entries].sort((a, b) => {
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
export const calculatePayrollSummary = (entries: PayrollEntry[]): PayrollSummary => {
  const totalMonthlyPayroll = entries.reduce((sum, entry) => sum + entry.netSalary, 0)
  const totalBonuses = entries.reduce((sum, entry) => 
    sum + entry.bonuses.reduce((bonusSum, bonus) => bonusSum + bonus.amount, 0), 0)
  const totalDeductions = entries.reduce((sum, entry) => 
    sum + entry.deductions.reduce((deductionSum, deduction) => deductionSum + deduction.amount, 0), 0)
  
  const employeeCount = new Set(entries.map(e => e.employeeId)).size
  const pendingPayments = entries.filter(e => e.status === 'Pending').length
  const upcomingPayments = entries.filter(e => e.status === 'Processing').length
  const failedPayments = entries.filter(e => e.status === 'Failed').length
  const averageSalary = employeeCount > 0 ? totalMonthlyPayroll / employeeCount : 0
  
  // Department breakdown
  const departmentBreakdown: Record<string, PayrollDepartmentSummary> = {}
  DEPARTMENTS.forEach(dept => {
    const deptEntries = entries.filter(e => e.department === dept)
    const deptEmployeeCount = new Set(deptEntries.map(e => e.employeeId)).size
    const deptTotalPayroll = deptEntries.reduce((sum, e) => sum + e.netSalary, 0)
    const deptTotalBonuses = deptEntries.reduce((sum, e) => 
      sum + e.bonuses.reduce((bonusSum, bonus) => bonusSum + bonus.amount, 0), 0)
    const deptTotalDeductions = deptEntries.reduce((sum, e) => 
      sum + e.deductions.reduce((deductionSum, deduction) => deductionSum + deduction.amount, 0), 0)
    
    departmentBreakdown[dept] = {
      employeeCount: deptEmployeeCount,
      totalPayroll: deptTotalPayroll,
      averageSalary: deptEmployeeCount > 0 ? deptTotalPayroll / deptEmployeeCount : 0,
      totalBonuses: deptTotalBonuses,
      totalDeductions: deptTotalDeductions
    }
  })
  
  // Status breakdown
  const statusBreakdown: Record<PayrollStatus, number> = {
    'Paid': entries.filter(e => e.status === 'Paid').length,
    'Pending': entries.filter(e => e.status === 'Pending').length,
    'Processing': entries.filter(e => e.status === 'Processing').length,
    'Failed': entries.filter(e => e.status === 'Failed').length,
    'Cancelled': entries.filter(e => e.status === 'Cancelled').length,
    'On Hold': entries.filter(e => e.status === 'On Hold').length
  }
  
  // Monthly trend (last 6 months)
  const monthlyTrend = generateMonthlyTrend(entries)

  return {
    totalMonthlyPayroll,
    totalBonuses,
    totalDeductions,
    employeeCount,
    pendingPayments,
    upcomingPayments,
    failedPayments,
    averageSalary,
    departmentBreakdown,
    statusBreakdown,
    monthlyTrend
  }
}

// Generate monthly trend data
const generateMonthlyTrend = (entries: PayrollEntry[]) => {
  const monthlyData = new Map()
  
  entries.forEach(entry => {
    const key = `${entry.month}-${entry.year}`
    if (!monthlyData.has(key)) {
      monthlyData.set(key, {
        month: entry.month,
        year: entry.year,
        totalPayroll: 0,
        employeeIds: new Set()
      })
    }
    
    const data = monthlyData.get(key)
    data.totalPayroll += entry.netSalary
    data.employeeIds.add(entry.employeeId)
  })
  
  return Array.from(monthlyData.values()).map(data => ({
    month: data.month,
    year: data.year,
    totalPayroll: data.totalPayroll,
    employeeCount: data.employeeIds.size,
    averageSalary: data.employeeIds.size > 0 ? data.totalPayroll / data.employeeIds.size : 0
  })).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']
    return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month)
  }).slice(0, 6)
}

// Status Utilities
export const getPayrollStatusConfig = (status: PayrollStatus) => {
  return PAYROLL_STATUS_CONFIG[status]
}

export const getPayrollStatusBadgeVariant = (status: PayrollStatus) => {
  return PAYROLL_STATUS_CONFIG[status].variant
}

export const isPayrollPaid = (entry: PayrollEntry): boolean => {
  return entry.status === 'Paid'
}

export const isPayrollPending = (entry: PayrollEntry): boolean => {
  return entry.status === 'Pending' || entry.status === 'Processing'
}

export const canEditPayroll = (entry: PayrollEntry): boolean => {
  return entry.status === 'Pending' || entry.status === 'On Hold'
}

export const canProcessPayroll = (entry: PayrollEntry): boolean => {
  return entry.status === 'Pending'
}

// Calculation Utilities
export const calculateGrossSalary = (baseSalary: number, bonuses: { amount: number }[]): number => {
  const totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0)
  return baseSalary + totalBonuses
}

export const calculateNetSalary = (grossSalary: number, deductions: { amount: number }[]): number => {
  const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0)
  return Math.max(0, grossSalary - totalDeductions)
}

export const calculateTaxDeductions = (grossSalary: number) => {
  return {
    federalTax: Math.round(grossSalary * TAX_RATES.federal),
    stateTax: Math.round(grossSalary * TAX_RATES.state),
    socialSecurity: Math.round(grossSalary * TAX_RATES.socialSecurity),
    medicare: Math.round(grossSalary * TAX_RATES.medicare)
  }
}

// Text Utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat(DISPLAY_CONFIG.currencyFormat.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: DISPLAY_CONFIG.currencyFormat.minimumFractionDigits,
    maximumFractionDigits: DISPLAY_CONFIG.currencyFormat.maximumFractionDigits
  }).format(amount)
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

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

// Validation Utilities
export const validatePayrollForm = (data: PayrollFormData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  // Base salary validation
  if (!data.baseSalary || data.baseSalary <= 0) {
    errors.baseSalary = 'Base salary must be greater than 0'
  } else if (data.baseSalary > VALIDATION_RULES.payroll.baseSalary.max) {
    errors.baseSalary = `Base salary cannot exceed ${formatCurrency(VALIDATION_RULES.payroll.baseSalary.max)}`
  }
  
  // Employee validation
  if (!data.employeeId) {
    errors.employeeId = 'Employee is required'
  }
  
  // Month and year validation
  if (!data.month) {
    errors.month = 'Month is required'
  }
  
  if (!data.year || data.year < 2020 || data.year > new Date().getFullYear() + 1) {
    errors.year = 'Invalid year'
  }
  
  // Bonuses validation
  if (data.bonuses.length > VALIDATION_RULES.payroll.bonuses.maxCount) {
    errors.bonuses = `Maximum ${VALIDATION_RULES.payroll.bonuses.maxCount} bonuses allowed`
  }
  
  // Deductions validation
  if (data.deductions.length > VALIDATION_RULES.payroll.deductions.maxCount) {
    errors.deductions = `Maximum ${VALIDATION_RULES.payroll.deductions.maxCount} deductions allowed`
  }
  
  // Check if deductions exceed maximum percentage
  const grossSalary = calculateGrossSalary(data.baseSalary, data.bonuses)
  const totalDeductions = data.deductions.reduce((sum, d) => sum + d.amount, 0)
  const deductionPercentage = (totalDeductions / grossSalary) * 100
  
  if (deductionPercentage > VALIDATION_RULES.payroll.deductions.maxPercentage) {
    errors.deductions = `Deductions cannot exceed ${VALIDATION_RULES.payroll.deductions.maxPercentage}% of gross salary`
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateBonusForm = (data: BonusFormData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Bonus amount must be greater than 0'
  } else if (data.amount > VALIDATION_RULES.bonus.amount.max) {
    errors.amount = `Bonus amount cannot exceed ${formatCurrency(VALIDATION_RULES.bonus.amount.max)}`
  }
  
  if (!data.description || data.description.length < VALIDATION_RULES.bonus.description.minLength) {
    errors.description = `Description must be at least ${VALIDATION_RULES.bonus.description.minLength} characters`
  } else if (data.description.length > VALIDATION_RULES.bonus.description.maxLength) {
    errors.description = `Description cannot exceed ${VALIDATION_RULES.bonus.description.maxLength} characters`
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateDeductionForm = (data: DeductionFormData): ValidationResult => {
  const errors: Record<string, string> = {}
  
  if (!data.amount || data.amount <= 0) {
    errors.amount = 'Deduction amount must be greater than 0'
  } else if (data.amount > VALIDATION_RULES.deduction.amount.max) {
    errors.amount = `Deduction amount cannot exceed ${formatCurrency(VALIDATION_RULES.deduction.amount.max)}`
  }
  
  if (!data.description || data.description.length < VALIDATION_RULES.deduction.description.minLength) {
    errors.description = `Description must be at least ${VALIDATION_RULES.deduction.description.minLength} characters`
  } else if (data.description.length > VALIDATION_RULES.deduction.description.maxLength) {
    errors.description = `Description cannot exceed ${VALIDATION_RULES.deduction.description.maxLength} characters`
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Permission Utilities
export const canManagePayroll = (userRole: string): boolean => {
  return userRole === 'Admin' || userRole === 'HR Manager' || userRole === 'Payroll Manager' || userRole === 'Super Admin'
}

export const canApprovePayroll = (userRole: string): boolean => {
  return userRole === 'Admin' || userRole === 'HR Manager' || userRole === 'Super Admin'
}

export const canProcessPayments = (userRole: string): boolean => {
  return userRole === 'Admin' || userRole === 'Payroll Manager' || userRole === 'Super Admin'
}

export const canViewAllPayroll = (userRole: string): boolean => {
  return canManagePayroll(userRole)
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
