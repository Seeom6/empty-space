'use client'

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { AttendanceRecord, CheckInOutStatus, AttendanceSummary } from './types'
import { mockAttendanceRecords } from './mockData'
import { cn } from '@/lib/utils'

interface EmployeeAttendanceDashboardProps {
  employeeId?: string
  employeeName?: string
}

export function EmployeeAttendanceDashboard({ 
  employeeId = 'emp-1', 
  employeeName = 'John Doe' 
}: EmployeeAttendanceDashboardProps) {
  const [checkInOutStatus, setCheckInOutStatus] = useState<CheckInOutStatus>({
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
  })

  const [_selectedDate, _setSelectedDate] = useState<Date>(new Date('2024-01-15')) // Fixed date for SSR consistency
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    // Load attendance records for this employee
    const employeeRecords = mockAttendanceRecords.filter(record => 
      record.employeeId === employeeId
    )
    setAttendanceRecords(employeeRecords)

    // Check today's status
    const today = '2024-01-15' // Fixed date for SSR consistency
    const todayRecord = employeeRecords.find(record => record.date === today)
    
    if (todayRecord && todayRecord.checkIn) {
      setCheckInOutStatus({
        isCheckedIn: !todayRecord.checkOut,
        checkInTime: todayRecord.checkIn,
        checkOutTime: todayRecord.checkOut,
        breakStart: todayRecord.breakStart || null,
        breakEnd: todayRecord.breakEnd || null,
        totalHoursToday: todayRecord.totalHours,
        workingHoursToday: todayRecord.workingHours,
        breakHoursToday: todayRecord.breakHours,
        status: todayRecord.checkOut ? 'Checked Out' : 'Checked In',
        lastAction: todayRecord.checkOut ? 'Check Out' : 'Check In',
        canCheckIn: !todayRecord.checkIn,
        canCheckOut: !!todayRecord.checkIn && !todayRecord.checkOut,
        canStartBreak: !!todayRecord.checkIn && !todayRecord.checkOut && !todayRecord.breakStart,
        canEndBreak: !!todayRecord.breakStart && !todayRecord.breakEnd
      })
    }
  }, [employeeId])

  const handleCheckIn = () => {
    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5)
    const today = now.toISOString().split('T')[0]

    setCheckInOutStatus({
      isCheckedIn: true,
      checkInTime: timeString,
      checkOutTime: null,
      breakStart: null,
      breakEnd: null,
      totalHoursToday: 0,
      workingHoursToday: 0,
      breakHoursToday: 0,
      status: 'Checked In',
      lastAction: 'Check In',
      canCheckIn: false,
      canCheckOut: true,
      canStartBreak: true,
      canEndBreak: false
    })

    // Update or create today's record
    const existingRecordIndex = attendanceRecords.findIndex(record => 
      record.date === today && record.employeeId === employeeId
    )

    if (existingRecordIndex >= 0) {
      const updatedRecords = [...attendanceRecords]
      updatedRecords[existingRecordIndex] = {
        ...updatedRecords[existingRecordIndex],
        checkIn: timeString,
        status: 'Present'
      }
      setAttendanceRecords(updatedRecords)
    } else {
      const newRecord: AttendanceRecord = {
        id: `att-${employeeId}-${today}`,
        employeeId,
        employeeName,
        employeeEmail: `${employeeName.toLowerCase().replace(' ', '.')}@company.com`,
        department: 'Engineering', // This should come from employee data
        position: 'Software Engineer',
        date: today,
        checkIn: timeString,
        checkOut: null,
        breakStart: null,
        breakEnd: null,
        totalHours: 0,
        workingHours: 0,
        breakHours: 0,
        overtimeHours: 0,
        status: 'Present',
        location: 'Office',
        ipAddress: '192.168.1.100',
        deviceInfo: 'Windows 10 - Chrome',
        isManualEntry: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setAttendanceRecords([...attendanceRecords, newRecord])
    }
  }

  const handleCheckOut = () => {
    const now = new Date()
    const timeString = now.toTimeString().slice(0, 5)
    const today = now.toISOString().split('T')[0]

    if (checkInOutStatus.checkInTime) {
      const [inHour, inMinute] = checkInOutStatus.checkInTime.split(':').map(Number)
      const [outHour, outMinute] = timeString.split(':').map(Number)
      const inMinutes = inHour * 60 + inMinute
      const outMinutes = outHour * 60 + outMinute
      const totalHours = (outMinutes - inMinutes) / 60

      setCheckInOutStatus({
        isCheckedIn: false,
        checkInTime: checkInOutStatus.checkInTime,
        checkOutTime: timeString,
        breakStart: checkInOutStatus.breakStart,
        breakEnd: checkInOutStatus.breakEnd,
        totalHoursToday: Math.round(totalHours * 10) / 10,
        workingHoursToday: Math.round(totalHours * 10) / 10,
        breakHoursToday: checkInOutStatus.breakHoursToday,
        status: 'Checked Out',
        lastAction: 'Check Out',
        canCheckIn: true,
        canCheckOut: false,
        canStartBreak: false,
        canEndBreak: false
      })

      // Update today's record
      const updatedRecords = attendanceRecords.map(record => {
        if (record.date === today && record.employeeId === employeeId) {
          return {
            ...record,
            checkOut: timeString,
            totalHours: Math.round(totalHours * 10) / 10
          }
        }
        return record
      })
      setAttendanceRecords(updatedRecords)
    }
  }

  // Calculate attendance summary
  const calculateAttendanceSummary = (): AttendanceSummary => {
    const last30Days = attendanceRecords.slice(-30)
    const presentDays = last30Days.filter(r => r.status === 'Present').length
    const lateDays = last30Days.filter(r => r.status === 'Late').length
    const absentDays = last30Days.filter(r => r.status === 'Absent').length
    const totalHours = last30Days.reduce((sum, r) => sum + r.totalHours, 0)

    return {
      totalDays: last30Days.length,
      workingDays: last30Days.length, // Simplified for now
      presentDays: presentDays + lateDays, // Late is still present
      lateDays,
      absentDays,
      sickLeaveDays: 0, // Would need to track this separately
      holidayDays: 0, // Would need to track this separately
      totalHours: Math.round(totalHours * 10) / 10,
      workingHours: Math.round(totalHours * 10) / 10,
      overtimeHours: 0, // Would need to calculate this
      averageHoursPerDay: Math.round((totalHours / Math.max(1, last30Days.length)) * 10) / 10,
      averageWorkingHoursPerDay: Math.round((totalHours / Math.max(1, last30Days.length)) * 10) / 10,
      onTimePercentage: Math.round((presentDays / Math.max(1, last30Days.length)) * 100),
      attendanceRate: Math.round(((presentDays + lateDays) / Math.max(1, last30Days.length)) * 100),
      punctualityScore: Math.round((presentDays / Math.max(1, presentDays + lateDays)) * 100)
    }
  }

  const summary = calculateAttendanceSummary()

  // Get weekly calendar data
  const getWeeklyCalendar = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Sunday

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      const record = attendanceRecords.find(r => r.date === dateString)
      
      weekDays.push({
        date,
        dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        record
      })
    }
    return weekDays
  }

  const weekDays = getWeeklyCalendar()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Late':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'Absent':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'Partial':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-200" />
    }
  }



  const getCurrentTimeString = () => {
    // For SSR consistency, return a fixed time during initial render
    if (typeof window === 'undefined') {
      return '09:00' // Fixed time for server-side rendering
    }
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2>My Attendance</h2>
        <p className="text-muted-foreground mt-1">
          Track your daily attendance and working hours
        </p>
      </div>

      {/* Check In/Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status Display */}
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">
                {getCurrentTimeString()}
              </div>
              <Badge 
                variant={checkInOutStatus.status === 'Checked In' ? 'default' : 'secondary'}
                className="text-sm px-4 py-2"
              >
                {checkInOutStatus.status}
              </Badge>
            </div>

            {/* Check In/Out Times */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check In:</span>
                <span className="font-medium">
                  {checkInOutStatus.checkInTime || '--:--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Check Out:</span>
                <span className="font-medium">
                  {checkInOutStatus.checkOutTime || '--:--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hours Today:</span>
                <span className="font-medium">
                  {checkInOutStatus.totalHoursToday.toFixed(1)}h
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {!checkInOutStatus.isCheckedIn ? (
                <Button 
                  onClick={handleCheckIn}
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <LogIn className="h-4 w-4" />
                  Check In
                </Button>
              ) : (
                <Button 
                  onClick={handleCheckOut}
                  variant="outline"
                  className="gap-2"
                  size="lg"
                >
                  <LogOut className="h-4 w-4" />
                  Check Out
                </Button>
              )}
              <p className="text-xs text-muted-foreground text-center">
                {checkInOutStatus.isCheckedIn ? 'You are currently checked in' : 'Click to start your work day'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const isToday = day.dateString === '2024-01-15' // Fixed date for SSR consistency
              return (
                <div key={index} className={cn(
                  "text-center p-3 rounded-lg border",
                  isToday && "bg-primary/5 border-primary"
                )}>
                  <div className="font-medium text-sm mb-1">{day.dayName}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {day.date.getDate()}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    {day.record ? (
                      <>
                        {getStatusIcon(day.record.status)}
                        <div className="text-xs">
                          {day.record.checkIn || '--'}
                        </div>
                        {day.record.totalHours > 0 && (
                          <div className="text-xs text-muted-foreground">
                            {day.record.totalHours.toFixed(1)}h
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full bg-gray-200" />
                        <div className="text-xs">--</div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Days Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.presentDays}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.lateDays}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Days Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.absentDays}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Hours/Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary.averageHoursPerDay.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Working days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}