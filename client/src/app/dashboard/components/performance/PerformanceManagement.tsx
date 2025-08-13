'use client'

import React, { useState } from 'react'
import { PerformanceDashboard } from './PerformanceDashboard'
import { EmployeePerformanceProfile } from './EmployeePerformanceProfile'
import { CreateEditReviewModal } from './CreateEditReviewModal'
import { PerformanceReview } from './types'
import { getMockDataForRole } from './mockData'

interface PerformanceManagementProps {
  userRole: string
}

type ViewMode = 'dashboard' | 'profile'

// Mock employee and evaluator data
const mockEmployees = [
  { id: 'emp-1', name: 'John Doe', department: 'Engineering' },
  { id: 'emp-2', name: 'Jane Smith', department: 'Engineering' },
  { id: 'emp-3', name: 'Mike Johnson', department: 'Design' },
  { id: 'emp-4', name: 'Sarah Wilson', department: 'Design' },
  { id: 'emp-5', name: 'David Brown', department: 'Marketing' },
  { id: 'emp-6', name: 'Lisa Garcia', department: 'Marketing' },
  { id: 'emp-7', name: 'Alex Chen', department: 'Engineering' },
  { id: 'emp-8', name: 'Emma Davis', department: 'HR' }
]

const mockEvaluators = [
  { id: 'emp-2', name: 'Jane Smith' },
  { id: 'emp-4', name: 'Sarah Wilson' },
  { id: 'emp-6', name: 'Lisa Garcia' },
  { id: 'emp-9', name: 'Robert Taylor' },
  { id: 'emp-10', name: 'Michael Chen' }
]

export function PerformanceManagement({ userRole }: PerformanceManagementProps) {
  const mockData = getMockDataForRole(userRole)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null)

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setViewMode('profile')
  }

  const handleCreateReview = () => {
    setEditingReview(null)
    setIsCreateModalOpen(true)
  }

  const handleEditReview = (review: PerformanceReview) => {
    setEditingReview(review)
    setIsCreateModalOpen(true)
  }

  const handleSaveReview = (reviewData: Partial<PerformanceReview>) => {
    // In a real app, this would save to the backend
    console.log('Saving review:', reviewData)
    setIsCreateModalOpen(false)
    setEditingReview(null)
  }

  const handleBackToDashboard = () => {
    setSelectedEmployeeId(null)
    setViewMode('dashboard')
  }

  // Check permissions
  const canAccessPerformance = userRole === 'Admin' || userRole === 'HR' || userRole === 'Manager' || userRole === 'Employee'

  if (!canAccessPerformance) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2>Access Restricted</h2>
          <p className="text-muted-foreground mt-2">
            You don't have permission to access performance management.
          </p>
        </div>
      </div>
    )
  }

  // Employee view - only their own performance data
  if (userRole === 'Employee') {
    return (
      <div className="p-6">
        <EmployeePerformanceProfile
          employeeId="emp-1" // In real app, this would be current user's ID
          onBack={() => {}} // No back button for employees
          onEditReview={() => {}} // Employees can't edit reviews
          userRole={userRole}
        />
        
        <CreateEditReviewModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveReview}
          review={editingReview || undefined}
          employees={mockEmployees}
          evaluators={mockEvaluators}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      {viewMode === 'profile' && selectedEmployeeId ? (
        <EmployeePerformanceProfile
          employeeId={selectedEmployeeId}
          onBack={handleBackToDashboard}
          onEditReview={handleEditReview}
          userRole={userRole}
        />
      ) : (
        <PerformanceDashboard
          onSelectEmployee={handleSelectEmployee}
          onCreateReview={handleCreateReview}
          onEditReview={handleEditReview}
          userRole={userRole}
        />
      )}

      <CreateEditReviewModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveReview}
        review={editingReview || undefined}
        employees={mockEmployees}
        evaluators={mockEvaluators}
      />
    </div>
  )
}