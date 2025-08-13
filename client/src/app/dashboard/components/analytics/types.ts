// Core Analytics Types
export interface AnalyticsFilters {
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  department: string
  module: string
  status: string
  search: string
}

export interface KPIData {
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
  label?: string
  format?: 'number' | 'currency' | 'percentage'
}

export interface KPIMetrics {
  totalProjects: KPIData
  taskCompletion: KPIData
  teamEfficiency: KPIData
  attendance: KPIData
  payrollTotal: KPIData
  performance: KPIData
}

// Chart Data Types
export interface ChartDataPoint {
  name: string
  value: number
  label?: string
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  category?: string
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut'
  title: string
  description?: string
  dataKey: string
  xAxisKey?: string
  yAxisKey?: string
  colors?: string[]
}

// Report Builder Types
export interface ReportField {
  id: string
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  category: string
  required?: boolean
}

export interface ReportModule {
  id: string
  name: string
  fields: ReportField[]
  permissions: string[]
}

export interface SavedReport {
  id: string
  name: string
  description: string
  module: string
  fields: string[]
  filters: Partial<AnalyticsFilters>
  createdBy: string
  createdAt: string
  lastRun?: string
  isPublic: boolean
  schedule?: ReportSchedule
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  time: string
  recipients: string[]
  enabled: boolean
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeCharts: boolean
  includeRawData: boolean
  template?: string
}

// Analytics Tab Types
export interface ProjectAnalytics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  overdueTasks: number
  averageCompletion: number
  projectsByStatus: ChartDataPoint[]
  taskCompletionTrend: TimeSeriesData[]
  departmentPerformance: ChartDataPoint[]
}

export interface EmployeeAnalytics {
  totalEmployees: number
  activeEmployees: number
  averagePerformance: number
  attendanceRate: number
  performanceByDepartment: ChartDataPoint[]
  attendanceTrend: TimeSeriesData[]
  skillDistribution: ChartDataPoint[]
}

export interface PayrollAnalytics {
  totalPayroll: number
  averageSalary: number
  payrollTrend: TimeSeriesData[]
  departmentCosts: ChartDataPoint[]
  bonusDistribution: ChartDataPoint[]
  deductionBreakdown: ChartDataPoint[]
}

// Hook Return Types
export interface UseAnalyticsReturn {
  kpiData: KPIMetrics
  projectAnalytics: ProjectAnalytics
  employeeAnalytics: EmployeeAnalytics
  payrollAnalytics: PayrollAnalytics
  filters: AnalyticsFilters
  isLoading: boolean
  error: string | null
  actions: {
    setFilters: (filters: Partial<AnalyticsFilters>) => void
    refreshData: () => void
    exportData: (options: ReportExportOptions) => void
  }
}

export interface UseReportBuilderReturn {
  reportName: string
  reportDescription: string
  selectedModule: string
  selectedFields: string[]
  dateRange: AnalyticsFilters['dateRange']
  savedReports: SavedReport[]
  availableModules: ReportModule[]
  isLoading: boolean
  error: string | null
  actions: {
    setReportName: (name: string) => void
    setReportDescription: (description: string) => void
    setSelectedModule: (module: string) => void
    toggleField: (fieldId: string) => void
    setDateRange: (range: AnalyticsFilters['dateRange']) => void
    generateReport: () => void
    saveReport: () => void
    deleteReport: (reportId: string) => void
    runReport: (reportId: string) => void
  }
}

// Component Props Types
export interface AnalyticsDashboardProps {
  userRole: string
}

export interface AnalyticsFiltersProps {
  filters: AnalyticsFilters
  onFiltersChange: (filters: Partial<AnalyticsFilters>) => void
  onClearFilters: () => void
  className?: string
}

export interface OverviewChartsProps {
  kpiData: KPIMetrics
  className?: string
}

export interface ProjectAnalyticsTabProps {
  data: ProjectAnalytics
  userRole: string
  className?: string
}

export interface EmployeeAnalyticsTabProps {
  data: EmployeeAnalytics
  userRole: string
  className?: string
}

export interface PayrollAnalyticsTabProps {
  data: PayrollAnalytics
  userRole: string
  className?: string
}

export interface ReportBuilderProps {
  userRole: string
}

// Utility Types
export type AnalyticsModule = 'overview' | 'projects' | 'employees' | 'payroll' | 'reports'
export type ExportFormat = 'pdf' | 'excel' | 'csv'
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut'
export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom'

// Permission Types
export interface AnalyticsPermissions {
  canViewOverview: boolean
  canViewProjects: boolean
  canViewEmployees: boolean
  canViewPayroll: boolean
  canCreateReports: boolean
  canManageReports: boolean
  canExportData: boolean
  canScheduleReports: boolean
}

// Validation Types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface ReportValidation extends ValidationResult {
  missingFields: string[]
  invalidFilters: string[]
}
