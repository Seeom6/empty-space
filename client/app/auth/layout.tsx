import React from 'react'
import { PublicRoute } from '@/components/auth/protected-route'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </PublicRoute>
  )
}
