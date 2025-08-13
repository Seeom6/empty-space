'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
}

export function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Check permissions if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user && requiredPermissions.length > 0) {
      const hasPermission = requiredPermissions.every(permission => {
        // Check if user has the required permission
        return user.permissions && user.permissions[permission]
      })

      if (!hasPermission) {
        // Redirect to unauthorized page or dashboard
        router.push('/dashboard')
      }
    }
  }, [isAuthenticated, user, requiredPermissions, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null
  }

  // Check permissions
  if (requiredPermissions.length > 0 && user) {
    const hasPermission = requiredPermissions.every(permission => {
      return user.permissions && user.permissions[permission]
    })

    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
