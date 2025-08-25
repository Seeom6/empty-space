import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Clock, AlertTriangle, Users, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Project } from './ProjectManagement'

interface ProjectAnalyticsProps {
  projects: Project[]
  userRole: string
}

export function ProjectAnalytics({ projects, userRole }: ProjectAnalyticsProps) {
  // Calculate analytics data
  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const inProgressProjects = projects.filter(p => p.status === 'inprogress').length
  const overdueProjects = projects.filter(p => 
    new Date(p.deadline) < new Date() && p.status !== 'completed'
  ).length

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.actualSpent, 0)
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const averageProgress = projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
    : 0

  // Status distribution
  const statusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#3b82f6' },
    { name: 'In Progress', value: inProgressProjects, color: '#f59e0b' },
    { name: 'Completed', value: completedProjects, color: '#10b981' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'onhold').length, color: '#6b7280' }
  ].filter(item => item.value > 0)

  // Priority distribution
  const priorityData = [
    { name: 'Low', value: projects.filter(p => p.priority === 'low').length },
    { name: 'Medium', value: projects.filter(p => p.priority === 'medium').length },
    { name: 'High', value: projects.filter(p => p.priority === 'high').length },
    { name: 'Critical', value: projects.filter(p => p.priority === 'critical').length }
  ]

  // Budget vs Actual spending
  const budgetData = projects.slice(0, 6).map(project => ({
    name: project.name.substring(0, 15) + (project.name.length > 15 ? '...' : ''),
    budget: project.budget / 1000, // Convert to thousands
    spent: project.actualSpent / 1000,
    utilization: (project.actualSpent / project.budget) * 100
  }))

  // Top performing projects (by progress)
  const topProjects = [...projects]
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {completedProjects} completed ({((completedProjects / totalProjects) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalSpent)} of {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress.toFixed(1)}%</div>
            <Progress value={averageProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Projects</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueProjects}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent || 5 * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spending (Top 6 Projects)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis label={{ value: 'Amount (K)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(0)}K`, 
                    name === 'budget' ? 'Budget' : 'Spent'
                  ]}
                />
                <Bar dataKey="budget" fill="var(--color-chart-2)" name="budget" />
                <Bar dataKey="spent" fill="var(--color-chart-1)" name="spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Performing Projects</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProjects.map((project, index) => (
              <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.team.length} members
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{project.progress}%</div>
                    <Progress value={project.progress} className="w-20 h-2 mt-1" />
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatCurrency(project.actualSpent)} / {formatCurrency(project.budget)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}