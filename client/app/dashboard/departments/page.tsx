"use client"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/providers/auth-provider"
import { AdminOnlyRoute } from "@/components/auth/protected-route"
import { AccountRole } from "@/lib/validation/auth-schemas"

// Import skeleton for loading state
const SkeletonPage = dynamic(
  () => import("./departments/components/skeletons").then(mod => ({ default: mod.SkeletonPage })),
  { ssr: false }
)

// Lazy load the main component for better performance
const DepartmentsManagement = dynamic(
  () => import("./departments/DepartmentsManagement").then(mod => ({ default: mod.DepartmentsManagement })),
  {
    loading: () => <SkeletonPage />,
    ssr: false, // Disable SSR for this component
  }
)

const DepartmentsPage = () => {
  const [isClient, setIsClient] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  // Ensure we're on the client side to prevent SSR issues
  useEffect(() => {
    setIsClient(true)

    // Debug: Check authentication status
    console.log('🔍 Departments Page: Auth status:', {
      isAuthenticated,
      userRole: user?.accountRole,
      isLoading
    })
  }, [isAuthenticated, user, isLoading])

  // Get user role from authentication context
  const userRole = user?.accountRole || AccountRole.ADMIN

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <AdminOnlyRoute>
      <DepartmentsManagement userRole={userRole} />
    </AdminOnlyRoute>
  )
}

export default DepartmentsPage
