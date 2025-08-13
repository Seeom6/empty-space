import { ReportModule, ChartConfig, AnalyticsPermissions } from './types'

// Chart Colors
export const CHART_COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75'],
  purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
  pink: ['#ec4899', '#db2777', '#be185d', '#9d174d'],
  gray: ['#6b7280', '#4b5563', '#374151', '#1f2937']
} as const

export const DEFAULT_CHART_COLORS = CHART_COLORS.primary

// Time Ranges
export const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
  { value: 'custom', label: 'Custom range' }
] as const

// Departments
export const DEPARTMENTS = [
  'All Departments',
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support'
] as const

// Export Formats
export const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF Report', icon: 'FileText' },
  { value: 'excel', label: 'Excel Spreadsheet', icon: 'Download' },
  { value: 'csv', label: 'CSV Data', icon: 'Download' }
] as const

// Report Modules
export const REPORT_MODULES: ReportModule[] = [
  {
    id: 'projects',
    name: 'Projects',
    permissions: ['Admin', 'Manager', 'Employee'],
    fields: [
      { id: 'project_name', name: 'Project Name', type: 'string', category: 'Basic' },
      { id: 'project_status', name: 'Status', type: 'string', category: 'Basic' },
      { id: 'start_date', name: 'Start Date', type: 'date', category: 'Timeline' },
      { id: 'end_date', name: 'End Date', type: 'date', category: 'Timeline' },
      { id: 'completion_percentage', name: 'Completion %', type: 'number', category: 'Progress' },
      { id: 'assigned_team', name: 'Assigned Team', type: 'string', category: 'Resources' },
      { id: 'budget', name: 'Budget', type: 'number', category: 'Financial' },
      { id: 'actual_cost', name: 'Actual Cost', type: 'number', category: 'Financial' },
      { id: 'task_count', name: 'Total Tasks', type: 'number', category: 'Progress' },
      { id: 'completed_tasks', name: 'Completed Tasks', type: 'number', category: 'Progress' }
    ]
  },
  {
    id: 'employees',
    name: 'Employees',
    permissions: ['Admin', 'HR', 'Manager'],
    fields: [
      { id: 'employee_name', name: 'Employee Name', type: 'string', category: 'Basic' },
      { id: 'employee_id', name: 'Employee ID', type: 'string', category: 'Basic' },
      { id: 'department', name: 'Department', type: 'string', category: 'Basic' },
      { id: 'position', name: 'Position', type: 'string', category: 'Basic' },
      { id: 'hire_date', name: 'Hire Date', type: 'date', category: 'Employment' },
      { id: 'performance_score', name: 'Performance Score', type: 'number', category: 'Performance' },
      { id: 'attendance_rate', name: 'Attendance Rate', type: 'number', category: 'Performance' },
      { id: 'skills', name: 'Skills', type: 'string', category: 'Qualifications' },
      { id: 'certifications', name: 'Certifications', type: 'string', category: 'Qualifications' },
      { id: 'manager', name: 'Manager', type: 'string', category: 'Hierarchy' }
    ]
  },
  {
    id: 'payroll',
    name: 'Payroll',
    permissions: ['Admin', 'HR'],
    fields: [
      { id: 'employee_name', name: 'Employee Name', type: 'string', category: 'Basic' },
      { id: 'pay_period', name: 'Pay Period', type: 'date', category: 'Timeline' },
      { id: 'base_salary', name: 'Base Salary', type: 'number', category: 'Compensation' },
      { id: 'gross_salary', name: 'Gross Salary', type: 'number', category: 'Compensation' },
      { id: 'net_salary', name: 'Net Salary', type: 'number', category: 'Compensation' },
      { id: 'bonuses', name: 'Bonuses', type: 'number', category: 'Compensation' },
      { id: 'deductions', name: 'Deductions', type: 'number', category: 'Deductions' },
      { id: 'tax_deductions', name: 'Tax Deductions', type: 'number', category: 'Deductions' },
      { id: 'overtime_hours', name: 'Overtime Hours', type: 'number', category: 'Time' },
      { id: 'overtime_pay', name: 'Overtime Pay', type: 'number', category: 'Compensation' }
    ]
  },
  {
    id: 'performance',
    name: 'Performance',
    permissions: ['Admin', 'HR', 'Manager'],
    fields: [
      { id: 'employee_name', name: 'Employee Name', type: 'string', category: 'Basic' },
      { id: 'review_period', name: 'Review Period', type: 'date', category: 'Timeline' },
      { id: 'overall_score', name: 'Overall Score', type: 'number', category: 'Scores' },
      { id: 'technical_skills', name: 'Technical Skills', type: 'number', category: 'Scores' },
      { id: 'communication', name: 'Communication', type: 'number', category: 'Scores' },
      { id: 'teamwork', name: 'Teamwork', type: 'number', category: 'Scores' },
      { id: 'leadership', name: 'Leadership', type: 'number', category: 'Scores' },
      { id: 'goals_met', name: 'Goals Met', type: 'number', category: 'Achievement' },
      { id: 'improvement_areas', name: 'Improvement Areas', type: 'string', category: 'Feedback' },
      { id: 'strengths', name: 'Strengths', type: 'string', category: 'Feedback' }
    ]
  }
]

// Chart Configurations
export const CHART_CONFIGS: Record<string, ChartConfig> = {
  projectStatus: {
    type: 'pie',
    title: 'Projects by Status',
    description: 'Distribution of projects across different statuses',
    dataKey: 'value',
    colors: [CHART_COLORS.success[0], CHART_COLORS.warning[0], CHART_COLORS.danger[0], CHART_COLORS.info[0]]
  },
  taskCompletion: {
    type: 'line',
    title: 'Task Completion Trend',
    description: 'Task completion rate over time',
    dataKey: 'value',
    xAxisKey: 'date',
    colors: [...CHART_COLORS.primary]
  },
  departmentPerformance: {
    type: 'bar',
    title: 'Department Performance',
    description: 'Performance metrics by department',
    dataKey: 'value',
    xAxisKey: 'name',
    colors: [...CHART_COLORS.success]
  },
  payrollTrend: {
    type: 'area',
    title: 'Payroll Trend',
    description: 'Monthly payroll expenses over time',
    dataKey: 'value',
    xAxisKey: 'date',
    colors: [...CHART_COLORS.info]
  },
  attendanceRate: {
    type: 'line',
    title: 'Attendance Rate',
    description: 'Employee attendance rate over time',
    dataKey: 'value',
    xAxisKey: 'date',
    colors: [...CHART_COLORS.success]
  }
}

// Role-based Permissions
export const ROLE_PERMISSIONS: Record<string, AnalyticsPermissions> = {
  Admin: {
    canViewOverview: true,
    canViewProjects: true,
    canViewEmployees: true,
    canViewPayroll: true,
    canCreateReports: true,
    canManageReports: true,
    canExportData: true,
    canScheduleReports: true
  },
  HR: {
    canViewOverview: true,
    canViewProjects: true,
    canViewEmployees: true,
    canViewPayroll: true,
    canCreateReports: true,
    canManageReports: false,
    canExportData: true,
    canScheduleReports: false
  },
  Manager: {
    canViewOverview: true,
    canViewProjects: true,
    canViewEmployees: true,
    canViewPayroll: false,
    canCreateReports: true,
    canManageReports: false,
    canExportData: true,
    canScheduleReports: false
  },
  Employee: {
    canViewOverview: false,
    canViewProjects: true,
    canViewEmployees: false,
    canViewPayroll: false,
    canCreateReports: false,
    canManageReports: false,
    canExportData: false,
    canScheduleReports: false
  }
}

// Default Filters
export const DEFAULT_FILTERS = {
  dateRange: {
    from: undefined,
    to: undefined
  },
  department: 'All Departments',
  module: 'all',
  status: 'all',
  search: ''
}

// KPI Configurations
export const KPI_CONFIGS = {
  totalProjects: {
    title: 'Total Projects',
    icon: 'Target',
    color: 'text-blue-500',
    format: 'number'
  },
  taskCompletion: {
    title: 'Task Completion',
    icon: 'CheckCircle',
    color: 'text-green-500',
    format: 'percentage'
  },
  teamEfficiency: {
    title: 'Team Efficiency',
    icon: 'TrendingUp',
    color: 'text-purple-500',
    format: 'percentage'
  },
  attendance: {
    title: 'Attendance Rate',
    icon: 'Users',
    color: 'text-indigo-500',
    format: 'percentage'
  },
  payrollTotal: {
    title: 'Total Payroll',
    icon: 'DollarSign',
    color: 'text-emerald-500',
    format: 'currency'
  },
  performance: {
    title: 'Avg Performance',
    icon: 'TrendingUp',
    color: 'text-orange-500',
    format: 'percentage'
  }
} as const

// Validation Rules
export const VALIDATION_RULES = {
  reportName: {
    minLength: 3,
    maxLength: 100,
    required: true
  },
  reportDescription: {
    maxLength: 500,
    required: false
  },
  selectedFields: {
    minCount: 1,
    maxCount: 20,
    required: true
  },
  dateRange: {
    maxDays: 365,
    required: false
  }
} as const

// Display Configuration
export const DISPLAY_CONFIG = {
  itemsPerPage: 10,
  maxChartDataPoints: 50,
  defaultChartHeight: 300,
  animationDuration: 300,
  refreshInterval: 30000, // 30 seconds
  cacheTimeout: 300000 // 5 minutes
} as const
