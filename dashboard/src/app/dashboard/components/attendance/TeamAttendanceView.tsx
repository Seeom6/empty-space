'use client'

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, ChevronRight, Users, Calendar } from 'lucide-react'
import { AttendanceRecord } from './types'
import { mockAttendanceRecords } from './mockData'
import { MOCK_TEAM_MEMBERS, WEEK_DAYS } from './constants'
import { getStatusColor, getWeekDates, getWeekOptions } from './utils'
import { cn } from '@/lib/utils'

interface TeamAttendanceViewProps {
  managerId?: string
  userRole: string
}

export function TeamAttendanceView({ managerId = 'emp-2', userRole }: TeamAttendanceViewProps) {
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const weekDates = getWeekDates(selectedWeek)
  const weekOptions = getWeekOptions()

  const getTeamAttendance = () => {
    return MOCK_TEAM_MEMBERS.map((member: any) => {
      const memberRecords = mockAttendanceRecords.filter(record => 
        record.employeeId === member.id
      )

      const weekAttendance = weekDates.map(date => {
        const record = memberRecords.find(r => r.date === date)
        return { date, record }
      })

      const weekRecords = weekAttendance.map(day => day.record).filter(Boolean)
      const presentCount = weekRecords.filter(r => r?.status === 'Present').length
      const lateCount = weekRecords.filter(r => r?.status === 'Late').length
      const absentCount = weekRecords.filter(r => r?.status === 'Absent').length
      const totalHours = weekRecords.reduce((sum, r) => sum + (r?.totalHours || 0), 0)

      return {
        member,
        weekAttendance,
        summary: {
          present: presentCount,
          late: lateCount,
          absent: absentCount,
          total: presentCount + lateCount,
          totalHours,
          attendanceRate: weekDates.length > 0 ? ((presentCount + lateCount) / weekDates.length) * 100 : 0
        }
      }
    })
  }

  const teamAttendance = getTeamAttendance()

  const toggleRowExpansion = (employeeId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedRows(newExpanded)
  }

  const getTeamSummary = () => {
    const totalMembers = teamAttendance.length
    const avgAttendanceRate = teamAttendance.reduce((sum, emp) => 
      sum + emp.summary.attendanceRate, 0) / Math.max(1, totalMembers)
    const totalHours = teamAttendance.reduce((sum, emp) => sum + emp.summary.totalHours, 0)
    const totalLateCount = teamAttendance.reduce((sum, emp) => sum + emp.summary.late, 0)
    
    return {
      totalMembers,
      avgAttendanceRate,
      totalHours,
      totalLateCount
    }
  }

  const teamSummary = getTeamSummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Team Attendance</h2>
          <p className="text-muted-foreground mt-1">
            Monitor your team's attendance and working patterns
          </p>
        </div>
        <Select 
          value={selectedWeek.toString()} 
          onValueChange={(value) => setSelectedWeek(parseInt(value))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map(option => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamSummary.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {teamSummary.avgAttendanceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {teamSummary.totalHours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {teamSummary.totalLateCount}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Team View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-6 gap-4 pb-3 border-b">
              <div className="font-medium">Employee</div>
              {WEEK_DAYS.map((day: string) => (
                <div key={day} className="text-center font-medium text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Employee rows */}
            {teamAttendance.map(({ member, weekAttendance, summary }) => (
              <div key={member.id} className="border-b last:border-b-0">
                <div 
                  className="grid grid-cols-6 gap-4 py-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleRowExpansion(member.id)}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-muted-foreground">
                      {expandedRows.has(member.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.position}</div>
                    </div>
                  </div>

                  {weekAttendance.map(({ date, record }, index) => (
                    <div key={date} className="flex justify-center">
                      <div 
                        className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center",
                          getStatusColor(record?.status)
                        )}
                        title={record ? `${record.status} - ${record.checkIn || 'No check-in'}` : 'No data'}
                      >
                        {record?.status && (
                          <div className="text-xs text-white font-medium">
                            {record.status.charAt(0)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {expandedRows.has(member.id) && (
                  <div className="pl-12 pb-3 space-y-2 bg-muted/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Present: </span>
                        <span className="font-medium text-green-600">{summary.present}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Late: </span>
                        <span className="font-medium text-yellow-600">{summary.late}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Absent: </span>
                        <span className="font-medium text-red-600">{summary.absent}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Hours: </span>
                        <span className="font-medium">{summary.totalHours.toFixed(1)}h</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Attendance Rate: </span>
                      <Badge variant="outline" className="ml-1">
                        {summary.attendanceRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}