"use client"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/providers/auth-provider"

// Dynamically import the main component to reduce initial bundle size
const PositionsManagement = dynamic(
  () => import("./positions/PositionsManagement").then(mod => ({ default: mod.PositionsManagement })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading Position Management...</div>
      </div>
    )
  }
)

const PositionsPage = () => {
  const [isClient, setIsClient] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  // Ensure we're on the client side to prevent SSR issues
  useEffect(() => {
    setIsClient(true)

    // Debug: Check authentication status
    console.log('🔍 Positions Page: Auth status:', {
      isAuthenticated,
      userRole: user?.accountRole,
      isLoading,
      user: user
    })

    // Check cookies
    if (typeof document !== 'undefined') {
      console.log('🍪 Current cookies:', document.cookie)
    }
  }, [isAuthenticated, user, isLoading])

  // Get user role from authentication context
  // For the Positions system, SUPER_ADMIN role is required according to API documentation
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
          <p className="text-muted-foreground">Please log in to access the position management system.</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Check permissions - only SUPER_ADMIN and ADMIN can access position management
  if (!['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access the position management system.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Required role: SUPER_ADMIN or ADMIN (Current: {userRole})
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <PositionsManagement
        userRole={userRole}
        viewMode="list"
        onViewModeChange={(mode) => {
          console.log('View mode changed to:', mode)
        }}
      />
    </div>
  )
}

export default PositionsPage
