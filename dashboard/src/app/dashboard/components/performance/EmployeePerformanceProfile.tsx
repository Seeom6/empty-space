'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Star, 
  Target, 
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { PerformanceReview } from './types'
import { getMockDataForRole } from './mockData'

interface EmployeePerformanceProfileProps {
  employeeId: string
  onBack: () => void
  onEditReview: (review: PerformanceReview) => void
  userRole: string
}

export function EmployeePerformanceProfile({ 
  employeeId, 
  onBack, 
  onEditReview, 
  userRole 
}: EmployeePerformanceProfileProps) {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null)

  // Get all reviews for this employee
  const mockData = getMockDataForRole(userRole)
  const employeeReviews = mockData.reviews
    .filter((review: PerformanceReview) => review.employeeId === employeeId)
    .sort((a: PerformanceReview, b: PerformanceReview) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())

  if (employeeReviews.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2>No Performance Data</h2>
            <p className="text-muted-foreground mt-2">
              No performance reviews found for this employee.
            </p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Performance
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const employee = employeeReviews[0]
  const latestReview = employeeReviews[0]
  const selectedReview = selectedReviewId 
    ? employeeReviews.find((r: PerformanceReview) => r.id === selectedReviewId) || latestReview
    : latestReview

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>
      case 'Submitted':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Submitted</Badge>
      case 'Draft':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Draft</Badge>
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'Overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getGoalStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case 'In Progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">In Progress</Badge>
      case 'Overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'Not Started':
        return <Badge variant="secondary">Not Started</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-2 font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateOverallProgress = () => {
    const allGoals = employeeReviews.flatMap((review: PerformanceReview) => review.goals)
    const completedGoals = allGoals.filter((goal: any) => goal.status === 'Completed').length
    return allGoals.length > 0 ? (completedGoals / allGoals.length) * 100 : 0
  }

  const canEditReview = userRole === 'Admin' || userRole === 'HR' || userRole === 'Manager'
  const canViewDetails = userRole === 'Admin' || userRole === 'HR' || userRole === 'Manager' || 
    (userRole === 'Employee' && employeeId === 'current-user-id')

  if (!canViewDetails) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2>Access Restricted</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to view this employee's performance information.
            </p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Performance
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Performance
        </Button>
        {canEditReview && (
          <Button onClick={() => onEditReview(selectedReview)} className="gap-2">
            Edit Review
          </Button>
        )}
      </div>

      {/* Employee Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {employee.employeeName.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{employee.employeeName}</h1>
              <p className="text-lg text-muted-foreground">{employee.department}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">Employee ID: {employeeId}</Badge>
                {getStatusBadge(latestReview.status)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Latest Rating</div>
              {getStarRating(latestReview.overallRating)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeReviews.slice(0, 3).map((review: PerformanceReview) => (
                <div key={review.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{review.reviewPeriod}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(review.reviewDate)}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="ml-1 text-sm">{review.overallRating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Goals Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{calculateOverallProgress().toFixed(1)}%</span>
                </div>
                <Progress value={calculateOverallProgress()} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Completed</div>
                  <div className="font-medium text-green-600">
                    {employeeReviews.flatMap(r => r.goals).filter(g => g.status === 'Completed').length}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">In Progress</div>
                  <div className="font-medium text-blue-600">
                    {employeeReviews.flatMap(r => r.goals).filter(g => g.status === 'In Progress').length}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Next Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {latestReview.nextReviewDate ? (
                <>
                  <div className="text-2xl font-bold">
                    {formatDate(latestReview.nextReviewDate)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Scheduled review date
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-muted-foreground">
                    Not Scheduled
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Next review date TBD
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Review Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeeReviews.map(review => (
              <div 
                key={review.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedReview.id === review.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedReviewId(review.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{review.reviewPeriod}</h3>
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Reviewed by {review.evaluatorName}</span>
                      <span>{formatDate(review.reviewDate)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStarRating(review.overallRating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Review Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Details - {selectedReview.reviewPeriod}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Overall Rating</h4>
              {getStarRating(selectedReview.overallRating)}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Achievements</h4>
              <ul className="space-y-2">
                {selectedReview.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Feedback</h4>
              <p className="text-sm text-muted-foreground">{selectedReview.feedback}</p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-2">Areas for Improvement</h4>
              <ul className="space-y-2">
                {selectedReview.improvementAreas.map((area, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals & Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedReview.goals.map(goal => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{goal.title}</h4>
                    {getGoalStatusIcon(goal.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm text-muted-foreground">
                      Due: {formatDate(goal.targetDate)}
                    </div>
                    {getGoalStatusBadge(goal.status)}
                  </div>
                  
                  {goal.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Notes:</strong> {goal.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}