'use client'

import React from 'react'
import { RBACManagement } from '../components/rbac'

export default function RBACPage() {
  // In a real app, this would come from auth context
  const userRole = 'Admin'

  return <RBACManagement userRole={userRole} />
}
