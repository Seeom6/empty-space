'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Star, 
  TrendingUp, 
  Users, 
  Target,
  Search,
  Filter,
  Plus,
  Eye,
  Edit
} from 'lucide-react'
import { PerformanceReview, PerformanceFilters } from './types'
import { mockPerformanceReviews, getMockDataForRole } from './mockData'
import { DEPARTMENTS } from './constants'
import { StarRating } from './RatingComponent'
import { formatShortDate } from './utils'

interface PerformanceDashboardProps {
  onSelectEmployee: (employeeId: string) => void
  onCreateReview: () => void
  onEditReview: (review: PerformanceReview) => void
  userRole: string
}

export function PerformanceDashboard({ 
  onSelectEmployee, 
  onCreateReview, 
  onEditReview, 
  userRole 
}: PerformanceDashboardProps) {
  const [filters, setFilters] = useState<PerformanceFilters>({
    department: 'all',
    status: 'all',
    rating: 'all',
    employeeName: '',
    dateFrom: '',
    dateTo: ''
  })

  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 10

  // Get latest reviews for each employee
  const getLatestReviews = () => {
    const latestReviews = new Map<string, PerformanceReview>()
    
    mockPerformanceReviews.forEach((review: PerformanceReview) => {
      const existing = latestReviews.get(review.employeeId)
      if (!existing || new Date(review.reviewDate) > new Date(existing.reviewDate)) {
        latestReviews.set(review.employeeId, review)
      }
    })
    
    return Array.from(latestReviews.values())
  }

  const latestReviews = getLatestReviews()

  // Filter reviews
  const filteredReviews = latestReviews.filter(review => {
    const matchesDepartment = filters.department === 'all' || review.department === filters.department
    const matchesStatus = filters.status === 'all' || review.status === filters.status
    const matchesRating = filters.rating === 'all' || 
      (filters.rating === 'excellent' && review.overallRating >= 4.5) ||
      (filters.rating === 'good' && review.overallRating >= 3.5 && review.overallRating < 4.5) ||
      (filters.rating === 'average' && review.overallRating >= 2.5 && review.overallRating < 3.5) ||
      (filters.rating === 'poor' && review.overallRating < 2.5)
    const matchesEmployeeName = !filters.employeeName || 
      review.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase())

    return matchesDepartment && matchesStatus && matchesRating && matchesEmployeeName
  }).sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + recordsPerPage)

  // Calculate summary stats
  const calculateSummaryStats = () => {
    const allReviews = mockPerformanceReviews
    const averageRating = allReviews.reduce((sum: number, review: PerformanceReview) => sum + review.overallRating, 0) / allReviews.length
    const totalGoals = allReviews.reduce((sum: number, review: PerformanceReview) => sum + review.goals.length, 0)
    const completedGoals = allReviews.reduce((sum: number, review: PerformanceReview) =>
      sum + review.goals.filter((goal: any) => goal.status === 'Completed').length, 0
    )
    const improvementNeeded = latestReviews.filter((review: PerformanceReview) => review.overallRating < 3).length
    
    return {
      averageRating,
      totalReviews: allReviews.length,
      activeGoals: totalGoals - completedGoals,
      completedGoals,
      employeeCount: latestReviews.length,
      improvementNeeded
    }
  }

  const summaryStats = calculateSummaryStats()

  // Get top performers
  const getTopPerformers = () => {
    return latestReviews
      .filter(review => review.overallRating >= 4.0)
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, 5)
  }

  const topPerformers = getTopPerformers()

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

  const getRatingBadge = (rating: number) => {
    if (rating >= 4.5) return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Excellent</Badge>
    if (rating >= 3.5) return <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Good</Badge>
    if (rating >= 2.5) return <Badge variant="secondary">Average</Badge>
    return <Badge variant="destructive">Needs Improvement</Badge>
  }

  const canManageReviews = userRole === 'Admin' || userRole === 'HR' || userRole === 'Manager'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Performance Management</h2>
          <p className="text-muted-foreground mt-1">
            Track employee performance, goals, and reviews
          </p>
        </div>
        {canManageReviews && (
          <Button onClick={onCreateReview} className="gap-2">
            <Plus className="h-4 w-4" />
            New Review
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Total reviews conducted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryStats.completedGoals + summaryStats.activeGoals > 0 
                ? Math.round((summaryStats.completedGoals / (summaryStats.completedGoals + summaryStats.activeGoals)) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.completedGoals} of {summaryStats.completedGoals + summaryStats.activeGoals} goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summaryStats.improvementNeeded}</div>
            <p className="text-xs text-muted-foreground">
              Employees below 3.0 rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformers.map((review, index) => (
              <div key={review.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {review.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{review.employeeName}</div>
                    <div className="text-sm text-muted-foreground">{review.department}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.overallRating} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by employee name..."
                value={filters.employeeName}
                onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={filters.department} onValueChange={(value) => setFilters({ ...filters, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((dept: string) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Performance Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="excellent">Excellent (4.5+)</SelectItem>
                  <SelectItem value="good">Good (3.5-4.4)</SelectItem>
                  <SelectItem value="average">Average (2.5-3.4)</SelectItem>
                  <SelectItem value="poor">Needs Improvement (&lt;2.5)</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="From Date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Performance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Review</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Goals Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReviews.map(review => {
                  const completedGoals = review.goals.filter(goal => goal.status === 'Completed').length
                  const totalGoals = review.goals.length
                  const goalsProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0
                  
                  return (
                    <TableRow 
                      key={review.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onSelectEmployee(review.employeeId)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {review.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{review.employeeName}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{review.department}</TableCell>
                      <TableCell>{formatShortDate(review.reviewDate)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <StarRating rating={review.overallRating} />
                          {getRatingBadge(review.overallRating)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="text-sm">{completedGoals}/{totalGoals} goals</div>
                          <Progress value={goalsProgress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(review.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {canManageReviews && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditReview(review)
                              }}
                              className="gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {paginatedReviews.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No performance reviews found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}