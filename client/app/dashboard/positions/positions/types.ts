// Import and re-export core types from API
import type {
  Position,
  PositionWithDepartment,
  CreatePositionRequest,
  UpdatePositionRequest,
  Department,
  Status as PositionStatus
} from '@/lib/api/types'

export type { Position, PositionWithDepartment, CreatePositionRequest, UpdatePositionRequest, Department, PositionStatus }

// Constants are defined in constants.ts to avoid duplication

// Filter Types
export interface PositionFilters {
  search: string
  status: 'all' | PositionStatus
  department: 'all' | string
}

// Statistics Types
export interface PositionStats {
  total: number
  active: number
  inactive: number
  departments: Record<string, number>
}

// View Mode Types
export type ViewMode = 'list' | 'grid'

// Component Props Types
export interface BasePositionProps {
  userRole: string
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export interface PositionActionProps {
  onEdit?: (position: Position) => void
  onDelete?: (positionId: string) => void
  onView?: (position: Position) => void
}

export interface PositionDisplayProps extends BasePositionProps, PositionActionProps {
  positions: Position[]
  onPositionClick: (position: Position) => void
}

// Form Types
export interface PositionFormData {
  name: string
  departmentId: string
  description: string
  status: PositionStatus
}

// Modal Types
export interface ModalState {
  isOpen: boolean
  mode: 'create' | 'edit' | 'view'
  position?: Position | null
}

// API Request/Response Types are imported from @/lib/api/types

// Department Types are imported from @/lib/api/types

// Permission Types
export interface PositionPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

// Error Types
export interface PositionError {
  code: number
  message: string
  field?: string
}

// Validation constants are in constants.ts

// Additional types can be added here as needed
