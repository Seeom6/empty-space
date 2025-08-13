'use client'

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Search, Download, Filter, Clock, Users, TrendingUp } from 'lucide-react'
import { AttendanceRecord, AttendanceFilters } from './types'
import { mockAttendanceRecords, getMockDataForRole } from './mockData'
import { DEPARTMENTS } from './constants'
import { getStatusBadge, formatDate, formatTime } from './utils'

interface AttendanceOverviewProps {
  userRole: string
}

export function AttendanceOverview({ userRole }: AttendanceOverviewProps) {
  // Use a fixed date for SSR consistency
  const getDefaultDateRange = () => {
    const today = '2024-01-15' // Fixed date for SSR consistency
    const thirtyDaysAgo = '2023-12-16' // 30 days before fixed date
    return { today, thirtyDaysAgo }
  }

  const { today, thirtyDaysAgo } = getDefaultDateRange()

  const [filters, setFilters] = useState<AttendanceFilters>({
    dateFrom: thirtyDaysAgo,
    dateTo: today,
    department: 'all',
    status: 'all',
    employeeName: '',
    viewMode: 'daily',
    includeWeekends: false,
    includeHolidays: true
  })

  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  // Filter attendance records
  const filteredRecords = mockAttendanceRecords.filter(record => {
    const recordDate = new Date(record.date)
    const fromDate = new Date(filters.dateFrom)
    const toDate = new Date(filters.dateTo)
    
    const matchesDateRange = recordDate >= fromDate && recordDate <= toDate
    const matchesDepartment = filters.department === 'all' || record.department === filters.department
    const matchesStatus = filters.status === 'all' || record.status === filters.status
    const matchesEmployeeName = !filters.employeeName || 
      record.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())

    return matchesDateRange && matchesDepartment && matchesStatus && matchesEmployeeName
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + recordsPerPage)

  // Calculate overview stats
  const calculateOverviewStats = () => {
    const totalRecords = filteredRecords.length
    const presentCount = filteredRecords.filter(r => r.status === 'Present').length
    const lateCount = filteredRecords.filter(r => r.status === 'Late').length
    const absentCount = filteredRecords.filter(r => r.status === 'Absent').length
    const partialCount = filteredRecords.filter(r => r.status === 'Partial').length
    
    const totalHours = filteredRecords.reduce((sum, r) => sum + r.totalHours, 0)
    const avgHours = totalHours / Math.max(1, presentCount + lateCount + partialCount)
    
    const onTimePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0

    return {
      totalRecords,
      presentCount,
      lateCount,
      absentCount,
      partialCount,
      totalHours,
      avgHours,
      onTimePercentage
    }
  }

  const stats = calculateOverviewStats()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Present</Badge>
      case 'Late':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Late</Badge>
      case 'Absent':
        return <Badge variant="destructive">Absent</Badge>
      case 'Partial':
        return <Badge variant="default" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Partial</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--'
    return timeString
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Employee Name', 'Department', 'Check In', 'Check Out', 'Total Hours', 'Status', 'Notes']
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        record.date,
        `"${record.employeeName}"`,
        record.department,
        record.checkIn || '',
        record.checkOut || '',
        record.totalHours,
        record.status,
        `"${record.notes || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_report_${filters.dateFrom}_to_${filters.dateTo}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Attendance Overview</h2>
          <p className="text-muted-foreground mt-1">
            Monitor and manage employee attendance records
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.onTimePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Present on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lateCount}</div>
            <p className="text-xs text-muted-foreground">
              In selected period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Hours/Day</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.avgHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Working days only
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by employee name..."
                value={filters.employeeName}
                onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select value={filters.department} onValueChange={(value) => setFilters({ ...filters, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map((dept: string) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.employeeName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.department}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatTime(record.checkIn)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatTime(record.checkOut)}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {record.totalHours > 0 ? `${record.totalHours}h` : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {record.notes || '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {paginatedRecords.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No attendance records found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}