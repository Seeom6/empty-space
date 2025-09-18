// Main Position Management Component
export { PositionsManagement } from './PositionsManagement'

// Core types and constants
export type {
  Position,
  PositionWithDepartment,
  CreatePositionRequest,
  UpdatePositionRequest,
  Department,
  PositionStatus,
  PositionFilters,
  PositionStats,
  ViewMode
} from './types'

export {
  POSITION_STATUSES,
  POSITION_STATUS_LABELS,
  POSITION_STATUS_COLORS,
  DEFAULT_POSITION_FILTERS
} from './constants'
