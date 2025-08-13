import { AttendanceRecord } from './types'

// Seeded random function to ensure consistent results between server and client
class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
}

// Enhanced Mock Data Generation with deterministic results
const generateMockAttendanceData = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = []
  const employees = [
    { id: 'emp-1', name: 'John Doe', email: 'john.doe@company.com', department: 'Engineering', position: 'Senior Software Engineer' },
    { id: 'emp-2', name: 'Jane Smith', email: 'jane.smith@company.com', department: 'Design', position: 'Senior Designer' },
    { id: 'emp-3', name: 'Mike Johnson', email: 'mike.johnson@company.com', department: 'Marketing', position: 'Marketing Manager' },
    { id: 'emp-4', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', department: 'Sales', position: 'Sales Representative' },
    { id: 'emp-5', name: 'David Brown', email: 'david.brown@company.com', department: 'HR', position: 'HR Specialist' },
    { id: 'emp-6', name: 'Lisa Garcia', email: 'lisa.garcia@company.com', department: 'Finance', position: 'Financial Analyst' },
    { id: 'emp-7', name: 'Alex Chen', email: 'alex.chen@company.com', department: 'Engineering', position: 'Software Engineer' },
    { id: 'emp-8', name: 'Emily Davis', email: 'emily.davis@company.com', department: 'Design', position: 'UX Designer' }
  ]

  // Create seeded random generator for consistent results
  const rng = new SeededRandom(12345) // Fixed seed for consistency

  // Generate data for last 30 days using fixed dates for SSR consistency
  const baseDate = new Date('2024-01-15') // Fixed base date
  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() - i)
    const dateString = date.toISOString().split('T')[0]

    // Skip weekends for most employees
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    if (isWeekend && rng.next() > 0.1) {
      continue
    }

    employees.forEach((employee, empIndex) => {
      // Create employee-specific seed for consistency
      const empRng = new SeededRandom(12345 + empIndex * 1000 + i)

      // 90% chance of being present/late, 10% absent
      const attendanceRoll = empRng.next()

      if (attendanceRoll < 0.9) {
        // Present or Late
        const isLate = empRng.next() < 0.15 // 15% chance of being late

        // Generate realistic times
        const baseCheckIn = isLate ? 9 + empRng.next() * 1.5 : 8.5 + empRng.next() * 1
        const workDuration = 8 + empRng.next() * 2 // 8-10 hours

        const checkInHour = Math.floor(baseCheckIn)
        const checkInMinute = Math.floor((baseCheckIn % 1) * 60)
        const checkIn = `${checkInHour.toString().padStart(2, '0')}:${checkInMinute.toString().padStart(2, '0')}`

        const checkOutTime = baseCheckIn + workDuration
        const checkOutHour = Math.floor(checkOutTime)
        const checkOutMinute = Math.floor((checkOutTime % 1) * 60)
        const checkOut = `${checkOutHour.toString().padStart(2, '0')}:${checkOutMinute.toString().padStart(2, '0')}`

        const totalHours = workDuration
        const workingHours = workDuration
        const overtimeHours = Math.max(0, workingHours - 8)

        records.push({
          id: `att-${employee.id}-${dateString}`,
          employeeId: employee.id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          department: employee.department,
          position: employee.position,
          date: dateString,
          checkIn,
          checkOut,
          breakStart: null,
          breakEnd: null,
          totalHours: Math.round(totalHours * 100) / 100,
          workingHours: Math.round(workingHours * 100) / 100,
          breakHours: 0,
          overtimeHours: Math.round(overtimeHours * 100) / 100,
          status: isLate ? 'Late' : 'Present',
          notes: isLate ? 'Traffic delay' : undefined,
          location: empRng.next() < 0.2 ? 'Remote' : 'Office',
          ipAddress: `192.168.${Math.floor(empRng.next() * 255)}.${Math.floor(empRng.next() * 255)}`,
          deviceInfo: 'Windows 10 - Chrome',
          isManualEntry: false,
          createdAt: new Date(dateString).toISOString(),
          updatedAt: new Date(dateString).toISOString()
        })
      } else {
        // Absent
        records.push({
          id: `att-${employee.id}-${dateString}`,
          employeeId: employee.id,
          employeeName: employee.name,
          employeeEmail: employee.email,
          department: employee.department,
          position: employee.position,
          date: dateString,
          checkIn: null,
          checkOut: null,
          breakStart: null,
          breakEnd: null,
          totalHours: 0,
          workingHours: 0,
          breakHours: 0,
          overtimeHours: 0,
          status: 'Absent',
          notes: 'Sick leave',
          location: 'Office',
          ipAddress: `192.168.${Math.floor(empRng.next() * 255)}.${Math.floor(empRng.next() * 255)}`,
          deviceInfo: 'Windows 10 - Chrome',
          isManualEntry: false,
          createdAt: new Date(dateString).toISOString(),
          updatedAt: new Date(dateString).toISOString()
        })
      }
    })
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const mockAttendanceRecords = generateMockAttendanceData()

// Helper function to get filtered data based on user role
export const getMockDataForRole = (userRole: string) => {
  const canViewAll = userRole === 'Admin' || userRole === 'HR'

  if (canViewAll) {
    return {
      records: mockAttendanceRecords
    }
  }

  // Employee view - only their own records
  const employeeRecords = mockAttendanceRecords.filter(r => r.employeeId === 'emp-1')
  return {
    records: employeeRecords
  }
}