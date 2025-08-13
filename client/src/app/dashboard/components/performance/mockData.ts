import {
  PerformanceReview,
  PerformanceGoal,
  CompetencyRating,
  PerformanceDashboardData,
  TeamPerformance,
  UpcomingReview,
  PerformanceTrend,
  PerformanceSummary
} from './types'

// Mock Performance Goals
const mockGoals: PerformanceGoal[] = [
  {
    id: 'goal-1',
    title: 'Complete React Advanced Certification',
    description: 'Obtain advanced React certification to improve frontend development skills',
    category: 'Technical Skills',
    targetDate: '2024-06-30',
    progress: 75,
    status: 'In Progress',
    priority: 'High',
    metrics: 'Certification completion',
    notes: 'Making good progress, 3 modules remaining'
  },
  {
    id: 'goal-2',
    title: 'Lead Team Project',
    description: 'Successfully lead a cross-functional team project from inception to delivery',
    category: 'Leadership',
    targetDate: '2024-08-15',
    progress: 45,
    status: 'In Progress',
    priority: 'High',
    metrics: 'Project delivery on time and within budget',
    notes: 'Project planning phase completed, moving to execution'
  },
  {
    id: 'goal-3',
    title: 'Improve Code Review Process',
    description: 'Implement and document improved code review guidelines for the team',
    category: 'Process Improvement',
    targetDate: '2024-05-30',
    progress: 100,
    status: 'Completed',
    priority: 'Medium',
    metrics: 'Guidelines documented and adopted by team',
    notes: 'Successfully implemented new process, positive team feedback'
  }
]

// Mock Performance Reviews
export const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: 'review-1',
    employeeId: 'emp-1',
    employeeName: 'John Doe',
    department: 'Engineering',
    position: 'Senior Developer',
    evaluatorId: 'mgr-1',
    evaluatorName: 'Sarah Johnson',
    reviewPeriod: 'Q4 2024',
    reviewDate: '2024-01-15',
    overallRating: 4.2,
    competencyRatings: [
      {
        id: 'comp-1',
        competencyId: 'tech-skills',
        competencyName: 'Technical Skills',
        category: 'Technical',
        rating: 4,
        comments: 'Strong technical foundation',
        weight: 0.3
      }
    ],
    goals: mockGoals,
    achievements: [
      'Successfully delivered major feature ahead of schedule',
      'Improved team code quality through better review process',
      'Mentored two junior developers'
    ],
    feedback: 'John has shown exceptional growth this quarter.',
    improvementAreas: [
      'Could benefit from developing deeper expertise in system architecture'
    ],
    developmentPlan: [
      {
        id: 'dev-1',
        area: 'System Architecture',
        action: 'Complete system design course',
        timeline: '6 months',
        resources: ['Online course'],
        status: 'Planned'
      }
    ],
    status: 'Approved',
    nextReviewDate: '2024-04-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    isArchived: false
  }
]

// Mock Team Performance Data
export const mockTeamPerformance: TeamPerformance[] = [
  {
    departmentId: 'eng',
    departmentName: 'Engineering',
    averageRating: 4.1,
    totalEmployees: 25,
    topPerformers: 8,
    needsImprovement: 2,
    goalCompletionRate: 78,
    reviewCompletionRate: 95
  }
]

// Helper function to get filtered data based on user role
export const getMockDataForRole = (userRole: string) => {
  const canViewAll = userRole === 'Admin' || userRole === 'HR'

  if (canViewAll) {
    return {
      reviews: mockPerformanceReviews,
      teamPerformance: mockTeamPerformance
    }
  }

  // Employee view - only their own review
  const employeeReview = mockPerformanceReviews[0]
  return {
    reviews: [employeeReview],
    teamPerformance: mockTeamPerformance
  }
}