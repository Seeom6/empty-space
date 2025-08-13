"use client"

import React from 'react'
import { PerformanceDashboard } from '../components/performance/PerformanceDashboard'

const page = () => {
  const userRole = "Admin"

  const handleSelectEmployee = (employeeId: string) => {
    console.log('Selected employee:', employeeId)
  }

  const handleCreateReview = () => {
    console.log('Create review')
  }

  const handleEditReview = (review: any) => {
    console.log('Edit review:', review)
  }

  return (
    <div>
      <PerformanceDashboard
        userRole={userRole}
        onSelectEmployee={handleSelectEmployee}
        onCreateReview={handleCreateReview}
        onEditReview={handleEditReview}
      />
    </div>
  )
}

export default page