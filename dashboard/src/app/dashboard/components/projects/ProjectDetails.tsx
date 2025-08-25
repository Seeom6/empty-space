import { useState } from 'react'
import { X, Edit, Calendar, DollarSign, Users, Target, TrendingUp, Clock, MessageCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Project } from './ProjectManagement'

interface ProjectDetailsProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onUpdateProject: (updates: Partial<Project>) => void
  users: Array<{ id: string; name: string; avatar: string }>
  technologies: string[]
  userRole: string
  canEdit: boolean
}

// Mock timeline data for Gantt-style visualization
const mockTimelineData = [
  { name: 'Week 1', planned: 10, actual: 8 },
  { name: 'Week 2', planned: 25, actual: 22 },
  { name: 'Week 3', planned: 40, actual: 35 },
  { name: 'Week 4', planned: 55, actual: 50 },
  { name: 'Week 5', planned: 70, actual: 65 },
  { name: 'Week 6', planned: 85, actual: 65 },
  { name: 'Week 7', planned: 100, actual: 65 }
]

// Mock tasks data
const mockTasks = [
  { id: '1', title: 'Project Setup & Planning', status: 'completed', assignee: 'Alice Johnson', progress: 100 },
  { id: '2', title: 'UI/UX Design', status: 'completed', assignee: 'Carol Davis', progress: 100 },
  { id: '3', title: 'Frontend Development', status: 'inprogress', assignee: 'Bob Smith', progress: 75 },
  { id: '4', title: 'Backend API Development', status: 'inprogress', assignee: 'Bob Smith', progress: 60 },
  { id: '5', title: 'Testing & QA', status: 'todo', assignee: 'David Wilson', progress: 0 },
  { id: '6', title: 'Deployment', status: 'todo', assignee: 'David Wilson', progress: 0 }
]

const statusColors = {
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  inprogress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  onhold: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

export function ProjectDetails({
  project,
  isOpen,
  onClose,
  onEdit,
  onUpdateProject,
  users,
  technologies,
  userRole,
  canEdit
}: ProjectDetailsProps) {
  const [newComment, setNewComment] = useState('')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed'
  const budgetUtilization = (project.actualSpent / project.budget) * 100
  const daysRemaining = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))

  const addComment = () => {
    if (newComment.trim()) {
      // In a real app, this would add to the project activity log
      setNewComment('')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <SheetTitle className="text-left line-clamp-2">{project.name}</SheetTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={`text-xs ${statusColors[project.status]}`}>
                  {project.status === 'inprogress' ? 'In Progress' : 
                   project.status === 'onhold' ? 'On Hold' : 
                   project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                <Badge variant="outline" className={`text-xs ${priorityColors[project.priority]}`}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    {Math.abs(daysRemaining)} days overdue
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="py-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Progress</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{project.progress}%</div>
                    <Progress value={project.progress} className="mt-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Team Size</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{project.team.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Days Left</span>
                  </div>
                  <div className={`text-2xl font-bold mt-2 ${daysRemaining < 0 ? 'text-destructive' : ''}`}>
                    {Math.abs(daysRemaining)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Budget Used</span>
                  </div>
                  <div className="text-2xl font-bold mt-2">{budgetUtilization.toFixed(0)}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{project.description}</p>
              </CardContent>
            </Card>

            {/* Technologies and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map(tech => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Start Date</span>
                    <span className="font-medium">{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">End Date</span>
                    <span className="font-medium">{formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Deadline</span>
                    <span className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {formatDate(project.deadline)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members ({project.team.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.team.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant={member.id === project.manager.id ? 'default' : 'secondary'}>
                        {member.id === project.manager.id ? 'Manager' : 'Member'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge variant={
                            task.status === 'completed' ? 'default' : 
                            task.status === 'inprogress' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {task.status === 'inprogress' ? 'In Progress' : 
                             task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{task.assignee}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">{task.progress}%</div>
                          <Progress value={task.progress} className="w-20 h-2 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value: number, name: string) => [`${value}%`, name === 'planned' ? 'Planned' : 'Actual']} />
                      <Line type="monotone" dataKey="planned" stroke="var(--color-chart-2)" strokeDasharray="5 5" name="planned" />
                      <Line type="monotone" dataKey="actual" stroke="var(--color-chart-1)" strokeWidth={2} name="actual" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-bold text-lg">{formatCurrency(project.budget, project.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount Spent</span>
                    <span className="font-medium">{formatCurrency(project.actualSpent, project.currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className={`font-medium ${project.actualSpent > project.budget ? 'text-destructive' : 'text-green-600'}`}>
                      {formatCurrency(project.budget - project.actualSpent, project.currency)}
                    </span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget Utilization</span>
                      <span className={budgetUtilization > 100 ? 'text-destructive font-medium' : ''}>
                        {budgetUtilization.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(budgetUtilization, 100)} 
                      className={budgetUtilization > 100 ? 'bg-destructive/20' : ''}
                    />
                    {budgetUtilization > 100 && (
                      <p className="text-xs text-destructive">⚠️ Over budget by {(budgetUtilization - 100).toFixed(1)}%</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Budget Efficiency</p>
                        <p className="text-sm text-muted-foreground">
                          {project.progress > 0 ? (budgetUtilization / project.progress).toFixed(2) : 'N/A'} cost per % progress
                        </p>
                      </div>
                      <TrendingUp className={`h-5 w-5 ${(budgetUtilization / project.progress) < 1 ? 'text-green-600' : 'text-orange-600'}`} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Projected Final Cost</span>
                        <span className="font-medium">
                          {formatCurrency(
                            project.progress > 0 ? (project.actualSpent / project.progress) * 100 : project.budget, 
                            project.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Projected Variance</span>
                        <span className={`font-medium ${
                          project.progress > 0 && ((project.actualSpent / project.progress) * 100) > project.budget 
                            ? 'text-destructive' : 'text-green-600'
                        }`}>
                          {project.progress > 0 
                            ? formatCurrency(((project.actualSpent / project.progress) * 100) - project.budget, project.currency)
                            : formatCurrency(0, project.currency)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Comments Section */}
        <Separator className="my-6" />
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Project Comments</span>
          </h3>
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment about this project..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}