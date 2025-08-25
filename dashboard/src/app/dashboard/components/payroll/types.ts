// Core Payroll Types
export interface PayrollEntry {
  id: string
  employeeId: string
  employeeName: string
  department: string
  position?: string
  month: string
  year: number
  baseSalary: number
  bonuses: PayrollBonus[]
  deductions: PayrollDeduction[]
  grossSalary: number
  netSalary: number
  payDate: string
  status: PayrollStatus
  payslipGenerated: boolean
  notes?: string
  metadata?: PayrollMetadata
  approvedBy?: string
  approvedAt?: string
  processedBy?: string
  processedAt?: string
}

export interface PayrollBonus {
  id: string
  type: BonusType
  amount: number
  description: string
  date: string
  isRecurring?: boolean
  taxable?: boolean
  approvedBy?: string
}

export interface PayrollDeduction {
  id: string
  type: DeductionType
  amount: number
  description: string
  date: string
  isRecurring?: boolean
  isMandatory?: boolean
  category?: DeductionCategory
}

export interface PayrollMetadata {
  workingDays?: number
  overtimeHours?: number
  leavesTaken?: number
  lateDeductions?: number
  currency?: string
  exchangeRate?: number
  paymentMethod?: PaymentMethod
  bankDetails?: BankDetails
}

export interface BankDetails {
  accountNumber?: string
  routingNumber?: string
  bankName?: string
  accountType?: 'checking' | 'savings'
}

export interface PayrollSummary {
  totalMonthlyPayroll: number
  totalBonuses: number
  totalDeductions: number
  employeeCount: number
  pendingPayments: number
  upcomingPayments: number
  failedPayments: number
  averageSalary: number
  departmentBreakdown: Record<string, PayrollDepartmentSummary>
  statusBreakdown: Record<PayrollStatus, number>
  monthlyTrend: PayrollTrendData[]
}

export interface PayrollDepartmentSummary {
  employeeCount: number
  totalPayroll: number
  averageSalary: number
  totalBonuses: number
  totalDeductions: number
}

export interface PayrollTrendData {
  month: string
  year: number
  totalPayroll: number
  employeeCount: number
  averageSalary: number
}

export interface PayrollFilters {
  search: string
  month: string
  year: string
  department: string
  status: string
  dateRange: string
  salaryRange: SalaryRange
}

export interface SalaryRange {
  min: number
  max: number
}

// Enums and Status Types
export type PayrollStatus = 'Paid' | 'Pending' | 'Processing' | 'Failed' | 'Cancelled' | 'On Hold'
export type BonusType = 'Performance Bonus' | 'Holiday Bonus' | 'Project Completion' | 'Overtime' | 'Commission' | 'Referral Bonus' | 'Annual Bonus' | 'Spot Bonus' | 'Retention Bonus'
export type DeductionType = 'Income Tax' | 'Social Security' | 'Health Insurance' | 'Dental Insurance' | 'Retirement Fund' | 'Loan Repayment' | 'Advance Salary' | 'Union Dues' | 'Parking Fee' | 'Other'
export type DeductionCategory = 'Tax' | 'Insurance' | 'Retirement' | 'Loan' | 'Benefit' | 'Other'
export type PaymentMethod = 'Direct Deposit' | 'Check' | 'Cash' | 'Wire Transfer' | 'Digital Wallet'

// Component Props Types
export interface BasePayrollProps {
  userRole: string
  canManage?: boolean
}

export interface PayrollActionProps {
  onView?: (entry: PayrollEntry) => void
  onEdit?: (entry: PayrollEntry) => void
  onDelete?: (entryId: string) => void
  onApprove?: (entryId: string) => void
  onReject?: (entryId: string) => void
  onGeneratePayslip?: (entryId: string) => void
  onProcessPayment?: (entryId: string) => void
}

// Form Types
export interface PayrollFormData {
  employeeId: string
  month: string
  year: number
  baseSalary: number
  bonuses: PayrollBonus[]
  deductions: PayrollDeduction[]
  notes?: string
  payDate: string
}

export interface BonusFormData {
  type: BonusType
  amount: number
  description: string
  isRecurring: boolean
  taxable: boolean
}

export interface DeductionFormData {
  type: DeductionType
  amount: number
  description: string
  isRecurring: boolean
  category: DeductionCategory
}

// Modal Types
export interface ModalState<T = any> {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view' | 'approve' | 'process'
  data?: T | null
}

// Hook Return Types
export interface UsePayrollReturn {
  payrollEntries: PayrollEntry[]
  filteredEntries: PayrollEntry[]
  summary: PayrollSummary
  filters: PayrollFilters
  isLoading: boolean
  error: string | null
  actions: {
    setFilters: (filters: Partial<PayrollFilters>) => void
    createEntry: (entry: Omit<PayrollEntry, 'id' | 'grossSalary' | 'netSalary'>) => void
    updateEntry: (id: string, updates: Partial<PayrollEntry>) => void
    deleteEntry: (id: string) => void
    approveEntry: (id: string) => void
    processPayment: (id: string) => void
    generatePayslip: (id: string) => void
    refreshEntries: () => void
  }
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface PayrollValidationRules {
  baseSalary: {
    required: boolean
    min: number
    max: number
  }
  bonuses: {
    maxCount: number
    maxAmount: number
  }
  deductions: {
    maxCount: number
    maxPercentage: number
  }
}

// Configuration Types
export interface PayrollConfig {
  defaultCurrency: string
  taxRates: Record<string, number>
  socialSecurityRate: number
  maxOvertimeHours: number
  payrollCycle: 'monthly' | 'bi-weekly' | 'weekly'
  approvalRequired: boolean
  autoGeneratePayslips: boolean
}

// Employee Types
export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  baseSalary: number
  hireDate: string
  status: 'Active' | 'Inactive' | 'Terminated'
  payrollSettings?: EmployeePayrollSettings
}

export interface EmployeePayrollSettings {
  paymentMethod: PaymentMethod
  bankDetails?: BankDetails
  taxExemptions: number
  customDeductions: PayrollDeduction[]
  salaryHistory: SalaryHistoryEntry[]
}

export interface SalaryHistoryEntry {
  id: string
  previousSalary: number
  newSalary: number
  effectiveDate: string
  reason: string
  approvedBy: string
}

// Report Types
export interface PayrollReport {
  id: string
  title: string
  type: PayrollReportType
  period: ReportPeriod
  generatedAt: string
  generatedBy: string
  data: any
  format: 'PDF' | 'Excel' | 'CSV'
}

export interface ReportPeriod {
  startDate: string
  endDate: string
  month?: string
  year?: number
}

export type PayrollReportType =
  | 'Monthly Summary'
  | 'Department Breakdown'
  | 'Tax Summary'
  | 'Payslip Batch'
  | 'Audit Trail'
  | 'Compliance Report'

// Audit Types
export interface PayrollAuditEntry {
  id: string
  action: PayrollAuditAction
  entityType: 'PayrollEntry' | 'Employee' | 'Bonus' | 'Deduction'
  entityId: string
  userId: string
  userName: string
  timestamp: string
  changes?: Record<string, { old: any; new: any }>
  notes?: string
}

export type PayrollAuditAction =
  | 'Created'
  | 'Updated'
  | 'Deleted'
  | 'Approved'
  | 'Rejected'
  | 'Processed'
  | 'Generated'
  | 'Exported'

// Notification Types
export interface PayrollNotification {
  id: string
  type: PayrollNotificationType
  title: string
  message: string
  recipient: string
  status: 'Pending' | 'Sent' | 'Failed'
  createdAt: string
  sentAt?: string
  data?: any
}

export type PayrollNotificationType =
  | 'PayrollProcessed'
  | 'PayslipGenerated'
  | 'PaymentFailed'
  | 'ApprovalRequired'
  | 'DeadlineReminder'
  | 'ComplianceAlert'