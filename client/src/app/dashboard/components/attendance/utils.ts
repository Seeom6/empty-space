import {
  AttendanceStatus,
  AttendanceRecord,
  AttendanceSummary,
  AttendanceFilters,
  CheckInOutStatus,
  UserRole,
  AttendanceViewMode
} from './types'
import {
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_BADGES,
  ATTENDANCE_STATUS_DESCRIPTIONS,
  PERMISSION_LEVELS,
  VALIDATION_RULES,
  DISPLAY_CONFIG,
  WEEK_OPTIONS,
  DEFAULT_WORK_HOURS,
  ATTENDANCE_POLICIES
} from './constants'

// Status and Color Utilities
export const getStatusColor = (status?: AttendanceStatus): string => {
  if (!status) return 'bg-gray-200'
  return ATTENDANCE_STATUS_COLORS[status] || 'bg-gray-200'
}

export const getStatusBadge = (status: AttendanceStatus): string => {
  return ATTENDANCE_STATUS_BADGES[status] || 'bg-gray-100 text-gray-800'
}

export const getStatusDescription = (status: AttendanceStatus): string => {
  return ATTENDANCE_STATUS_DESCRIPTIONS[status] || 'Unknown status'
}

export const getStatusIcon = (status: AttendanceStatus): string => {
  const iconMap: Record<AttendanceStatus, string> = {
    'Present': 'CheckCircle',
    'Late': 'AlertCircle',
    'Absent': 'XCircle',
    'Partial': 'Clock',
    'Holiday': 'Calendar',
    'Sick Leave': 'Heart'
  }
  return iconMap[status] || 'Circle'
}

// Time and Date Utilities
export const formatTime = (timeString: string | null): string => {
  if (!timeString) return '--:--'

  // Validate time format
  if (!VALIDATION_RULES.timeFormat.pattern.test(timeString)) {
    return '--:--'
  }

  return timeString
}

export const formatDate = (dateString: string, format: 'short' | 'long' | 'input' = 'short'): string => {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  switch (format) {
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'input':
      return date.toISOString().split('T')[0]
    default:
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
  }
}

export const formatDateTime = (dateString: string, timeString?: string): string => {
  const formattedDate = formatDate(dateString)
  if (timeString) {
    return `${formattedDate} at ${formatTime(timeString)}`
  }
  return formattedDate
}

export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString)
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

export const getDayName = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

// Time Calculation Utilities
export const calculateHours = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0

  const [inHour, inMinute] = checkIn.split(':').map(Number)
  const [outHour, outMinute] = checkOut.split(':').map(Number)

  if (isNaN(inHour) || isNaN(inMinute) || isNaN(outHour) || isNaN(outMinute)) {
    return 0
  }

  const inMinutes = inHour * 60 + inMinute
  const outMinutes = outHour * 60 + outMinute

  // Handle overnight shifts
  const totalMinutes = outMinutes >= inMinutes
    ? outMinutes - inMinutes
    : (24 * 60) - inMinutes + outMinutes

  return Math.round((totalMinutes / 60) * 100) / 100
}

export const calculateWorkingHours = (
  checkIn: string,
  checkOut: string,
  breakStart?: string,
  breakEnd?: string
): number => {
  const totalHours = calculateHours(checkIn, checkOut)

  if (breakStart && breakEnd) {
    const breakHours = calculateHours(breakStart, breakEnd)
    return Math.max(0, totalHours - breakHours)
  }

  return totalHours
}

export const calculateOvertimeHours = (workingHours: number): number => {
  const standardHours = DEFAULT_WORK_HOURS.FULL_DAY_HOURS
  return Math.max(0, workingHours - standardHours)
}

export const isLateArrival = (checkInTime: string, scheduledStartTime: string = DEFAULT_WORK_HOURS.START_TIME): boolean => {
  const checkIn = new Date(`2000-01-01T${checkInTime}:00`)
  const scheduled = new Date(`2000-01-01T${scheduledStartTime}:00`)
  const graceTime = new Date(scheduled.getTime() + ATTENDANCE_POLICIES.GRACE_PERIOD * 60000)

  return checkIn > graceTime
}

export const getLateDuration = (checkInTime: string, scheduledStartTime: string = DEFAULT_WORK_HOURS.START_TIME): number => {
  const checkIn = new Date(`2000-01-01T${checkInTime}:00`)
  const scheduled = new Date(`2000-01-01T${scheduledStartTime}:00`)

  if (checkIn <= scheduled) return 0

  return Math.round((checkIn.getTime() - scheduled.getTime()) / 60000) // minutes
}

// Date Range Utilities
export const getWeekDates = (weekOffset: number = 0): string[] => {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7)) // Sunday

  const weekDates: string[] = []
  for (let i = 1; i <= 5; i++) { // Monday to Friday
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    weekDates.push(date.toISOString().split('T')[0])
  }
  return weekDates
}

export const getMonthDates = (monthOffset: number = 0): string[] => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 0)

  const dates: string[] = []
  for (let date = new Date(startOfMonth); date <= endOfMonth; date.setDate(date.getDate() + 1)) {
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

export const getDateRange = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const dates: string[] = []

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(date.toISOString().split('T')[0])
  }
  return dates
}

export const getWeekOptions = () => WEEK_OPTIONS

// Attendance Summary Calculations
export const calculateAttendanceSummary = (records: AttendanceRecord[]): AttendanceSummary => {
  const totalDays = records.length
  const workingDays = records.filter(r => !isWeekend(r.date)).length

  const presentDays = records.filter(r => r.status === 'Present').length
  const lateDays = records.filter(r => r.status === 'Late').length
  const absentDays = records.filter(r => r.status === 'Absent').length
  const sickLeaveDays = records.filter(r => r.status === 'Sick Leave').length
  const holidayDays = records.filter(r => r.status === 'Holiday').length

  const totalHours = records.reduce((sum, r) => sum + r.totalHours, 0)
  const workingHours = records.reduce((sum, r) => sum + r.workingHours, 0)
  const overtimeHours = records.reduce((sum, r) => sum + r.overtimeHours, 0)

  const averageHoursPerDay = totalDays > 0 ? totalHours / totalDays : 0
  const averageWorkingHoursPerDay = workingDays > 0 ? workingHours / workingDays : 0

  const onTimePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0
  const attendanceRate = workingDays > 0 ? ((presentDays + lateDays) / workingDays) * 100 : 0
  const punctualityScore = (presentDays + lateDays) > 0 ? (presentDays / (presentDays + lateDays)) * 100 : 0

  return {
    totalDays,
    workingDays,
    presentDays,
    lateDays,
    absentDays,
    sickLeaveDays,
    holidayDays,
    totalHours: Math.round(totalHours * 100) / 100,
    workingHours: Math.round(workingHours * 100) / 100,
    overtimeHours: Math.round(overtimeHours * 100) / 100,
    averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
    averageWorkingHoursPerDay: Math.round(averageWorkingHoursPerDay * 100) / 100,
    onTimePercentage: Math.round(onTimePercentage * 100) / 100,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
    punctualityScore: Math.round(punctualityScore * 100) / 100
  }
}

// Data Filtering Utilities
export const filterAttendanceRecords = (
  records: AttendanceRecord[],
  filters: AttendanceFilters
): AttendanceRecord[] => {
  return records.filter(record => {
    // Date range filter
    if (filters.dateFrom && record.date < filters.dateFrom) return false
    if (filters.dateTo && record.date > filters.dateTo) return false

    // Department filter
    if (filters.department && filters.department !== 'all' && record.department !== filters.department) {
      return false
    }

    // Status filter
    if (filters.status && filters.status !== 'all' && record.status !== filters.status) {
      return false
    }

    // Employee name filter
    if (filters.employeeName && !record.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())) {
      return false
    }

    // Weekend filter
    if (!filters.includeWeekends && isWeekend(record.date)) {
      return false
    }

    // Holiday filter
    if (!filters.includeHolidays && record.status === 'Holiday') {
      return false
    }

    return true
  })
}

export const sortAttendanceRecords = (
  records: AttendanceRecord[],
  sortBy: keyof AttendanceRecord = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): AttendanceRecord[] => {
  return [...records].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder === 'asc' ? -1 : 1
    if (bValue == null) return sortOrder === 'asc' ? 1 : -1

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

// Permission Utilities
export const canViewAllAttendance = (userRole: UserRole): boolean => {
  return PERMISSION_LEVELS[userRole]?.canViewAll || false
}

export const canEditAttendance = (userRole: UserRole): boolean => {
  return PERMISSION_LEVELS[userRole]?.canEditAll || false
}

export const canApproveAttendance = (userRole: UserRole): boolean => {
  return PERMISSION_LEVELS[userRole]?.canApprove || false
}

export const canExportAttendance = (userRole: UserRole): boolean => {
  return PERMISSION_LEVELS[userRole]?.canExport || false
}

export const canManageSchedules = (userRole: UserRole): boolean => {
  return PERMISSION_LEVELS[userRole]?.canManageSchedules || false
}

// Status Determination Utilities
export const determineAttendanceStatus = (
  checkIn: string | null,
  checkOut: string | null,
  scheduledStartTime: string = DEFAULT_WORK_HOURS.START_TIME
): AttendanceStatus => {
  if (!checkIn) return 'Absent'

  if (isLateArrival(checkIn, scheduledStartTime)) {
    if (!checkOut) return 'Partial'

    const workingHours = calculateHours(checkIn, checkOut)
    if (workingHours < ATTENDANCE_POLICIES.HALF_DAY_THRESHOLD) {
      return 'Partial'
    }
    return 'Late'
  }

  if (!checkOut) return 'Partial'

  const workingHours = calculateHours(checkIn, checkOut)
  if (workingHours < ATTENDANCE_POLICIES.HALF_DAY_THRESHOLD) {
    return 'Partial'
  }

  return 'Present'
}

export const getCheckInOutStatus = (
  todayRecord?: AttendanceRecord
): CheckInOutStatus => {
  const defaultStatus: CheckInOutStatus = {
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    breakStart: null,
    breakEnd: null,
    totalHoursToday: 0,
    workingHoursToday: 0,
    breakHoursToday: 0,
    status: 'Checked Out',
    lastAction: 'None',
    canCheckIn: true,
    canCheckOut: false,
    canStartBreak: false,
    canEndBreak: false
  }

  if (!todayRecord) return defaultStatus

  const isCheckedIn = !!todayRecord.checkIn && !todayRecord.checkOut
  const isOnBreak = !!todayRecord.breakStart && !todayRecord.breakEnd

  return {
    isCheckedIn,
    checkInTime: todayRecord.checkIn,
    checkOutTime: todayRecord.checkOut,
    breakStart: todayRecord.breakStart || null,
    breakEnd: todayRecord.breakEnd || null,
    totalHoursToday: todayRecord.totalHours,
    workingHoursToday: todayRecord.workingHours,
    breakHoursToday: todayRecord.breakHours,
    status: isOnBreak ? 'Break' : (isCheckedIn ? 'Checked In' : 'Checked Out'),
    lastAction: todayRecord.checkOut ? 'Check Out' : (todayRecord.checkIn ? 'Check In' : 'None'),
    canCheckIn: !todayRecord.checkIn,
    canCheckOut: isCheckedIn && !isOnBreak,
    canStartBreak: isCheckedIn && !isOnBreak,
    canEndBreak: isOnBreak
  }
}

// Validation Utilities
export const validateTimeFormat = (time: string): boolean => {
  return VALIDATION_RULES.timeFormat.pattern.test(time)
}

export const validateDateRange = (startDate: string, endDate: string): { isValid: boolean; error?: string } => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }

  if (start > end) {
    return { isValid: false, error: 'Start date must be before end date' }
  }

  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff > VALIDATION_RULES.dateRange.maxDaysBack) {
    return { isValid: false, error: `Date range cannot exceed ${VALIDATION_RULES.dateRange.maxDaysBack} days` }
  }

  const futureLimit = new Date(today.getTime() + VALIDATION_RULES.dateRange.maxDaysForward * 24 * 60 * 60 * 1000)
  if (end > futureLimit) {
    return { isValid: false, error: `End date cannot be more than ${VALIDATION_RULES.dateRange.maxDaysForward} days in the future` }
  }

  return { isValid: true }
}

export const validateAttendanceRecord = (record: Partial<AttendanceRecord>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!record.employeeId) errors.push('Employee ID is required')
  if (!record.employeeName) errors.push('Employee name is required')
  if (!record.date) errors.push('Date is required')
  if (!record.department) errors.push('Department is required')

  if (record.checkIn && !validateTimeFormat(record.checkIn)) {
    errors.push('Invalid check-in time format')
  }

  if (record.checkOut && !validateTimeFormat(record.checkOut)) {
    errors.push('Invalid check-out time format')
  }

  if (record.totalHours !== undefined) {
    if (record.totalHours < 0 || record.totalHours > VALIDATION_RULES.attendance.maxHoursPerDay) {
      errors.push(`Total hours must be between 0 and ${VALIDATION_RULES.attendance.maxHoursPerDay}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Export Utilities
export const formatDataForExport = (
  records: AttendanceRecord[],
  format: 'csv' | 'excel' | 'pdf'
): any => {
  const exportData = records.map(record => ({
    'Employee Name': record.employeeName,
    'Department': record.department,
    'Date': formatDate(record.date),
    'Check In': formatTime(record.checkIn),
    'Check Out': formatTime(record.checkOut),
    'Total Hours': record.totalHours.toFixed(2),
    'Working Hours': record.workingHours.toFixed(2),
    'Status': record.status,
    'Notes': record.notes || ''
  }))

  switch (format) {
    case 'csv':
      return convertToCSV(exportData)
    case 'excel':
      return exportData // Would be processed by a library like xlsx
    case 'pdf':
      return exportData // Would be processed by a PDF library
    default:
      return exportData
  }
}

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n')

  return csvContent
}