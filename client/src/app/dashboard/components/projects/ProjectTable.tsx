import { useState } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Eye, Edit, Trash2, Calendar, DollarSign, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Project } from './ProjectManagement'

interface ProjectTableProps {
  projects: Project[]
  onProjectClick: (project: Project) => void
  onEditProject: (project: Project) => void
  onDeleteProject: (projectId: string) => void
  userRole: string
  canEdit: (project: Project) => boolean
  canDelete: (project: Project) => boolean
}

type SortField = 'name' | 'status' | 'priority' | 'progress' | 'deadline' | 'budget' | 'manager'
type SortDirection = 'asc' | 'desc' | null

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

const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }

export function ProjectTable({
  projects,
  onProjectClick,
  onEditProject,
  onDeleteProject,
  userRole,
  canEdit,
  canDelete
}: ProjectTableProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedProjects = [...projects].sort((a, b) => {
    if (!sortDirection || !sortField) return 0

    let aValue: any
    let bValue: any

    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'priority':
        aValue = priorityOrder[a.priority]
        bValue = priorityOrder[b.priority]
        break
      case 'progress':
        aValue = a.progress
        bValue = b.progress
        break
      case 'deadline':
        aValue = new Date(a.deadline)
        bValue = new Date(b.deadline)
        break
      case 'budget':
        aValue = a.budget
        bValue = b.budget
        break
      case 'manager':
        aValue = a.manager.name.toLowerCase()
        bValue = b.manager.name.toLowerCase()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />
    return <ArrowUpDown className="h-4 w-4" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const isOverdue = (dateString: string, status: string) => {
    return new Date(dateString) < new Date() && status !== 'completed'
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-medium"
              >
                Project Name
                <SortIcon field="name" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('status')}
                className="h-auto p-0 font-medium"
              >
                Status
                <SortIcon field="status" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('priority')}
                className="h-auto p-0 font-medium"
              >
                Priority
                <SortIcon field="priority" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('progress')}
                className="h-auto p-0 font-medium"
              >
                Progress
                <SortIcon field="progress" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('manager')}
                className="h-auto p-0 font-medium"
              >
                Manager
                <SortIcon field="manager" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('deadline')}
                className="h-auto p-0 font-medium"
              >
                Deadline
                <SortIcon field="deadline" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('budget')}
                className="h-auto p-0 font-medium"
              >
                Budget
                <SortIcon field="budget" />
              </Button>
            </TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.map((project) => (
            <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onProjectClick(project)}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium line-clamp-1">{project.name}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 2).map(tech => (
                        <Badge key={tech} variant="secondary" className="text-xs px-1 py-0">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 2 && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          +{project.technologies.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`text-xs ${statusColors[project.status]}`}>
                  {project.status === 'inprogress' ? 'In Progress' : 
                   project.status === 'onhold' ? 'On Hold' : 
                   project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`text-xs ${priorityColors[project.priority]}`}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Progress value={project.progress} className="h-2 w-16" />
                  <span className="text-sm text-muted-foreground min-w-[3rem]">{project.progress}%</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={project.manager.avatar} />
                    <AvatarFallback className="text-xs">
                      {project.manager.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{project.manager.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className={`text-sm ${isOverdue(project.deadline, project.status) ? 'text-destructive font-medium' : ''}`}>
                    {formatDate(project.deadline)}
                  </span>
                  {isOverdue(project.deadline, project.status) && (
                    <Badge variant="destructive" className="text-xs ml-1">
                      Overdue
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formatCurrency(project.budget, project.currency)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(project.actualSpent, project.currency)} spent
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{project.team.length}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      onProjectClick(project)
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {canEdit(project) && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        onEditProject(project)
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>
                    )}
                    {canDelete(project) && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteProject(project.id)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {sortedProjects.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No projects found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}