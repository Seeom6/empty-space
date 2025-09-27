"use client"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/providers/auth-provider"
import { AdminOnlyRoute } from "@/components/auth/protected-route"
import { AccountRole } from "@/lib/validation/auth-schemas"
import { ErrorBoundary } from "@/components/ErrorBoundary"

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
  }, [isAuthenticated, user, isLoading])

  // Get user role from authentication context
  const userRole = user?.accountRole || AccountRole.EMPLOYEE

  // Don't render until we're on the client side
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <AdminOnlyRoute>
      <ErrorBoundary>
        <PositionsManagement
          userRole={userRole}
          viewMode="grid"
          onViewModeChange={() => {}}
        />
      </ErrorBoundary>
    </AdminOnlyRoute>
  )
}

export default PositionsPage
