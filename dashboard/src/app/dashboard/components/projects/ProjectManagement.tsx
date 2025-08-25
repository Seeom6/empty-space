import { useState, useMemo } from 'react'
import { Plus, LayoutGrid, Table, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProjectFilters } from './ProjectFilters'
import { ProjectList } from './ProjectList'
import { ProjectDetails } from './ProjectDetails'
import { CreateEditProjectModal } from './CreateEditProjectModal'
import { ProjectAnalytics } from './ProjectAnalytics'

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'inprogress' | 'completed' | 'onhold'
  priority: 'low' | 'medium' | 'high' | 'critical'
  progress: number
  startDate: string
  endDate: string
  deadline: string
  budget: number
  currency: string
  actualSpent: number
  manager: {
    id: string
    name: string
    avatar: string
  }
  team: Array<{
    id: string
    name: string
    avatar: string
    role: string
  }>
  technologies: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface ProjectManagementProps {
  userRole: string
}

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Mobile App Redesign',
    description: 'Complete redesign of the mobile application with modern UI/UX principles and improved user experience.',
    status: 'inprogress',
    priority: 'high',
    progress: 65,
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    deadline: '2025-09-15',
    budget: 150000,
    currency: 'USD',
    actualSpent: 97500,
    manager: { id: '1', name: 'Alice Johnson', avatar: '/placeholder-avatar.jpg' },
    team: [
      { id: '1', name: 'Alice Johnson', avatar: '/placeholder-avatar.jpg', role: 'Project Manager' },
      { id: '2', name: 'Bob Smith', avatar: '/placeholder-avatar.jpg', role: 'Senior Developer' },
      { id: '3', name: 'Carol Davis', avatar: '/placeholder-avatar.jpg', role: 'UI Designer' },
      { id: '4', name: 'David Wilson', avatar: '/placeholder-avatar.jpg', role: 'QA Engineer' }
    ],
    technologies: ['React Native', 'TypeScript', 'Firebase', 'Figma'],
    tags: ['mobile', 'redesign', 'ux'],
    createdAt: '2025-06-15',
    updatedAt: '2025-08-07'
  },
  {
    id: '2',
    name: 'E-commerce Platform',
    description: 'Development of a comprehensive e-commerce platform with payment integration and inventory management.',
    status: 'planning',
    priority: 'critical',
    progress: 15,
    startDate: '2025-08-15',
    endDate: '2025-12-31',
    deadline: '2025-12-15',
    budget: 250000,
    currency: 'USD',
    actualSpent: 25000,
    manager: { id: '2', name: 'Bob Smith', avatar: '/placeholder-avatar.jpg' },
    team: [
      { id: '2', name: 'Bob Smith', avatar: '/placeholder-avatar.jpg', role: 'Project Manager' },
      { id: '5', name: 'Emma Brown', avatar: '/placeholder-avatar.jpg', role: 'Full Stack Developer' },
      { id: '6', name: 'Frank Miller', avatar: '/placeholder-avatar.jpg', role: 'DevOps Engineer' }
    ],
    technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
    tags: ['ecommerce', 'backend', 'payments'],
    createdAt: '2025-07-20',
    updatedAt: '2025-08-05'
  },
  {
    id: '3',
    name: 'HR Analytics Dashboard',
    description: 'Internal analytics dashboard for HR department to track employee performance and engagement metrics.',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    startDate: '2025-05-01',
    endDate: '2025-07-15',
    deadline: '2025-07-31',
    budget: 75000,
    currency: 'USD',
    actualSpent: 68000,
    manager: { id: '3', name: 'Carol Davis', avatar: '/placeholder-avatar.jpg' },
    team: [
      { id: '3', name: 'Carol Davis', avatar: '/placeholder-avatar.jpg', role: 'Project Manager' },
      { id: '7', name: 'Grace Lee', avatar: '/placeholder-avatar.jpg', role: 'Data Analyst' },
      { id: '8', name: 'Henry Clark', avatar: '/placeholder-avatar.jpg', role: 'Frontend Developer' }
    ],
    technologies: ['React', 'D3.js', 'Python', 'MongoDB'],
    tags: ['analytics', 'hr', 'dashboard'],
    createdAt: '2025-04-10',
    updatedAt: '2025-07-15'
  },
  {
    id: '4',
    name: 'API Security Audit',
    description: 'Comprehensive security audit and enhancement of all API endpoints across the platform.',
    status: 'onhold',
    priority: 'high',
    progress: 30,
    startDate: '2025-06-01',
    endDate: '2025-08-30',
    deadline: '2025-09-01',
    budget: 50000,
    currency: 'USD',
    actualSpent: 15000,
    manager: { id: '4', name: 'David Wilson', avatar: '/placeholder-avatar.jpg' },
    team: [
      { id: '4', name: 'David Wilson', avatar: '/placeholder-avatar.jpg', role: 'Security Lead' },
      { id: '9', name: 'Ivy Thompson', avatar: '/placeholder-avatar.jpg', role: 'Security Engineer' }
    ],
    technologies: ['Node.js', 'OAuth', 'JWT', 'OWASP'],
    tags: ['security', 'audit', 'api'],
    createdAt: '2025-05-25',
    updatedAt: '2025-07-20'
  }
]

const mockUsers = [
  { id: '1', name: 'Alice Johnson', avatar: '/placeholder-avatar.jpg' },
  { id: '2', name: 'Bob Smith', avatar: '/placeholder-avatar.jpg' },
  { id: '3', name: 'Carol Davis', avatar: '/placeholder-avatar.jpg' },
  { id: '4', name: 'David Wilson', avatar: '/placeholder-avatar.jpg' },
  { id: '5', name: 'Emma Brown', avatar: '/placeholder-avatar.jpg' },
  { id: '6', name: 'Frank Miller', avatar: '/placeholder-avatar.jpg' },
  { id: '7', name: 'Grace Lee', avatar: '/placeholder-avatar.jpg' },
  { id: '8', name: 'Henry Clark', avatar: '/placeholder-avatar.jpg' },
  { id: '9', name: 'Ivy Thompson', avatar: '/placeholder-avatar.jpg' }
]

const mockTechnologies = [
  'React', 'React Native', 'Next.js', 'Node.js', 'TypeScript', 'JavaScript',
  'Python', 'PostgreSQL', 'MongoDB', 'Firebase', 'AWS', 'Docker',
  'Kubernetes', 'Figma', 'Stripe', 'OAuth', 'JWT', 'D3.js', 'OWASP'
]

export function ProjectManagement({ userRole }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
    manager: 'all',
    tags: []
  })
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Permission checks
  const canCreate = ['Admin', 'Manager'].includes(userRole)
  const canEdit = (project: Project) => {
    if (userRole === 'Admin') return true
    if (userRole === 'Manager') return project.manager.id === 'current-user-id'
    return false
  }
  const canDelete = (project: Project) => {
    if (userRole === 'Admin') return true
    if (userRole === 'Manager') return project.manager.id === 'current-user-id'
    return false
  }

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.status !== 'all' && project.status !== filters.status) return false
      if (filters.priority !== 'all' && project.priority !== filters.priority) return false
      if (filters.manager !== 'all' && project.manager.id !== filters.manager) return false
      if (filters.tags.length > 0 && !filters.tags.some(tag => project.tags.includes(tag))) return false
      
      // Role-based filtering
      if (userRole === 'Employee') {
        return project.team.some(member => member.id === 'current-user-id')
      }
      
      return true
    })
  }, [projects, filters, userRole])

  const createProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setProjects(prev => [...prev, newProject])
  }

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : project
    ))
  }

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId))
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Project Management</h1>
          <p className="text-muted-foreground">Manage and track all company projects</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="px-3"
            >
              <Table className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>

          {/* Create Project Button */}
          {canCreate && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
      </div>

      {/* Analytics and Content Tabs */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {/* Filters */}
          <ProjectFilters
            filters={filters}
            onFiltersChange={setFilters}
            users={mockUsers}
          />

          {/* Project List */}
          <ProjectList
            projects={filteredProjects}
            viewMode={viewMode}
            onProjectClick={setSelectedProject}
            onEditProject={setEditingProject}
            onDeleteProject={deleteProject}
            userRole={userRole}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <ProjectAnalytics projects={projects} userRole={userRole} />
        </TabsContent>
      </Tabs>

      {/* Modals and Sheets */}
      {isCreateModalOpen && (
        <CreateEditProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={createProject}
          users={mockUsers}
          technologies={mockTechnologies}
          mode="create"
        />
      )}

      {editingProject && (
        <CreateEditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          onSave={(projectData) => {
            updateProject(editingProject.id, projectData)
            setEditingProject(null)
          }}
          users={mockUsers}
          technologies={mockTechnologies}
          mode="edit"
          project={editingProject}
        />
      )}

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={() => {
            setEditingProject(selectedProject)
            setSelectedProject(null)
          }}
          onUpdateProject={(updates) => updateProject(selectedProject.id, updates)}
          users={mockUsers}
          technologies={mockTechnologies}
          userRole={userRole}
          canEdit={canEdit(selectedProject)}
        />
      )}
    </div>
  )
}