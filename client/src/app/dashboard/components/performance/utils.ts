import {
  PerformanceReview,
  PerformanceGoal,
  CompetencyRating,
  PerformanceFilters,
  ReviewStatus,
  GoalStatus,
  PerformanceAnalytics,
  TeamPerformance
} from './types'
import {
  RATING_COLORS,
  GOAL_STATUS_COLORS,
  REVIEW_STATUS_COLORS,
  STAR_COLORS,
  PERMISSION_LEVELS,
  VALIDATION_RULES,
  DISPLAY_CONFIG
} from './constants'

// ID Generation Utilities
export const generateReviewId = (employeeId?: string, period?: string): string => {
  if (employeeId && period) {
    return `review-${employeeId}-${period.replace(/\s+/g, '-')}`
  }
  return `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const generateGoalId = (): string => {
  return `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const generateCompetencyId = (): string => {
  return `competency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Rating Calculation Utilities
export const calculateOverallRating = (competencyRatings: CompetencyRating[]): number => {
  if (competencyRatings.length === 0) return 0

  const weightedSum = competencyRatings.reduce((sum, rating) => {
    return sum + (rating.rating * rating.weight)
  }, 0)

  const totalWeight = competencyRatings.reduce((sum, rating) => sum + rating.weight, 0)

  if (totalWeight === 0) return 0

  return Math.round((weightedSum / totalWeight) * 10) / 10
}

export const calculateGoalCompletionRate = (goals: PerformanceGoal[]): number => {
  if (goals.length === 0) return 0

  const completedGoals = goals.filter(goal => goal.status === 'Completed').length
  return Math.round((completedGoals / goals.length) * 100)
}

export const calculateGoalProgress = (goals: PerformanceGoal[]): number => {
  if (goals.length === 0) return 0

  const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0)
  return Math.round(totalProgress / goals.length)
}

export const calculateAverageProgress = (goals: PerformanceGoal[]): number => {
  return calculateGoalProgress(goals)
}

export const calculateAverageRating = (reviews: PerformanceReview[]): number => {
  if (reviews.length === 0) return 0
  const total = reviews.reduce((sum, review) => sum + review.overallRating, 0)
  return Math.round((total / reviews.length) * 10) / 10
}

export const getGoalStatusCounts = (goals: PerformanceGoal[]) => {
  return {
    completed: goals.filter(g => g.status === 'Completed').length,
    inProgress: goals.filter(g => g.status === 'In Progress').length,
    notStarted: goals.filter(g => g.status === 'Not Started').length,
    overdue: goals.filter(g => g.status === 'Overdue').length
  }
}

// Date Utilities
export const getDefaultNextReviewDate = (reviewPeriod?: string): string => {
  if (reviewPeriod) {
    // Extract year and quarter from review period (e.g., "Q4 2024")
    const [quarter, year] = reviewPeriod.split(' ')
    const quarterNum = parseInt(quarter.replace('Q', ''))
    const reviewYear = parseInt(year)

    // Calculate next review date (next quarter)
    let nextQuarter = quarterNum + 1
    let nextYear = reviewYear

    if (nextQuarter > 4) {
      nextQuarter = 1
      nextYear += 1
    }

    // Set to first day of the next quarter
    const quarterStartMonth = (nextQuarter - 1) * 3
    const nextReviewDate = new Date(nextYear, quarterStartMonth, 1)

    return nextReviewDate.toISOString().split('T')[0]
  }

  // Default: 3 months from now
  const date = new Date()
  date.setMonth(date.getMonth() + 3)
  return date.toISOString().split('T')[0]
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const isOverdue = (dueDate: string): boolean => {
  const today = new Date()
  const due = new Date(dueDate)
  return due < today
}

export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Goal Status Determination
export const determineGoalStatus = (progress: number, targetDate: string): GoalStatus => {
  if (progress === 100) return 'Completed'
  if (progress === 0) return 'Not Started'
  if (new Date(targetDate) < new Date()) return 'Overdue'
  return 'In Progress'
}

// Color and Style Utilities
export const getStatusColor = (status: ReviewStatus): string => {
  return REVIEW_STATUS_COLORS[status] || REVIEW_STATUS_COLORS['Draft']
}

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600'
  if (rating >= 3.5) return 'text-blue-600'
  if (rating >= 2.5) return 'text-yellow-600'
  return 'text-red-600'
}

export const getRatingBadgeColor = (rating: number): string => {
  return RATING_COLORS[Math.round(rating)] || RATING_COLORS[3]
}

export const getRatingBadgeVariant = (rating: number): string => {
  if (rating >= 4.5) return 'default'
  if (rating >= 3.5) return 'secondary'
  if (rating >= 2.5) return 'outline'
  return 'destructive'
}

export const getGoalStatusColor = (status: GoalStatus): string => {
  return GOAL_STATUS_COLORS[status] || GOAL_STATUS_COLORS['Not Started']
}

export const getProgressBarColor = (progress: number): string => {
  if (progress >= 80) return 'bg-green-500'
  if (progress >= 60) return 'bg-blue-500'
  if (progress >= 40) return 'bg-yellow-500'
  if (progress >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

// Permission Utilities
export const canEditReview = (userRole: string, review: PerformanceReview): boolean => {
  const permissions = PERMISSION_LEVELS[userRole as keyof typeof PERMISSION_LEVELS]
  if (!permissions) return false

  if (permissions.canEditAll) return true
  if (userRole === 'Manager' && review.status === 'Draft') return true

  return false
}

export const canApproveReview = (userRole: string): boolean => {
  const permissions = PERMISSION_LEVELS[userRole as keyof typeof PERMISSION_LEVELS]
  return permissions?.canApprove || false
}

export const canDeleteReview = (userRole: string): boolean => {
  const permissions = PERMISSION_LEVELS[userRole as keyof typeof PERMISSION_LEVELS]
  return permissions?.canDelete || false
}

export const canViewAllReviews = (userRole: string): boolean => {
  const permissions = PERMISSION_LEVELS[userRole as keyof typeof PERMISSION_LEVELS]
  return permissions?.canViewAll || false
}

export const canManageGoals = (userRole: string): boolean => {
  const permissions = PERMISSION_LEVELS[userRole as keyof typeof PERMISSION_LEVELS]
  return permissions?.canManageGoals || false
}

export const canExportData = (userRole: string): boolean => {
  const permissions = PERMISSION_LEVELS[userRole as keyof typeof PERMISSION_LEVELS]
  return permissions?.canExport || false
}

// Data Filtering Utilities
export const filterReviewsByDateRange = (reviews: PerformanceReview[], startDate: string, endDate: string): PerformanceReview[] => {
  if (!startDate && !endDate) return reviews

  return reviews.filter(review => {
    const reviewDate = new Date(review.reviewDate)
    const start = startDate ? new Date(startDate) : new Date('2000-01-01')
    const end = endDate ? new Date(endDate) : new Date('2030-12-31')
    return reviewDate >= start && reviewDate <= end
  })
}

export const getLatestReviewForEmployee = (reviews: PerformanceReview[], employeeId: string): PerformanceReview | undefined => {
  const employeeReviews = reviews.filter(review => review.employeeId === employeeId)
  return employeeReviews.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())[0]
}

export const filterReviewsByStatus = (reviews: PerformanceReview[], status: ReviewStatus): PerformanceReview[] => {
  return reviews.filter(review => review.status === status)
}

export const filterReviewsByDepartment = (reviews: PerformanceReview[], department: string): PerformanceReview[] => {
  if (department === 'All Departments') return reviews
  return reviews.filter(review => review.department === department)
}

// Validation Utilities
export const validateReview = (review: Partial<PerformanceReview>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!review.employeeName?.trim()) {
    errors.push('Employee name is required')
  }

  if (!review.reviewPeriod?.trim()) {
    errors.push('Review period is required')
  }

  if (!review.overallRating || review.overallRating < VALIDATION_RULES.review.minRating || review.overallRating > VALIDATION_RULES.review.maxRating) {
    errors.push(`Overall rating must be between ${VALIDATION_RULES.review.minRating} and ${VALIDATION_RULES.review.maxRating}`)
  }

  if (!review.goals || review.goals.length < VALIDATION_RULES.review.minGoals) {
    errors.push(`At least ${VALIDATION_RULES.review.minGoals} goal is required`)
  }

  if (review.feedback && review.feedback.length < VALIDATION_RULES.review.minFeedbackLength) {
    errors.push(`Feedback must be at least ${VALIDATION_RULES.review.minFeedbackLength} characters`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const validateGoal = (goal: Partial<PerformanceGoal>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!goal.title?.trim()) {
    errors.push('Goal title is required')
  } else if (goal.title.length < VALIDATION_RULES.goal.minTitleLength) {
    errors.push(`Goal title must be at least ${VALIDATION_RULES.goal.minTitleLength} characters`)
  }

  if (!goal.description?.trim()) {
    errors.push('Goal description is required')
  } else if (goal.description.length < VALIDATION_RULES.goal.minDescriptionLength) {
    errors.push(`Goal description must be at least ${VALIDATION_RULES.goal.minDescriptionLength} characters`)
  }

  if (goal.progress !== undefined && (goal.progress < VALIDATION_RULES.goal.minProgress || goal.progress > VALIDATION_RULES.goal.maxProgress)) {
    errors.push(`Goal progress must be between ${VALIDATION_RULES.goal.minProgress} and ${VALIDATION_RULES.goal.maxProgress}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}