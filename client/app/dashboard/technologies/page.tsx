"use client"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/providers/auth-provider"

// Import skeleton for loading state
const SkeletonPage = dynamic(
  () => import("./technologies/components/skeletons").then(mod => ({ default: mod.SkeletonPage })),
  { ssr: false }
)

// Lazy load the main component for better performance
const TechnologiesManagement = dynamic(
  () => import("./technologies/TechnologiesManagement").then(mod => ({ default: mod.TechnologiesManagement })),
  {
    loading: () => <SkeletonPage />,
    ssr: false, // Disable SSR for this component
  }
)

const TechnologiesPage = () => {
  const [isClient, setIsClient] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  // Ensure we're on the client side to prevent SSR issues
  useEffect(() => {
    setIsClient(true)

    // Debug: Check authentication status
    console.log('🔍 Technologies Page: Auth status:', {
      isAuthenticated,
      userRole: user?.accountRole,
      isLoading
    })
  }, [isAuthenticated, user, isLoading])

  // Get user role from authentication context
  // For the Technologies system, SUPER_ADMIN role is required according to API documentation
  const userRole = user?.accountRole || "SUPER_ADMIN"

  // Don't render until we're on the client side
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground">Please log in to access the technologies management system.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <TechnologiesManagement userRole={userRole} />
    </div>
  )
}

export default TechnologiesPage