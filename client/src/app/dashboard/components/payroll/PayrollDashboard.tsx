import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Download,
  Search,
  Filter,
  Plus,
  FileText,
  AlertTriangle
} from 'lucide-react'
import { PayrollEntry, PayrollFilters } from './types'
import { mockPayrollEntries } from './mockData'
import { DEPARTMENTS } from './constants'

interface PayrollDashboardProps {
  onSelectEmployee: (employeeId: string, month: string, year: number) => void
  onCreatePayroll: () => void
  onEditPayroll: (entry: PayrollEntry) => void
  userRole: string
}

export function PayrollDashboard({ 
  onSelectEmployee, 
  onCreatePayroll, 
  onEditPayroll, 
  userRole 
}: PayrollDashboardProps) {
  const [filters, setFilters] = useState<PayrollFilters>({
    search: '',
    month: 'December',
    year: '2024',
    department: 'all',
    status: 'all',
    dateRange: 'all',
    salaryRange: { min: 0, max: Infinity }
  })

  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  // Filter payroll entries
  const filteredEntries = mockPayrollEntries.filter(entry => {
    const matchesMonth = filters.month === 'all' || entry.month === filters.month
    const matchesYear = filters.year === 'all' || entry.year.toString() === filters.year
    const matchesDepartment = filters.department === 'all' || entry.department === filters.department
    const matchesStatus = filters.status === 'all' || entry.status === filters.status
    const matchesSearch = !filters.search ||
      entry.employeeName.toLowerCase().includes(filters.search.toLowerCase()) ||
      entry.department.toLowerCase().includes(filters.search.toLowerCase())

    return matchesMonth && matchesYear && matchesDepartment && matchesStatus && matchesSearch
  }).sort((a, b) => {
    // Sort by year and month, then by employee name
    if (a.year !== b.year) return b.year - a.year
    if (a.month !== b.month) return b.month.localeCompare(a.month)
    return a.employeeName.localeCompare(b.employeeName)
  })

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + recordsPerPage)

  // Calculate summary stats
  const calculateSummaryStats = () => {
    const currentMonthEntries = mockPayrollEntries.filter(entry => 
      entry.month === 'December' && entry.year === 2024
    )
    
    const totalMonthlyPayroll = currentMonthEntries.reduce((sum, entry) => sum + entry.netSalary, 0)
    const totalBonuses = currentMonthEntries.reduce((sum, entry) => 
      sum + entry.bonuses.reduce((bonusSum, bonus) => bonusSum + bonus.amount, 0), 0
    )
    const totalDeductions = currentMonthEntries.reduce((sum, entry) => 
      sum + entry.deductions.reduce((dedSum, ded) => dedSum + ded.amount, 0), 0
    )
    const pendingPayments = currentMonthEntries.filter(entry => entry.status === 'Pending').length
    
    return {
      totalMonthlyPayroll,
      totalBonuses,
      totalDeductions,
      employeeCount: currentMonthEntries.length,
      pendingPayments
    }
  }

  const summaryStats = calculateSummaryStats()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Paid</Badge>
      case 'Pending':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>
      case 'Processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Processing</Badge>
      case 'Failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }



  const exportToCSV = () => {
    const headers = ['Employee Name', 'Department', 'Month/Year', 'Base Salary', 'Bonuses', 'Deductions', 'Net Salary', 'Status', 'Pay Date']
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        `"${entry.employeeName}"`,
        entry.department,
        `"${entry.month} ${entry.year}"`,
        entry.baseSalary,
        entry.bonuses.reduce((sum, b) => sum + b.amount, 0),
        entry.deductions.reduce((sum, d) => sum + d.amount, 0),
        entry.netSalary,
        entry.status,
        entry.payDate
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll_report_${filters.month}_${filters.year}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const canManagePayroll = userRole === 'Admin' || userRole === 'HR'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Payroll Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage employee salaries, bonuses, and deductions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {canManagePayroll && (
            <Button onClick={onCreatePayroll} className="gap-2">
              <Plus className="h-4 w-4" />
              Process Payroll
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summaryStats.totalMonthlyPayroll)}</div>
            <p className="text-xs text-muted-foreground">
              December 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bonuses Issued</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summaryStats.totalBonuses)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summaryStats.totalDeductions)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summaryStats.pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
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
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
              <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value="December">December</SelectItem>
                  <SelectItem value="November">November</SelectItem>
                  <SelectItem value="October">October</SelectItem>
                  <SelectItem value="September">September</SelectItem>
                  <SelectItem value="August">August</SelectItem>
                  <SelectItem value="July">July</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.department} onValueChange={(value) => setFilters({ ...filters, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept: string) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Bonuses</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEntries.map(entry => {
                  const totalBonuses = entry.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0)
                  const totalDeductions = entry.deductions.reduce((sum, deduction) => sum + deduction.amount, 0)
                  
                  return (
                    <TableRow 
                      key={entry.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectEmployee(entry.employeeId, entry.month, entry.year)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {entry.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{entry.employeeName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{entry.department}</TableCell>
                      <TableCell>{entry.month} {entry.year}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(entry.baseSalary)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(totalBonuses)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(totalDeductions)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(entry.netSalary)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.payslipGenerated && (
                            <Button size="sm" variant="outline" className="gap-1">
                              <FileText className="h-3 w-3" />
                              Payslip
                            </Button>
                          )}
                          {canManagePayroll && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditPayroll(entry)
                              }}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {paginatedEntries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No payroll entries found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
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