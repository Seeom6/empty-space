"use client"
import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"

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

  // Ensure we're on the client side to prevent SSR issues
  useEffect(() => {
    setIsClient(true)

    // Debug: Check if auth token exists
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      console.log('🔍 Technologies Page: Auth token check:', token ? 'Token exists' : 'No token found')
      if (token) {
        console.log('🔍 Token preview:', token.substring(0, 20) + '...')
      }
    }
  }, [])

  // Note: In a real application, you would get the user role from authentication context
  // For the Technologies system, SUPER_ADMIN role is required according to API documentation
  const userRole = "SUPER_ADMIN" // This should come from your auth context

  // Don't render until we're on the client side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
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