import { AttendanceStatus, UserRole, AttendanceViewMode } from './types'

// Attendance Status Constants
export const ATTENDANCE_STATUSES: readonly AttendanceStatus[] = [
  'Present',
  'Late',
  'Absent',
  'Partial',
  'Holiday',
  'Sick Leave'
] as const

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  'Present': 'bg-green-500',
  'Late': 'bg-yellow-500',
  'Absent': 'bg-red-500',
  'Partial': 'bg-orange-500',
  'Holiday': 'bg-blue-500',
  'Sick Leave': 'bg-purple-500'
} as const

export const ATTENDANCE_STATUS_BADGES: Record<AttendanceStatus, string> = {
  'Present': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Late': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Absent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Partial': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Holiday': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Sick Leave': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
} as const

export const ATTENDANCE_STATUS_DESCRIPTIONS: Record<AttendanceStatus, string> = {
  'Present': 'Employee was present and on time',
  'Late': 'Employee arrived late but was present',
  'Absent': 'Employee was not present',
  'Partial': 'Employee was present for part of the day',
  'Holiday': 'Scheduled holiday or time off',
  'Sick Leave': 'Employee was on sick leave'
} as const

// Department Constants
export const DEPARTMENTS: readonly string[] = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support',
  'Product',
  'Quality Assurance'
] as const

// Time and Schedule Constants
export const WEEK_DAYS: readonly string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const
export const FULL_WEEK_DAYS: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const WORK_SCHEDULE_TYPES = {
  STANDARD: 'standard',
  FLEXIBLE: 'flexible',
  SHIFT: 'shift',
  REMOTE: 'remote'
} as const

export const DEFAULT_WORK_HOURS = {
  START_TIME: '09:00',
  END_TIME: '17:00',
  BREAK_DURATION: 60, // minutes
  LUNCH_DURATION: 60, // minutes
  FULL_DAY_HOURS: 8,
  HALF_DAY_HOURS: 4
} as const

// Policy Constants
export const ATTENDANCE_POLICIES = {
  LATE_THRESHOLD: 15, // minutes
  GRACE_PERIOD: 5, // minutes
  HALF_DAY_THRESHOLD: 4, // hours
  FULL_DAY_THRESHOLD: 6, // hours
  OVERTIME_THRESHOLD: 8, // hours
  MAX_BREAK_DURATION: 120, // minutes
  MAX_CONSECUTIVE_ABSENCES: 3
} as const

// View Mode Constants
export const VIEW_MODES: readonly AttendanceViewMode[] = [
  'daily',
  'weekly',
  'monthly',
  'yearly'
] as const

export const VIEW_MODE_LABELS: Record<AttendanceViewMode, string> = {
  'daily': 'Daily View',
  'weekly': 'Weekly View',
  'monthly': 'Monthly View',
  'yearly': 'Yearly View'
} as const

// Permission Constants
export const PERMISSION_LEVELS: Record<UserRole, {
  canViewAll: boolean
  canEditAll: boolean
  canApprove: boolean
  canDelete: boolean
  canExport: boolean
  canManageSchedules: boolean
  canViewReports: boolean
  canManagePolicies: boolean
}> = {
  Admin: {
    canViewAll: true,
    canEditAll: true,
    canApprove: true,
    canDelete: true,
    canExport: true,
    canManageSchedules: true,
    canViewReports: true,
    canManagePolicies: true
  },
  HR: {
    canViewAll: true,
    canEditAll: true,
    canApprove: true,
    canDelete: false,
    canExport: true,
    canManageSchedules: true,
    canViewReports: true,
    canManagePolicies: false
  },
  Manager: {
    canViewAll: false, // Only team members
    canEditAll: false, // Only team members
    canApprove: true,
    canDelete: false,
    canExport: true,
    canManageSchedules: false,
    canViewReports: true,
    canManagePolicies: false
  },
  Employee: {
    canViewAll: false, // Only own records
    canEditAll: false, // Only own records with restrictions
    canApprove: false,
    canDelete: false,
    canExport: false,
    canManageSchedules: false,
    canViewReports: false,
    canManagePolicies: false
  }
} as const

// Validation Rules
export const VALIDATION_RULES = {
  attendance: {
    maxHoursPerDay: 24,
    minHoursPerDay: 0,
    maxBreakHours: 4,
    maxOvertimeHours: 12
  },
  timeFormat: {
    pattern: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    example: 'HH:MM (24-hour format)'
  },
  dateRange: {
    maxDaysBack: 365,
    maxDaysForward: 30
  }
} as const

// Display Configuration
export const DISPLAY_CONFIG = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100]
  },
  dateFormats: {
    display: 'MMM dd, yyyy',
    input: 'yyyy-MM-dd',
    time: 'HH:mm'
  },
  charts: {
    colors: {
      present: '#10b981',
      late: '#f59e0b',
      absent: '#ef4444',
      partial: '#f97316',
      holiday: '#3b82f6',
      sickLeave: '#8b5cf6'
    }
  }
} as const

// Mock Team Data
export const MOCK_TEAM_MEMBERS = [
  {
    id: 'emp-1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    joinDate: '2023-01-15',
    workSchedule: {
      id: 'schedule-1',
      name: 'Standard',
      startTime: '09:00',
      endTime: '17:00',
      workingDays: [1, 2, 3, 4, 5],
      breakDuration: 60,
      isFlexible: false
    }
  },
  {
    id: 'emp-3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    position: 'UX Designer',
    department: 'Design',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    joinDate: '2023-03-20',
    workSchedule: {
      id: 'schedule-2',
      name: 'Flexible',
      startTime: '08:00',
      endTime: '16:00',
      workingDays: [1, 2, 3, 4, 5],
      breakDuration: 60,
      isFlexible: true,
      coreHours: {
        start: '10:00',
        end: '15:00'
      }
    }
  },
  {
    id: 'emp-7',
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    position: 'Software Engineer',
    department: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    isActive: true,
    joinDate: '2023-06-10',
    workSchedule: {
      id: 'schedule-1',
      name: 'Standard',
      startTime: '09:00',
      endTime: '17:00',
      workingDays: [1, 2, 3, 4, 5],
      breakDuration: 60,
      isFlexible: false
    }
  }
] as const

// Week Options for Dropdowns
export const WEEK_OPTIONS = [
  { value: 0, label: 'This Week' },
  { value: -1, label: 'Last Week' },
  { value: -2, label: '2 Weeks Ago' },
  { value: -3, label: '3 Weeks Ago' },
  { value: -4, label: '4 Weeks Ago' }
] as const

// Export Formats
export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', extension: '.csv' },
  { value: 'excel', label: 'Excel', extension: '.xlsx' },
  { value: 'pdf', label: 'PDF', extension: '.pdf' }
] as const