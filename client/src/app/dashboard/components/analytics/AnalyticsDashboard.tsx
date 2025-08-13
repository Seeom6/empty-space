'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Filter, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react'
import { ReportBuilder } from './ReportBuilder'
import { KPICard, FilterPanel, ChartContainer } from './components'
import { useAnalytics } from './hooks'
import { canViewModule, canPerformAction } from './utils'
import { KPI_CONFIGS } from './constants'

interface AnalyticsDashboardProps {
  userRole: string
}

export function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [showFilters, setShowFilters] = useState(false)

  const {
    kpiData,
    projectAnalytics,
    employeeAnalytics,
    payrollAnalytics,
    filters,
    isLoading,
    error,
    actions
  } = useAnalytics(userRole)

  // Check permissions
  const canViewOverview = canViewModule(userRole, 'overview')
  const canViewProjects = canViewModule(userRole, 'projects')
  const canViewEmployees = canViewModule(userRole, 'employees')
  const canViewPayroll = canViewModule(userRole, 'payroll')
  const canExportData = canPerformAction(userRole, 'canExportData')

  const handleClearFilters = () => {
    actions.setFilters({
      search: '',
      department: 'All Departments',
      module: 'all',
      status: 'all',
      dateRange: { from: undefined, to: undefined }
    })
  }

  const handleExportData = () => {
    actions.exportData({
      format: 'excel',
      includeCharts: true,
      includeRawData: true
    })
  }

  if (!canViewOverview && !canViewProjects && !canViewEmployees && !canViewPayroll) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to view analytics data.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights and reporting across all modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button
            variant="outline"
            onClick={actions.refreshData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {canExportData && (
            <Button
              onClick={handleExportData}
              disabled={isLoading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={actions.setFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {canViewOverview && <TabsTrigger value="overview">Overview</TabsTrigger>}
          {canViewProjects && <TabsTrigger value="projects">Projects</TabsTrigger>}
          {canViewEmployees && <TabsTrigger value="employees">Employees</TabsTrigger>}
          {canViewPayroll && <TabsTrigger value="payroll">Payroll</TabsTrigger>}
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        {canViewOverview && (
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <KPICard
                title="Total Projects"
                data={kpiData.totalProjects}
                icon="Target"
              />
              <KPICard
                title="Task Completion"
                data={kpiData.taskCompletion}
                icon="CheckCircle"
              />
              <KPICard
                title="Team Efficiency"
                data={kpiData.teamEfficiency}
                icon="TrendingUp"
              />
              <KPICard
                title="Attendance Rate"
                data={kpiData.attendance}
                icon="Users"
              />
              {canViewPayroll && (
                <KPICard
                  title="Total Payroll"
                  data={kpiData.payrollTotal}
                  icon="DollarSign"
                />
              )}
              <KPICard
                title="Avg Performance"
                data={kpiData.performance}
                icon="TrendingUp"
              />
            </div>

            {/* Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartContainer
                config={{
                  type: 'line',
                  title: 'Performance Trends',
                  description: 'Key metrics over time',
                  dataKey: 'value'
                }}
                data={[]}
              >
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Chart implementation would go here</p>
                </div>
              </ChartContainer>

              <ChartContainer
                config={{
                  type: 'pie',
                  title: 'Department Distribution',
                  description: 'Resource allocation by department',
                  dataKey: 'value'
                }}
                data={[]}
              >
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Chart implementation would go here</p>
                </div>
              </ChartContainer>
            </div>
          </TabsContent>
        )}

        {/* Projects Tab */}
        {canViewProjects && (
          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{projectAnalytics.totalProjects}</div>
                    <div className="text-sm text-muted-foreground">Total Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{projectAnalytics.activeProjects}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{projectAnalytics.completedProjects}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{projectAnalytics.overdueTasks}</div>
                    <div className="text-sm text-muted-foreground">Overdue Tasks</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Detailed project analytics charts would be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Employees Tab */}
        {canViewEmployees && (
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{employeeAnalytics.totalEmployees}</div>
                    <div className="text-sm text-muted-foreground">Total Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{employeeAnalytics.activeEmployees}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{employeeAnalytics.averagePerformance}%</div>
                    <div className="text-sm text-muted-foreground">Avg Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{employeeAnalytics.attendanceRate}%</div>
                    <div className="text-sm text-muted-foreground">Attendance Rate</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Detailed employee analytics charts would be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Payroll Tab */}
        {canViewPayroll && (
          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">${payrollAnalytics.totalPayroll.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Payroll</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">${payrollAnalytics.averageSalary.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Average Salary</div>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Detailed payroll analytics charts would be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportBuilder userRole={userRole} />
        </TabsContent>
      </Tabs>
    </div>
  )
}