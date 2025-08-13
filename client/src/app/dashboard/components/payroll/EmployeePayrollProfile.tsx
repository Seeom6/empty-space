'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react'
import { mockPayrollEntries } from './mockData'

interface EmployeePayrollProfileProps {
  employeeId: string
  selectedMonth?: string
  selectedYear?: number
  onBack: () => void
  userRole: string
}

export function EmployeePayrollProfile({ 
  employeeId, 
  selectedMonth = 'December', 
  selectedYear = 2024, 
  onBack, 
  userRole 
}: EmployeePayrollProfileProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(`${selectedMonth} ${selectedYear}`)

  // Get employee payroll history
  const employeePayrollHistory = mockPayrollEntries.filter(entry => 
    entry.employeeId === employeeId
  ).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year
    return b.month.localeCompare(a.month)
  })

  if (employeePayrollHistory.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2>No Payroll Data</h2>
            <p className="text-muted-foreground mt-2">
              No payroll information found for this employee.
            </p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payroll
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const employee = employeePayrollHistory[0]
  const currentEntry = employeePayrollHistory.find(entry => 
    `${entry.month} ${entry.year}` === selectedPeriod
  ) || employeePayrollHistory[0]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

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

  const calculateYearlyStats = () => {
    const currentYearEntries = employeePayrollHistory.filter(entry => entry.year === selectedYear)
    const totalGross = currentYearEntries.reduce((sum, entry) => sum + entry.grossSalary, 0)
    const totalNet = currentYearEntries.reduce((sum, entry) => sum + entry.netSalary, 0)
    const totalBonuses = currentYearEntries.reduce((sum, entry) => 
      sum + entry.bonuses.reduce((bonusSum, bonus) => bonusSum + bonus.amount, 0), 0
    )
    const totalDeductions = currentYearEntries.reduce((sum, entry) => 
      sum + entry.deductions.reduce((dedSum, ded) => dedSum + ded.amount, 0), 0
    )
    
    return {
      totalGross,
      totalNet,
      totalBonuses,
      totalDeductions,
      monthsCount: currentYearEntries.length
    }
  }

  const yearlyStats = calculateYearlyStats()

  const downloadPayslip = () => {
    // In a real app, this would generate and download a PDF payslip
    alert(`Downloading payslip for ${employee.employeeName} - ${currentEntry.month} ${currentEntry.year}`)
  }

  const canViewSalaryDetails = userRole === 'Admin' || userRole === 'HR' || 
    (userRole === 'Employee' && employeeId === 'current-user-id')

  if (!canViewSalaryDetails) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2>Access Restricted</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to view this employee's payroll information.
            </p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payroll
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Payroll
        </Button>
        <div className="flex gap-2">
          {currentEntry.payslipGenerated && (
            <Button onClick={downloadPayslip} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download Payslip
            </Button>
          )}
        </div>
      </div>

      {/* Employee Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {employee.employeeName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{employee.employeeName}</h1>
              <p className="text-lg text-muted-foreground">{employee.department}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">Employee ID: {employeeId}</Badge>
                {getStatusBadge(currentEntry.status)}
              </div>
            </div>
            <div className="text-right">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employeePayrollHistory.map(entry => (
                    <SelectItem key={entry.id} value={`${entry.month} ${entry.year}`}>
                      {entry.month} {entry.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Period</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Current Period Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Salary Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Salary</span>
                    <span className="font-medium">{formatCurrency(currentEntry.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Bonuses</span>
                    <span className="font-medium text-green-600">
                      +{formatCurrency(currentEntry.bonuses.reduce((sum, b) => sum + b.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Salary</span>
                    <span className="font-medium">{formatCurrency(currentEntry.grossSalary)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total Deductions</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(currentEntry.deductions.reduce((sum, d) => sum + d.amount, 0))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Net Salary</span>
                    <span className="font-bold text-primary">{formatCurrency(currentEntry.netSalary)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentEntry.bonuses.length > 0 ? (
                  <div className="space-y-3">
                    {currentEntry.bonuses.map(bonus => (
                      <div key={bonus.id} className="border-l-2 border-green-500 pl-3">
                        <div className="font-medium">{bonus.type}</div>
                        <div className="text-sm text-muted-foreground">{bonus.description}</div>
                        <div className="font-medium text-green-600">{formatCurrency(bonus.amount)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No bonuses this period</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentEntry.deductions.map(deduction => (
                    <div key={deduction.id} className="border-l-2 border-red-500 pl-3">
                      <div className="font-medium">{deduction.type}</div>
                      <div className="text-sm text-muted-foreground">{deduction.description}</div>
                      <div className="font-medium text-red-600">-{formatCurrency(deduction.amount)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pay Period</label>
                  <p className="mt-1">{currentEntry.month} {currentEntry.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Pay Date</label>
                  <p className="mt-1">{formatDate(currentEntry.payDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(currentEntry.status)}</div>
                </div>
              </div>
              {currentEntry.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1 text-sm">{currentEntry.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeePayrollHistory.map(entry => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{entry.month} {entry.year}</h4>
                        <p className="text-sm text-muted-foreground">
                          Paid on {formatDate(entry.payDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(entry.netSalary)}</div>
                        {getStatusBadge(entry.status)}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Base: </span>
                        <span>{formatCurrency(entry.baseSalary)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bonuses: </span>
                        <span className="text-green-600">
                          +{formatCurrency(entry.bonuses.reduce((sum, b) => sum + b.amount, 0))}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deductions: </span>
                        <span className="text-red-600">
                          -{formatCurrency(entry.deductions.reduce((sum, d) => sum + d.amount, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Gross Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(yearlyStats.totalGross)}</div>
                <p className="text-xs text-muted-foreground">Year {selectedYear}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Net Pay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(yearlyStats.totalNet)}</div>
                <p className="text-xs text-muted-foreground">After deductions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(yearlyStats.totalBonuses)}</div>
                <p className="text-xs text-muted-foreground">Year {selectedYear}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Deductions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(yearlyStats.totalDeductions)}</div>
                <p className="text-xs text-muted-foreground">Year {selectedYear}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}