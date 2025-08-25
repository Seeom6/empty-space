import { PayrollStatus, BonusType, DeductionType, PaymentMethod, PayrollConfig } from './types'

// Departments Configuration
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing', 
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support',
  'Product',
  'Legal',
  'Quality Assurance'
] as const

// Bonus Types Configuration
export const BONUS_TYPES: BonusType[] = [
  'Performance Bonus',
  'Holiday Bonus',
  'Project Completion',
  'Overtime',
  'Commission',
  'Referral Bonus',
  'Annual Bonus',
  'Spot Bonus',
  'Retention Bonus'
]

// Deduction Types Configuration
export const DEDUCTION_TYPES: DeductionType[] = [
  'Income Tax',
  'Social Security',
  'Health Insurance',
  'Dental Insurance',
  'Retirement Fund',
  'Loan Repayment',
  'Advance Salary',
  'Union Dues',
  'Parking Fee',
  'Other'
]

// Payroll Status Configuration
export const PAYROLL_STATUS_CONFIG = {
  'Paid': {
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    variant: 'default' as const,
    label: 'Paid',
    icon: '✅'
  },
  'Pending': {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    variant: 'secondary' as const,
    label: 'Pending',
    icon: '⏳'
  },
  'Processing': {
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    variant: 'default' as const,
    label: 'Processing',
    icon: '⚙️'
  },
  'Failed': {
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    variant: 'destructive' as const,
    label: 'Failed',
    icon: '❌'
  },
  'Cancelled': {
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    variant: 'outline' as const,
    label: 'Cancelled',
    icon: '🚫'
  },
  'On Hold': {
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    variant: 'secondary' as const,
    label: 'On Hold',
    icon: '⏸️'
  }
} as const

// Payment Methods
export const PAYMENT_METHODS: PaymentMethod[] = [
  'Direct Deposit',
  'Check',
  'Cash',
  'Wire Transfer',
  'Digital Wallet'
]

// Months Configuration
export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

// Years Configuration (current year and previous 5 years)
export const YEARS = Array.from({ length: 6 }, (_, i) => {
  const currentYear = new Date().getFullYear()
  return currentYear - i
})

// Default Form Values
export const DEFAULT_PAYROLL_FORM = {
  employeeId: '',
  month: MONTHS[new Date().getMonth()],
  year: new Date().getFullYear(),
  baseSalary: 0,
  bonuses: [],
  deductions: [],
  notes: '',
  payDate: new Date().toISOString().split('T')[0]
}

export const DEFAULT_BONUS_FORM = {
  type: 'Performance Bonus' as BonusType,
  amount: 0,
  description: '',
  isRecurring: false,
  taxable: true
}

export const DEFAULT_DEDUCTION_FORM = {
  type: 'Other' as DeductionType,
  amount: 0,
  description: '',
  isRecurring: false,
  category: 'Other' as const
}

// Validation Rules
export const VALIDATION_RULES = {
  payroll: {
    baseSalary: {
      required: true,
      min: 0,
      max: 1000000
    },
    bonuses: {
      maxCount: 10,
      maxAmount: 100000
    },
    deductions: {
      maxCount: 15,
      maxPercentage: 50 // Max 50% of gross salary
    }
  },
  bonus: {
    amount: {
      required: true,
      min: 0,
      max: 50000
    },
    description: {
      required: true,
      minLength: 3,
      maxLength: 200
    }
  },
  deduction: {
    amount: {
      required: true,
      min: 0,
      max: 25000
    },
    description: {
      required: true,
      minLength: 3,
      maxLength: 200
    }
  }
} as const

// Display Configuration
export const DISPLAY_CONFIG = {
  itemsPerPage: 10,
  maxDescriptionLength: 100,
  tablePageSizes: [10, 25, 50, 100],
  cardColumns: {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  currencyFormat: {
    locale: 'en-US',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
} as const

// Search Configuration
export const SEARCH_CONFIG = {
  debounceMs: 300,
  minSearchLength: 2,
  searchFields: ['employeeName', 'department', 'notes'] as const
} as const

// Animation Configuration
export const ANIMATION_CONFIG = {
  duration: 200,
  easing: 'ease-in-out',
  stagger: 50
} as const

// Date Range Options
export const DATE_RANGE_OPTIONS = [
  { value: 'current-month', label: 'Current Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'last-3-months', label: 'Last 3 Months' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'current-year', label: 'Current Year' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
] as const

// Salary Range Options
export const SALARY_RANGE_OPTIONS = [
  { value: 'all', label: 'All Salaries', min: 0, max: Infinity },
  { value: '0-50k', label: '$0 - $50,000', min: 0, max: 50000 },
  { value: '50k-100k', label: '$50,000 - $100,000', min: 50000, max: 100000 },
  { value: '100k-150k', label: '$100,000 - $150,000', min: 100000, max: 150000 },
  { value: '150k+', label: '$150,000+', min: 150000, max: Infinity }
] as const

// Tax Rates (example rates - should be configurable)
export const TAX_RATES = {
  federal: 0.22,
  state: 0.05,
  socialSecurity: 0.062,
  medicare: 0.0145,
  unemployment: 0.006
} as const

// Default Configuration
export const DEFAULT_CONFIG: PayrollConfig = {
  defaultCurrency: 'USD',
  taxRates: TAX_RATES,
  socialSecurityRate: 0.062,
  maxOvertimeHours: 20,
  payrollCycle: 'monthly',
  approvalRequired: true,
  autoGeneratePayslips: true
}

// Report Types
export const REPORT_TYPES = [
  { value: 'Monthly Summary', label: 'Monthly Summary', description: 'Overview of monthly payroll data' },
  { value: 'Department Breakdown', label: 'Department Breakdown', description: 'Payroll data by department' },
  { value: 'Tax Summary', label: 'Tax Summary', description: 'Tax deductions and contributions' },
  { value: 'Payslip Batch', label: 'Payslip Batch', description: 'Generate multiple payslips' },
  { value: 'Audit Trail', label: 'Audit Trail', description: 'Payroll changes and approvals' },
  { value: 'Compliance Report', label: 'Compliance Report', description: 'Regulatory compliance data' }
] as const

// Export Formats
export const EXPORT_FORMATS = [
  { value: 'PDF', label: 'PDF', icon: '📄' },
  { value: 'Excel', label: 'Excel', icon: '📊' },
  { value: 'CSV', label: 'CSV', icon: '📋' }
] as const

// Notification Templates
export const NOTIFICATION_TEMPLATES = {
  PayrollProcessed: {
    title: 'Payroll Processed',
    message: 'Your payroll for {month} {year} has been processed successfully.'
  },
  PayslipGenerated: {
    title: 'Payslip Available',
    message: 'Your payslip for {month} {year} is now available for download.'
  },
  PaymentFailed: {
    title: 'Payment Failed',
    message: 'There was an issue processing your payment for {month} {year}. Please contact HR.'
  },
  ApprovalRequired: {
    title: 'Approval Required',
    message: 'Payroll entry for {employeeName} requires your approval.'
  },
  DeadlineReminder: {
    title: 'Payroll Deadline',
    message: 'Payroll processing deadline is approaching. Please complete all entries.'
  }
} as const
