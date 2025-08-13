import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { mockAttendanceRecords } from './mockData'

export function AttendanceWidgets() {
  // Calculate attendance statistics
  const calculateStats = () => {
    // Use fixed date range for SSR consistency
    const thirtyDaysAgo = '2023-12-16' // Fixed date for consistency
    const last30DaysRecords = mockAttendanceRecords.filter(record => {
      return record.date >= thirtyDaysAgo
    })

    const totalRecords = last30DaysRecords.length
    const presentCount = last30DaysRecords.filter(r => r.status === 'Present').length
    const lateCount = last30DaysRecords.filter(r => r.status === 'Late').length
    const absentCount = last30DaysRecords.filter(r => r.status === 'Absent').length
    const onTimePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0

    // Top 5 employees by working hours
    const employeeHours = last30DaysRecords.reduce((acc, record) => {
      if (!acc[record.employeeName]) {
        acc[record.employeeName] = 0
      }
      acc[record.employeeName] += record.totalHours
      return acc
    }, {} as Record<string, number>)

    const topEmployees = Object.entries(employeeHours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, hours]) => ({ name, hours }))

    return {
      totalRecords,
      presentCount,
      lateCount,
      absentCount,
      onTimePercentage,
      topEmployees
    }
  }

  const stats = calculateStats()

  // Attendance distribution data
  const attendanceData = [
    { name: 'On Time', value: stats.presentCount, color: '#10B981' },
    { name: 'Late', value: stats.lateCount, color: '#F59E0B' },
    { name: 'Absent', value: stats.absentCount, color: '#EF4444' }
  ].filter(item => item.value > 0)

  // Weekly attendance trend (mock data)
  const weeklyTrend = [
    { week: 'Week 1', attendance: 92 },
    { week: 'Week 2', attendance: 88 },
    { week: 'Week 3', attendance: 94 },
    { week: 'Week 4', attendance: 90 }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* On-Time Attendance Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.onTimePercentage.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      {/* Late Arrivals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.lateCount}</div>
          <p className="text-xs text-muted-foreground">
            This week
          </p>
        </CardContent>
      </Card>

      {/* Total Working Hours */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {mockAttendanceRecords.reduce((sum, r) => sum + r.totalHours, 0).toFixed(0)}h
          </div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      {/* Active Employees */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {new Set(mockAttendanceRecords.filter(r =>
              r.date === '2024-01-15' && r.status !== 'Absent' // Fixed date for SSR consistency
            ).map(r => r.employeeId)).size}
          </div>
          <p className="text-xs text-muted-foreground">
            Checked in today
          </p>
        </CardContent>
      </Card>

      {/* Attendance Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Attendance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              {attendanceData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                  <Badge variant="outline">{entry.value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Attendance Trend */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Weekly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[80, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
              <Line type="monotone" dataKey="attendance" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Employees by Hours */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top Employees by Working Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topEmployees.map((employee, index) => (
              <div key={employee.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <Badge variant="secondary">{employee.hours.toFixed(1)}h</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}