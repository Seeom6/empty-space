// Core Performance Types
export interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  department: string
  position: string
  evaluatorId: string
  evaluatorName: string
  reviewPeriod: string
  reviewDate: string
  overallRating: number
  competencyRatings: CompetencyRating[]
  goals: PerformanceGoal[]
  achievements: string[]
  feedback: string
  improvementAreas: string[]
  developmentPlan: DevelopmentPlan[]
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
  nextReviewDate?: string
  attachments?: string[]
  createdAt: string
  updatedAt: string
  isArchived: boolean
}

export interface CompetencyRating {
  id: string
  competencyId: string
  competencyName: string
  category: 'Technical' | 'Leadership' | 'Communication' | 'Collaboration' | 'Problem Solving'
  rating: number
  comments?: string
  weight: number
}

export interface DevelopmentPlan {
  id: string
  area: string
  action: string
  timeline: string
  resources: string[]
  status: 'Planned' | 'In Progress' | 'Completed'
}

export interface PerformanceGoal {
  id: string
  title: string
  description: string
  category: string
  targetDate: string
  status: GoalStatus
  progress: number
  priority?: 'Low' | 'Medium' | 'High'
  metrics?: string
  notes?: string
}

export interface PerformanceSummary {
  averageRating: number
  totalReviews: number
  activeGoals: number
  completedGoals: number
  employeeCount: number
  improvementNeeded: number
}

export interface PerformanceFilters {
  department: string
  status: string
  rating: string
  employeeName: string
  dateFrom: string
  dateTo: string
}

export const reviewStatuses = ['Draft', 'Submitted', 'Approved', 'Rejected'] as const

export const goalCategories = [
  'Technical Skills',
  'Leadership',
  'Communication',
  'Project Management',
  'Customer Service',
  'Innovation',
  'Teamwork',
  'Professional Development'
]

export const goalStatuses = ['Not Started', 'In Progress', 'Completed', 'Overdue'] as const

export const ratingDescriptions = {
  1: 'Needs Significant Improvement',
  2: 'Below Expectations',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding Performance'
}

// Enhanced Types
export type ReviewStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
export type GoalStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Overdue'
export type CompetencyCategory = 'Technical' | 'Leadership' | 'Communication' | 'Collaboration' | 'Problem Solving'
export type PerformanceLevel = 'Outstanding' | 'Exceeds' | 'Meets' | 'Below' | 'Unsatisfactory'
export type ReviewCycle = 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Monthly'

// Employee Performance Analytics
export interface PerformanceAnalytics {
  employeeId: string
  averageRating: number
  ratingTrend: number[]
  goalCompletionRate: number
  reviewHistory: PerformanceReview[]
  competencyScores: Record<string, number>
  improvementAreas: string[]
  strengths: string[]
  careerProgression: CareerProgression[]
}

export interface CareerProgression {
  date: string
  position: string
  department: string
  level: string
  salary?: number
}

// Team Performance
export interface TeamPerformance {
  departmentId: string
  departmentName: string
  averageRating: number
  totalEmployees: number
  topPerformers: number
  needsImprovement: number
  goalCompletionRate: number
  reviewCompletionRate: number
}

// Performance Dashboard Data
export interface PerformanceDashboardData {
  summary: PerformanceSummary
  recentReviews: PerformanceReview[]
  topPerformers: PerformanceReview[]
  teamPerformance: TeamPerformance[]
  upcomingReviews: UpcomingReview[]
  performanceTrends: PerformanceTrend[]
}

export interface UpcomingReview {
  employeeId: string
  employeeName: string
  department: string
  dueDate: string
  reviewType: ReviewCycle
  isOverdue: boolean
}

export interface PerformanceTrend {
  period: string
  averageRating: number
  reviewCount: number
  goalCompletionRate: number
}

// Hook Return Types
export interface UsePerformanceReturn {
  reviews: PerformanceReview[]
  dashboardData: PerformanceDashboardData
  filters: PerformanceFilters
  isLoading: boolean
  error: string | null
  actions: {
    setFilters: (filters: Partial<PerformanceFilters>) => void
    createReview: (review: Partial<PerformanceReview>) => Promise<void>
    updateReview: (id: string, updates: Partial<PerformanceReview>) => Promise<void>
    deleteReview: (id: string) => Promise<void>
    submitReview: (id: string) => Promise<void>
    approveReview: (id: string) => Promise<void>
    rejectReview: (id: string, reason: string) => Promise<void>
    refreshData: () => void
  }
}

// Component Props Types
export interface PerformanceDashboardProps {
  userRole: string
  onSelectEmployee?: (employeeId: string) => void
  onCreateReview?: () => void
  onEditReview?: (review: PerformanceReview) => void
}

export interface EmployeePerformanceProfileProps {
  employeeId: string
  userRole: string
  onBack?: () => void
}

export interface CreateEditReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (review: Partial<PerformanceReview>) => void
  review?: PerformanceReview
  employees: Array<{ id: string; name: string; department: string }>
  evaluators: Array<{ id: string; name: string }>
}

export interface GoalManagementProps {
  employeeId: string
  userRole: string
  goals: PerformanceGoal[]
  onUpdateGoal: (goalId: string, updates: Partial<PerformanceGoal>) => void
  onCreateGoal: (goal: Partial<PerformanceGoal>) => void
  onDeleteGoal: (goalId: string) => void
}

// Constants
export const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support'
] as const

export const competencyCategories = [
  'Technical',
  'Leadership',
  'Communication',
  'Collaboration',
  'Problem Solving'
] as const

export const performanceLevels = [
  'Outstanding',
  'Exceeds',
  'Meets',
  'Below',
  'Unsatisfactory'
] as const

export const reviewCycles = [
  'Annual',
  'Semi-Annual',
  'Quarterly',
  'Monthly'
] as const