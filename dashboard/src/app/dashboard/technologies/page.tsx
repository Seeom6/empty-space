"use client"
import React, { useEffect, useState } from "react"
import { TechnologiesManagement } from "../components/technologies/TechnologiesManagement"

const TechnologiesPage = () => {
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side to prevent SSR issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Note: In a real application, you would get the user role from authentication context
  // For the Technologies system, SUPER_ADMIN role is required according to API documentation
  const userRole = "SUPER_ADMIN" // This should come from your auth context

  // Don't render until we're on the client side
  if (false) {
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