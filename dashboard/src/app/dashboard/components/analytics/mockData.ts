import { 
  KPIMetrics, 
  ProjectAnalytics, 
  EmployeeAnalytics, 
  PayrollAnalytics, 
  SavedReport,
  ChartDataPoint,
  TimeSeriesData
} from './types'

// Seeded random function for consistent results
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Generate consistent time series data
const generateTimeSeriesData = (days: number, baseValue: number, variance: number, seed: number): TimeSeriesData[] => {
  const data: TimeSeriesData[] = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const randomFactor = seededRandom(seed + i) * variance
    const value = Math.max(0, baseValue + randomFactor - variance / 2)
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100
    })
  }
  
  return data
}

// Mock KPI Data
export const mockKPIData: KPIMetrics = {
  totalProjects: {
    value: 45,
    change: 12,
    trend: 'up',
    format: 'number'
  },
  taskCompletion: {
    value: 87,
    change: 5,
    trend: 'up',
    format: 'percentage'
  },
  teamEfficiency: {
    value: 92,
    change: -2,
    trend: 'down',
    format: 'percentage'
  },
  attendance: {
    value: 94,
    change: 3,
    trend: 'up',
    format: 'percentage'
  },
  payrollTotal: {
    value: 125000,
    change: 8,
    trend: 'up',
    format: 'currency'
  },
  performance: {
    value: 85,
    change: 7,
    trend: 'up',
    format: 'percentage'
  }
}

// Mock Project Analytics
export const mockProjectAnalytics: ProjectAnalytics = {
  totalProjects: 45,
  activeProjects: 32,
  completedProjects: 13,
  overdueTasks: 8,
  averageCompletion: 87,
  projectsByStatus: [
    { name: 'Active', value: 32, color: '#10b981' },
    { name: 'Completed', value: 13, color: '#3b82f6' },
    { name: 'On Hold', value: 5, color: '#f59e0b' },
    { name: 'Cancelled', value: 2, color: '#ef4444' }
  ],
  taskCompletionTrend: generateTimeSeriesData(30, 85, 10, 100),
  departmentPerformance: [
    { name: 'Engineering', value: 92, color: '#3b82f6' },
    { name: 'Design', value: 88, color: '#8b5cf6' },
    { name: 'Marketing', value: 85, color: '#10b981' },
    { name: 'Sales', value: 90, color: '#f59e0b' },
    { name: 'HR', value: 87, color: '#ef4444' }
  ]
}

// Mock Employee Analytics
export const mockEmployeeAnalytics: EmployeeAnalytics = {
  totalEmployees: 156,
  activeEmployees: 148,
  averagePerformance: 85,
  attendanceRate: 94,
  performanceByDepartment: [
    { name: 'Engineering', value: 88, color: '#3b82f6' },
    { name: 'Design', value: 85, color: '#8b5cf6' },
    { name: 'Marketing', value: 82, color: '#10b981' },
    { name: 'Sales', value: 90, color: '#f59e0b' },
    { name: 'HR', value: 87, color: '#ef4444' },
    { name: 'Finance', value: 89, color: '#06b6d4' }
  ],
  attendanceTrend: generateTimeSeriesData(30, 94, 5, 200),
  skillDistribution: [
    { name: 'JavaScript', value: 45, color: '#f7df1e' },
    { name: 'Python', value: 38, color: '#3776ab' },
    { name: 'React', value: 42, color: '#61dafb' },
    { name: 'Node.js', value: 35, color: '#339933' },
    { name: 'TypeScript', value: 40, color: '#3178c6' },
    { name: 'Design', value: 25, color: '#ff6b6b' },
    { name: 'Marketing', value: 20, color: '#4ecdc4' },
    { name: 'Sales', value: 18, color: '#45b7d1' }
  ]
}

// Mock Payroll Analytics
export const mockPayrollAnalytics: PayrollAnalytics = {
  totalPayroll: 125000,
  averageSalary: 8500,
  payrollTrend: generateTimeSeriesData(12, 120000, 15000, 300).map(item => ({
    ...item,
    date: new Date(2024, parseInt(item.date.split('-')[1]) - 1, 1).toISOString().split('T')[0]
  })),
  departmentCosts: [
    { name: 'Engineering', value: 45000, color: '#3b82f6' },
    { name: 'Sales', value: 32000, color: '#10b981' },
    { name: 'Marketing', value: 25000, color: '#f59e0b' },
    { name: 'Design', value: 18000, color: '#8b5cf6' },
    { name: 'HR', value: 15000, color: '#ef4444' },
    { name: 'Finance', value: 12000, color: '#06b6d4' }
  ],
  bonusDistribution: [
    { name: 'Performance Bonus', value: 8500, color: '#10b981' },
    { name: 'Project Completion', value: 6200, color: '#3b82f6' },
    { name: 'Overtime', value: 4800, color: '#f59e0b' },
    { name: 'Holiday Bonus', value: 3200, color: '#8b5cf6' },
    { name: 'Referral Bonus', value: 1800, color: '#ef4444' }
  ],
  deductionBreakdown: [
    { name: 'Income Tax', value: 18500, color: '#ef4444' },
    { name: 'Social Security', value: 7800, color: '#f59e0b' },
    { name: 'Health Insurance', value: 5400, color: '#3b82f6' },
    { name: 'Retirement Fund', value: 6200, color: '#10b981' },
    { name: 'Other', value: 2100, color: '#6b7280' }
  ]
}

// Mock Saved Reports
export const mockSavedReports: SavedReport[] = [
  {
    id: 'report-1',
    name: 'Monthly Project Summary',
    description: 'Comprehensive project status and performance report for monthly review',
    module: 'projects',
    fields: ['project_name', 'project_status', 'completion_percentage', 'assigned_team', 'budget'],
    filters: {
      dateRange: { from: undefined, to: undefined },
      department: 'All Departments',
      status: 'all',
      search: ''
    },
    createdBy: 'Admin',
    createdAt: '2024-01-15',
    lastRun: '2024-01-20',
    isPublic: true,
    schedule: {
      frequency: 'monthly',
      time: '09:00',
      recipients: ['admin@company.com', 'manager@company.com'],
      enabled: true
    }
  },
  {
    id: 'report-2',
    name: 'Employee Performance Review',
    description: 'Quarterly performance metrics and ratings for all employees',
    module: 'performance',
    fields: ['employee_name', 'overall_score', 'technical_skills', 'communication', 'teamwork'],
    filters: {
      dateRange: { from: undefined, to: undefined },
      department: 'All Departments',
      status: 'all',
      search: ''
    },
    createdBy: 'HR Manager',
    createdAt: '2024-01-10',
    lastRun: '2024-01-18',
    isPublic: false,
    schedule: {
      frequency: 'quarterly',
      time: '10:00',
      recipients: ['hr@company.com'],
      enabled: true
    }
  },
  {
    id: 'report-3',
    name: 'Payroll Summary',
    description: 'Monthly payroll breakdown with bonuses and deductions',
    module: 'payroll',
    fields: ['employee_name', 'base_salary', 'gross_salary', 'net_salary', 'bonuses', 'deductions'],
    filters: {
      dateRange: { from: undefined, to: undefined },
      department: 'All Departments',
      status: 'all',
      search: ''
    },
    createdBy: 'Finance Manager',
    createdAt: '2024-01-05',
    lastRun: '2024-01-19',
    isPublic: false,
    schedule: {
      frequency: 'monthly',
      time: '08:00',
      recipients: ['finance@company.com', 'admin@company.com'],
      enabled: true
    }
  },
  {
    id: 'report-4',
    name: 'Department Efficiency Report',
    description: 'Cross-department efficiency and productivity analysis',
    module: 'projects',
    fields: ['project_name', 'assigned_team', 'completion_percentage', 'start_date', 'end_date'],
    filters: {
      dateRange: { from: undefined, to: undefined },
      department: 'All Departments',
      status: 'active',
      search: ''
    },
    createdBy: 'Operations Manager',
    createdAt: '2024-01-08',
    lastRun: '2024-01-17',
    isPublic: true,
    schedule: {
      frequency: 'weekly',
      time: '09:30',
      recipients: ['ops@company.com', 'manager@company.com'],
      enabled: false
    }
  },
  {
    id: 'report-5',
    name: 'Skills Assessment Report',
    description: 'Employee skills and certification tracking report',
    module: 'employees',
    fields: ['employee_name', 'department', 'skills', 'certifications', 'performance_score'],
    filters: {
      dateRange: { from: undefined, to: undefined },
      department: 'Engineering',
      status: 'all',
      search: ''
    },
    createdBy: 'Tech Lead',
    createdAt: '2024-01-12',
    lastRun: '2024-01-16',
    isPublic: false,
    schedule: {
      frequency: 'monthly',
      time: '11:00',
      recipients: ['tech@company.com'],
      enabled: true
    }
  }
]

// Helper function to get filtered mock data based on user role
export const getMockDataForRole = (userRole: string) => {
  const canViewPayroll = userRole === 'Admin' || userRole === 'HR'
  const canViewEmployees = userRole === 'Admin' || userRole === 'HR' || userRole === 'Manager'
  
  return {
    kpiData: {
      ...mockKPIData,
      ...(canViewPayroll ? {} : { payrollTotal: { ...mockKPIData.payrollTotal, value: 0 } })
    },
    projectAnalytics: mockProjectAnalytics,
    employeeAnalytics: canViewEmployees ? mockEmployeeAnalytics : {
      ...mockEmployeeAnalytics,
      totalEmployees: 0,
      activeEmployees: 0,
      performanceByDepartment: [],
      skillDistribution: []
    },
    payrollAnalytics: canViewPayroll ? mockPayrollAnalytics : {
      totalPayroll: 0,
      averageSalary: 0,
      payrollTrend: [],
      departmentCosts: [],
      bonusDistribution: [],
      deductionBreakdown: []
    },
    savedReports: mockSavedReports.filter(report => {
      if (report.module === 'payroll' && !canViewPayroll) return false
      if (report.module === 'employees' && !canViewEmployees) return false
      return true
    })
  }
}
