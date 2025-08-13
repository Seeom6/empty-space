// Core Types
export type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Partial' | 'Holiday' | 'Sick Leave'
export type CheckInOutAction = 'Checked In' | 'Checked Out' | 'Absent' | 'Break'
export type AttendanceViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type UserRole = 'Admin' | 'HR' | 'Manager' | 'Employee'

// Main Interfaces
export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  employeeEmail?: string
  department: string
  position?: string
  date: string
  checkIn: string | null
  checkOut: string | null
  breakStart?: string | null
  breakEnd?: string | null
  totalHours: number
  workingHours: number
  breakHours: number
  overtimeHours: number
  status: AttendanceStatus
  notes?: string
  location?: string
  ipAddress?: string
  deviceInfo?: string
  approvedBy?: string
  approvedAt?: string
  isManualEntry: boolean
  createdAt: string
  updatedAt: string
}

export interface AttendanceFilters {
  dateFrom: string
  dateTo: string
  department: string
  status: string
  employeeName: string
  viewMode: AttendanceViewMode
  includeWeekends: boolean
  includeHolidays: boolean
}

export interface AttendanceSummary {
  totalDays: number
  workingDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  sickLeaveDays: number
  holidayDays: number
  totalHours: number
  workingHours: number
  overtimeHours: number
  averageHoursPerDay: number
  averageWorkingHoursPerDay: number
  onTimePercentage: number
  attendanceRate: number
  punctualityScore: number
}

export interface CheckInOutStatus {
  isCheckedIn: boolean
  checkInTime: string | null
  checkOutTime: string | null
  breakStart: string | null
  breakEnd: string | null
  totalHoursToday: number
  workingHoursToday: number
  breakHoursToday: number
  status: CheckInOutAction
  lastAction: string
  canCheckIn: boolean
  canCheckOut: boolean
  canStartBreak: boolean
  canEndBreak: boolean
}

export interface TeamMember {
  id: string
  name: string
  email: string
  position: string
  department: string
  avatar?: string
  isActive: boolean
  joinDate: string
  managerId?: string
  workSchedule: WorkSchedule
}

export interface WorkSchedule {
  id: string
  name: string
  startTime: string
  endTime: string
  workingDays: number[]
  breakDuration: number
  isFlexible: boolean
  coreHours?: {
    start: string
    end: string
  }
}

export interface AttendancePolicy {
  id: string
  name: string
  lateThreshold: number // minutes
  halfDayThreshold: number // hours
  fullDayThreshold: number // hours
  overtimeThreshold: number // hours
  gracePeriod: number // minutes
  requireApproval: boolean
  allowSelfCheckIn: boolean
  allowRemoteCheckIn: boolean
  trackLocation: boolean
}

export interface AttendanceDashboardData {
  summary: AttendanceSummary
  recentRecords: AttendanceRecord[]
  teamSummary?: TeamAttendanceSummary
  trends: AttendanceTrend[]
  alerts: AttendanceAlert[]
}

export interface TeamAttendanceSummary {
  totalMembers: number
  presentToday: number
  lateToday: number
  absentToday: number
  onBreak: number
  averageAttendanceRate: number
  averageWorkingHours: number
  departmentBreakdown: DepartmentAttendance[]
}

export interface DepartmentAttendance {
  department: string
  totalEmployees: number
  presentToday: number
  attendanceRate: number
  averageHours: number
}

export interface AttendanceTrend {
  date: string
  present: number
  late: number
  absent: number
  totalHours: number
  attendanceRate: number
}

export interface AttendanceAlert {
  id: string
  type: 'late' | 'absent' | 'overtime' | 'policy_violation'
  severity: 'low' | 'medium' | 'high'
  employeeId: string
  employeeName: string
  message: string
  date: string
  isRead: boolean
  actionRequired: boolean
}

export interface AttendanceReport {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'custom'
  dateRange: {
    start: string
    end: string
  }
  filters: AttendanceFilters
  data: AttendanceRecord[]
  summary: AttendanceSummary
  generatedAt: string
  generatedBy: string
}

// Component Props Interfaces
export interface AttendanceManagementProps {
  userRole: UserRole
  employeeId?: string
  onRecordUpdate?: (record: AttendanceRecord) => void
  onBulkUpdate?: (records: AttendanceRecord[]) => void
}

export interface AttendanceDashboardProps {
  userRole: UserRole
  employeeId?: string
  showTeamView?: boolean
  onEmployeeSelect?: (employeeId: string) => void
}

export interface TeamAttendanceProps {
  teamMembers: TeamMember[]
  attendanceRecords: AttendanceRecord[]
  onMemberSelect?: (memberId: string) => void
  onRecordEdit?: (record: AttendanceRecord) => void
}

// Hook Return Types
export interface UseAttendanceReturn {
  records: AttendanceRecord[]
  summary: AttendanceSummary
  isLoading: boolean
  error: string | null
  filters: AttendanceFilters
  setFilters: (filters: Partial<AttendanceFilters>) => void
  refreshData: () => Promise<void>
  exportData: (format: 'csv' | 'excel' | 'pdf') => Promise<void>
}

export interface UseCheckInOutReturn {
  status: CheckInOutStatus
  isLoading: boolean
  error: string | null
  checkIn: () => Promise<void>
  checkOut: () => Promise<void>
  startBreak: () => Promise<void>
  endBreak: () => Promise<void>
  refreshStatus: () => Promise<void>
}