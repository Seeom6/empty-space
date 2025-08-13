import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react'
import { Employee } from './types'

interface EmployeeWidgetsProps {
  employees: Employee[]
}

export function EmployeeWidgets({ employees }: EmployeeWidgetsProps) {
  // Calculate total employees
  const totalEmployees = employees.length
  const activeEmployees = employees.filter(emp => emp.status === 'Active').length
  const inactiveEmployees = employees.filter(emp => emp.status === 'Inactive').length

  // Status distribution
  const statusData = [
    { name: 'Active', value: employees.filter(emp => emp.status === 'Active').length, color: '#10B981' },
    { name: 'Inactive', value: employees.filter(emp => emp.status === 'Inactive').length, color: '#6B7280' },
    { name: 'Terminated', value: employees.filter(emp => emp.status === 'Terminated').length, color: '#EF4444' }
  ].filter(item => item.value > 0)

  // Department distribution
  const departmentCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const departmentData = Object.entries(departmentCounts).map(([department, count]) => ({
    department,
    count
  })).sort((a, b) => b.count - a.count)

  // Hiring trends (mock data for last 6 months)
  const hiringTrends = [
    { month: 'Jul', hires: 3 },
    { month: 'Aug', hires: 5 },
    { month: 'Sep', hires: 2 },
    { month: 'Oct', hires: 7 },
    { month: 'Nov', hires: 4 },
    { month: 'Dec', hires: 6 }
  ]

  // Employment type distribution
  const employmentTypeData = [
    { name: 'Full-Time', value: employees.filter(emp => emp.employmentType === 'Full-Time').length, color: '#3B82F6' },
    { name: 'Part-Time', value: employees.filter(emp => emp.employmentType === 'Part-Time').length, color: '#8B5CF6' },
    { name: 'Contract', value: employees.filter(emp => emp.employmentType === 'Contract').length, color: '#F59E0B' }
  ].filter(item => item.value > 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Employees Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalEmployees}</div>
          <p className="text-xs text-muted-foreground">
            Across all departments
          </p>
        </CardContent>
      </Card>

      {/* Active Employees Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
          <p className="text-xs text-muted-foreground">
            {totalEmployees > 0 ? ((activeEmployees / totalEmployees) * 100).toFixed(1) : 0}% of total
          </p>
        </CardContent>
      </Card>

      {/* Inactive Employees Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Employees</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{inactiveEmployees}</div>
          <p className="text-xs text-muted-foreground">
            {totalEmployees > 0 ? ((inactiveEmployees / totalEmployees) * 100).toFixed(1) : 0}% of total
          </p>
        </CardContent>
      </Card>

      {/* New Hires This Month */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Hires This Month</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">6</div>
          <p className="text-xs text-muted-foreground">
            +2 from last month
          </p>
        </CardContent>
      </Card>

      {/* Employee Status Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Employee Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              {statusData.map((entry, index) => (
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

      {/* Department Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Employees by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hiring Trends */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Hiring Trends (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hiringTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="hires" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employment Type Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Employment Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={employmentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {employmentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              {employmentTypeData.map((entry, index) => (
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
    </div>
  )
}