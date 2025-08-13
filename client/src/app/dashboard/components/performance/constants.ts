import {
  ReviewStatus,
  GoalStatus,
  CompetencyCategory,
  PerformanceLevel,
  ReviewCycle
} from './types'

// Performance Rating System
export const PERFORMANCE_RATINGS = {
  OUTSTANDING: 5,
  EXCEEDS_EXPECTATIONS: 4,
  MEETS_EXPECTATIONS: 3,
  BELOW_EXPECTATIONS: 2,
  NEEDS_IMPROVEMENT: 1
} as const

export const RATING_DESCRIPTIONS: Record<number, string> = {
  5: 'Outstanding Performance - Consistently exceeds all expectations',
  4: 'Exceeds Expectations - Regularly surpasses performance standards',
  3: 'Meets Expectations - Consistently meets all performance standards',
  2: 'Below Expectations - Sometimes meets performance standards',
  1: 'Needs Significant Improvement - Rarely meets performance standards'
} as const

export const RATING_COLORS: Record<number, string> = {
  5: 'text-green-600 bg-green-50 border-green-200',
  4: 'text-blue-600 bg-blue-50 border-blue-200',
  3: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  2: 'text-orange-600 bg-orange-50 border-orange-200',
  1: 'text-red-600 bg-red-50 border-red-200'
} as const

export const STAR_COLORS: Record<number, string> = {
  5: 'text-green-500',
  4: 'text-blue-500',
  3: 'text-yellow-500',
  2: 'text-orange-500',
  1: 'text-red-500'
} as const

// Goal Management
export const GOAL_STATUSES: Record<GoalStatus, string> = {
  'Not Started': 'Not Started',
  'In Progress': 'In Progress',
  'Completed': 'Completed',
  'Overdue': 'Overdue'
} as const

export const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  'Not Started': 'text-gray-600 bg-gray-50 border-gray-200',
  'In Progress': 'text-blue-600 bg-blue-50 border-blue-200',
  'Completed': 'text-green-600 bg-green-50 border-green-200',
  'Overdue': 'text-red-600 bg-red-50 border-red-200'
} as const

export const GOAL_PROGRESS_COLORS: Record<string, string> = {
  low: 'bg-red-500',
  medium: 'bg-yellow-500',
  high: 'bg-green-500'
} as const

// Review Status Management
export const REVIEW_STATUSES: Record<ReviewStatus, string> = {
  'Draft': 'Draft',
  'Submitted': 'Submitted',
  'Approved': 'Approved',
  'Rejected': 'Rejected'
} as const

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  'Draft': 'text-gray-600 bg-gray-50 border-gray-200',
  'Submitted': 'text-blue-600 bg-blue-50 border-blue-200',
  'Approved': 'text-green-600 bg-green-50 border-green-200',
  'Rejected': 'text-red-600 bg-red-50 border-red-200'
} as const

// Competency Categories
export const COMPETENCY_CATEGORIES: Record<CompetencyCategory, string> = {
  'Technical': 'Technical Skills',
  'Leadership': 'Leadership & Management',
  'Communication': 'Communication & Collaboration',
  'Collaboration': 'Teamwork & Collaboration',
  'Problem Solving': 'Problem Solving & Innovation'
} as const

export const COMPETENCY_WEIGHTS: Record<CompetencyCategory, number> = {
  'Technical': 0.3,
  'Leadership': 0.2,
  'Communication': 0.2,
  'Collaboration': 0.15,
  'Problem Solving': 0.15
} as const

// Organizational Structure
export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Customer Support'
] as const

export const POSITIONS = [
  'Junior Developer',
  'Senior Developer',
  'Lead Developer',
  'Engineering Manager',
  'Designer',
  'Senior Designer',
  'Design Lead',
  'Marketing Specialist',
  'Marketing Manager',
  'Sales Representative',
  'Sales Manager',
  'HR Specialist',
  'HR Manager',
  'Financial Analyst',
  'Finance Manager',
  'Operations Specialist',
  'Operations Manager',
  'Support Specialist',
  'Support Manager'
] as const

// Goal Categories
export const GOAL_CATEGORIES = [
  'Technical Skills',
  'Leadership Development',
  'Communication Skills',
  'Project Management',
  'Customer Service',
  'Innovation & Creativity',
  'Teamwork & Collaboration',
  'Professional Development',
  'Process Improvement',
  'Mentoring & Coaching'
] as const

// Review Cycles
export const REVIEW_CYCLES: Record<ReviewCycle, string> = {
  'Annual': 'Annual Review',
  'Semi-Annual': 'Semi-Annual Review',
  'Quarterly': 'Quarterly Review',
  'Monthly': 'Monthly Check-in'
} as const

// Performance Levels
export const PERFORMANCE_LEVELS: Record<PerformanceLevel, number> = {
  'Outstanding': 5,
  'Exceeds': 4,
  'Meets': 3,
  'Below': 2,
  'Unsatisfactory': 1
} as const

// Review Periods
export const REVIEW_PERIODS = [
  'Q4 2024',
  'Q3 2024',
  'Q2 2024',
  'Q1 2024',
  'Q4 2023',
  'Q3 2023'
] as const

// Legacy exports for backward compatibility
export const reviewPeriods = REVIEW_PERIODS

// Templates for quick input
export const ACHIEVEMENT_TEMPLATES = [
  'Successfully completed major project ahead of schedule',
  'Improved team collaboration and communication',
  'Implemented new process that increased efficiency by 20%',
  'Mentored two junior team members',
  'Led successful product launch',
  'Reduced customer complaints by 30%',
  'Achieved all quarterly goals',
  'Received positive client feedback',
  'Developed innovative solution to complex problem',
  'Exceeded sales targets by 15%'
] as const

export const IMPROVEMENT_AREA_TEMPLATES = [
  'Could benefit from improving time management skills',
  'Should work on presenting ideas more confidently in meetings',
  'Would benefit from developing deeper technical expertise in specific areas',
  'Could improve documentation and knowledge sharing practices',
  'Should focus on strategic thinking and planning',
  'Would benefit from stronger stakeholder communication',
  'Could enhance leadership and delegation skills',
  'Should work on conflict resolution abilities'
] as const

export const FEEDBACK_TEMPLATES = [
  'Consistently delivers high-quality work and shows great attention to detail. Strong team player with excellent communication skills.',
  'Demonstrates strong technical skills and problem-solving abilities. Takes initiative and works well independently.',
  'Shows great leadership potential and ability to mentor others. Excellent at managing priorities and meeting deadlines.',
  'Very collaborative and always willing to help teammates. Shows continuous improvement and learning mindset.',
  'Excellent customer service skills and ability to handle challenging situations with professionalism.',
  'Strong analytical skills and ability to make data-driven decisions. Consistently meets project deadlines.'
] as const

// Legacy exports for backward compatibility
export const achievementTemplates = ACHIEVEMENT_TEMPLATES
export const improvementAreaTemplates = IMPROVEMENT_AREA_TEMPLATES
export const feedbackTemplates = FEEDBACK_TEMPLATES

// Validation Rules
export const VALIDATION_RULES = {
  review: {
    minRating: 1,
    maxRating: 5,
    minGoals: 1,
    maxGoals: 10,
    minAchievements: 1,
    maxAchievements: 20,
    minFeedbackLength: 50,
    maxFeedbackLength: 2000
  },
  goal: {
    minTitleLength: 5,
    maxTitleLength: 100,
    minDescriptionLength: 20,
    maxDescriptionLength: 500,
    minProgress: 0,
    maxProgress: 100
  }
} as const

// Display Configuration
export const DISPLAY_CONFIG = {
  itemsPerPage: 10,
  maxRecentReviews: 5,
  maxTopPerformers: 5,
  defaultDateFormat: 'MMM dd, yyyy',
  shortDateFormat: 'MMM dd',
  animationDuration: 300,
  refreshInterval: 30000, // 30 seconds
  cacheTimeout: 300000 // 5 minutes
} as const

// Permission Levels
export const PERMISSION_LEVELS = {
  Admin: {
    canViewAll: true,
    canEditAll: true,
    canApprove: true,
    canDelete: true,
    canExport: true,
    canManageGoals: true
  },
  HR: {
    canViewAll: true,
    canEditAll: true,
    canApprove: true,
    canDelete: false,
    canExport: true,
    canManageGoals: true
  },
  Manager: {
    canViewAll: false,
    canEditAll: false,
    canApprove: true,
    canDelete: false,
    canExport: false,
    canManageGoals: true
  },
  Employee: {
    canViewAll: false,
    canEditAll: false,
    canApprove: false,
    canDelete: false,
    canExport: false,
    canManageGoals: false
  }
} as const