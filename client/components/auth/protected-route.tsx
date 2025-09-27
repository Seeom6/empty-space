'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { Loader2 } from 'lucide-react';
import { AccountRole } from '@/lib/validation/auth-schemas';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: AccountRole[];
  fallbackComponent?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
  allowedRoles,
  fallbackComponent,
}) => {
  const { user, isAuthenticated, isLoading, authCheckCompleted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after auth check is completed to prevent race conditions
    if (!isLoading && authCheckCompleted) {
      if (requireAuth && !isAuthenticated) {
        console.log('🔄 PROTECTED ROUTE: Redirecting to login - user not authenticated');
        router.push(redirectTo);
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.accountRole as AccountRole)) {
        console.log('🔄 PROTECTED ROUTE: Redirecting to unauthorized - insufficient role', {
          userRole: user.accountRole,
          allowedRoles,
          hasRole: allowedRoles.includes(user.accountRole as AccountRole)
        });
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, isLoading, authCheckCompleted, user, requireAuth, allowedRoles, router, redirectTo]);

  // Show loading while auth check is in progress
  if (isLoading || !authCheckCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return fallbackComponent || null; // Will redirect in useEffect
  }

  if (allowedRoles && user && !allowedRoles.includes(user.accountRole as AccountRole)) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this resource.</p>
          <p className="text-sm text-gray-500 mt-2">Current role: {user.accountRole}</p>
          <p className="text-sm text-gray-500">Required roles: {allowedRoles.join(', ')}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, isLoading, authCheckCompleted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && authCheckCompleted && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, authCheckCompleted, router, redirectTo]);

  if (isLoading || !authCheckCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

// Helper components for common role-based protection scenarios
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[AccountRole.ADMIN, AccountRole.SUPER_ADMIN]}>
    {children}
  </ProtectedRoute>
);

export const SuperAdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[AccountRole.SUPER_ADMIN]}>
    {children}
  </ProtectedRoute>
);

export const EmployeeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={[AccountRole.EMPLOYEE, AccountRole.ADMIN, AccountRole.SUPER_ADMIN]}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
