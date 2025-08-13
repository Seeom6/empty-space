// Core Technology Types
export interface Technology {
  id: string
  name: string
  category: TechnologyCategory
  description: string
  status: TechnologyStatus
  version: string
  icon?: string
  documentationUrl?: string
  userCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface TechnologyAssignment {
  id: string
  technologyId: string
  userId: string
  userName: string
  userPosition: string
  assignedAt: string
  assignedBy: string
  isActive: boolean
}

// Enums and Constants
export type TechnologyCategory =
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'DevOps'
  | 'Mobile'
  | 'Design'
  | 'Testing'
  | 'Analytics'

export type TechnologyStatus = 'active' | 'inactive' | 'deprecated'

export type ViewMode = 'list' | 'grid'

// Statistics and Analytics
export interface TechnologyStats {
  total: number
  active: number
  inactive: number
  deprecated: number
  categories: Record<TechnologyCategory, number>
}

// Filter and Search Types
export interface TechnologyFilters {
  search: string
  category: string
  status: string
}

export interface TechnologySortOptions {
  field: keyof Technology
  direction: 'asc' | 'desc'
}

// Component Props Types
export interface BaseTechnologyProps {
  userRole: string
  canManage?: boolean
}

export interface TechnologyActionProps {
  onEdit?: (technology: Technology) => void
  onDelete?: (technologyId: string) => void
  onView?: (technology: Technology) => void
}

export interface TechnologyDisplayProps extends BaseTechnologyProps, TechnologyActionProps {
  technologies: Technology[]
  onTechnologyClick: (technology: Technology) => void
}

// Form Types
export interface TechnologyFormData {
  name: string
  category: TechnologyCategory | ''
  description: string
  status: TechnologyStatus
  version: string
  icon: string
  documentationUrl: string
}

// Modal Types
export interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view'
  technology?: Technology | null
}

// Hook Return Types
export interface UseTechnologiesReturn {
  technologies: Technology[]
  filteredTechnologies: Technology[]
  stats: TechnologyStats
  filters: TechnologyFilters
  isLoading: boolean
  error: string | null
  actions: {
    setFilters: (filters: Partial<TechnologyFilters>) => void
    createTechnology: (technology: Omit<Technology, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateTechnology: (technology: Technology) => void
    deleteTechnology: (id: string) => void
    refreshTechnologies: () => void
  }
}