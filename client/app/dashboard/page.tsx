'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Users,
  FolderOpen,
  CheckSquare,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// Mock data - in real app, this would come from API
const dashboardData = {
  employees: {
    total: 156,
    active: 142,
    inactive: 14,
    change: 8.2,
  },
  projects: {
    total: 24,
    planning: 3,
    inProgress: 15,
    completed: 6,
    change: 12.5,
  },
  tasks: {
    total: 342,
    completed: 198,
    inProgress: 89,
    blocked: 12,
    completionRate: 57.9,
  },
  attendance: {
    present: 138,
    late: 4,
    absent: 14,
    onTimeRate: 97.2,
  },
  payroll: {
    totalSalaries: 2450000,
    bonuses: 125000,
    deductions: 89000,
    change: 5.3,
  },
  performance: {
    averageScore: 4.2,
    topPerformers: 23,
    needsImprovement: 8,
    change: 0.3,
  },
}

const quickActions = [
  { title: 'Add Employee', href: '/employees/new', icon: Users },
  { title: 'Create Project', href: '/projects/new', icon: FolderOpen },
  { title: 'New Task', href: '/tasks/new', icon: CheckSquare },
  { title: 'Generate Report', href: '/analytics/reports', icon: TrendingUp },
]

const upcomingDeadlines = [
  {
    id: '1',
    title: 'Project Alpha - Phase 2',
    dueDate: '2024-01-15',
    priority: 'high',
    assignee: 'John Doe',
  },
  {
    id: '2',
    title: 'Q4 Performance Reviews',
    dueDate: '2024-01-20',
    priority: 'medium',
    assignee: 'HR Team',
  },
  {
    id: '3',
    title: 'Budget Planning Meeting',
    dueDate: '2024-01-18',
    priority: 'high',
    assignee: 'Finance Team',
  },
]

function StatCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  color = 'blue',
}: {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  icon: React.ComponentType<{ className?: string }>
  color?: string
}) {
  const isPositive = change && change > 0
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    yellow: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20',
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {change !== undefined && (
          <div className="flex items-center mt-4">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
            <span
              className={`text-sm font-medium ml-1 ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-muted-foreground ml-1">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-7">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your organization today.
          </p>
        </div>
        <div className="flex space-x-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button key={action.title} variant="outline" size="sm">
                <Icon className="h-4 w-4 mr-2" />
                {action.title}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Employees"
          value={dashboardData.employees.total}
          subtitle={`${dashboardData.employees.active} active, ${dashboardData.employees.inactive} inactive`}
          change={dashboardData.employees.change}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={dashboardData.projects.total}
          subtitle={`${dashboardData.projects.inProgress} in progress, ${dashboardData.projects.completed} completed`}
          change={dashboardData.projects.change}
          icon={FolderOpen}
          color="green"
        />
        <StatCard
          title="Task Completion"
          value={`${dashboardData.tasks.completionRate}%`}
          subtitle={`${dashboardData.tasks.completed} of ${dashboardData.tasks.total} tasks`}
          icon={CheckSquare}
          color="purple"
        />
        <StatCard
          title="Attendance Today"
          value={`${dashboardData.attendance.onTimeRate}%`}
          subtitle={`${dashboardData.attendance.present} present, ${dashboardData.attendance.late} late`}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Monthly Payroll"
          value={`$${(dashboardData.payroll.totalSalaries / 1000).toFixed(0)}K`}
          subtitle={`+$${(dashboardData.payroll.bonuses / 1000).toFixed(0)}K bonuses`}
          change={dashboardData.payroll.change}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Avg Performance"
          value={dashboardData.performance.averageScore}
          subtitle={`${dashboardData.performance.topPerformers} top performers`}
          change={dashboardData.performance.change}
          icon={TrendingUp}
          color="blue"
        />

      {/* Charts and Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>
              Current status of all active projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Project Alpha</span>
                <span>75%</span>
              </div>
              <Progress value={75} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Project Beta</span>
                <span>45%</span>
              </div>
              <Progress value={45} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Project Gamma</span>
                <span>90%</span>
              </div>
              <Progress value={90} />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              Important tasks and milestones due soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div
                  key={deadline.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle
                      className={`h-5 w-5 ${
                        deadline.priority === 'high'
                          ? 'text-red-500'
                          : 'text-yellow-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-sm">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned to {deadline.assignee}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        deadline.priority === 'high' ? 'destructive' : 'secondary'
                      }
                    >
                      {deadline.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deadline.dueDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}