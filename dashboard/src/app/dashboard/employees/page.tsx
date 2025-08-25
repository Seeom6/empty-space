'use client'

import React from 'react'
import { EmployeeManagement } from '../components/employees/EmployeeManagement'

export default function ProjectsPage() {
  // Mock user role - in real app, this would come from auth context
  const userRole = 'Admin'

  return (
    <div className="p-6">
      <EmployeeManagement userRole={userRole} />
    </div>
  )
}