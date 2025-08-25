'use client'

import React from 'react'
import { ProjectManagement } from '../components/projects/ProjectManagement'

export default function ProjectsPage() {
  // Mock user role - in real app, this would come from auth context
  const userRole = 'Admin'

  return (
    <div className="p-6">
      <ProjectManagement userRole={userRole} />
    </div>
  )
}
