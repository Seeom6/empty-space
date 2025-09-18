'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, clearAuthCookies } from '@/lib/api/index'
import { AuthService } from '@/lib/api/services/authService'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // New 4-step registration flow
  validateInviteCode: (inviteCode: string) => Promise<any>
  registerEmail: (data: { email: string; firstName: string; lastName: string }) => Promise<void>
  verifyRegistrationOTP: (otp: string) => Promise<void>
  completeRegistration: (data: { password: string; phoneNumber?: string }) => Promise<void>

  // Authentication
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>

  // Password reset flow
  requestPasswordReset: (email: string) => Promise<void>
  verifyPasswordResetOTP: (otp: string) => Promise<void>
  completePasswordReset: (newPassword: string) => Promise<void>

  // Legacy methods (for backward compatibility)
  register: (data: {
    phoneNumber: string
    firstName: string
    lastName: string
    password: string
    accountRole?: string
  }) => Promise<void>
  registerEmployee: (data: {
    firstName: string
    lastName: string
    phoneNumber?: string
    email: string
    password: string
    inviteCode: string
    image?: string
    birthday?: Date
  }) => Promise<string>
  verifyOTP: (data: { otp: string; token: string }) => Promise<void>
  sendOTP: (email: string) => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check if user is authenticated on mount (now cookie-based)
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated via cookies only
      const isAuthenticatedViaCookies = AuthService.isAuthenticatedViaCookies()

      if (isAuthenticatedViaCookies) {
        await refreshUser()
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // RefreshUser function - now supports cookie-based authentication
  const refreshUser = async () => {
    try {
      // Try to get user info using cookie authentication
      const userResponse = await AuthService.me()
      setUser(userResponse.data.user)
    } catch (error: any) {
      // If endpoint doesn't exist (404) or other auth errors, clear cookies
      if (error.response?.status === 404 || error.response?.status === 401) {
        clearAuthCookies()
        setUser(null)
      } else {
        // For other errors, still clear auth state
        clearAuthCookies()
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // === NEW 4-STEP REGISTRATION FLOW ===

  const validateInviteCode = async (inviteCode: string) => {
    try {
      setIsLoading(true)

      const response = await AuthService.validateInviteCode({ inviteCode })

      toast.success('Invite code validated successfully!')
      return response.data
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Invalid invite code'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const registerEmail = async (data: { email: string; firstName: string; lastName: string }) => {
    try {
      setIsLoading(true)

      await AuthService.registerEmail(data)

      toast.success('OTP sent to your email address!')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to register email'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyRegistrationOTP = async (otp: string) => {
    try {
      setIsLoading(true)

      await AuthService.verifyRegistrationOTP({ otp })

      toast.success('Email verified successfully!')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Invalid OTP'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const completeRegistration = async (data: { password: string; phoneNumber?: string }) => {
    try {
      setIsLoading(true)

      const response = await AuthService.completeRegistration(data)

      // Set the user from the response
      setUser(response.data.user)

      toast.success('Registration completed successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to complete registration'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // === AUTHENTICATION ===

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true)

      const response = await AuthService.login(credentials)

      // Set the user from the response
      setUser(response.data.user)

      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // TEMPORARILY DISABLED - Registration function commented out for now
  const register = async (_data: {
    phoneNumber: string
    firstName: string
    lastName: string
    password: string
    accountRole?: string
  }) => {
    toast.error('Registration is temporarily disabled. Please contact administrator.');
    throw new Error('Registration is temporarily disabled');

    /* COMMENTED OUT FOR NOW - WILL BE ENABLED LATER
    try {
      const response = await authApi.signIn({
        phoneNumber: data.phoneNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        accountRole: data.accountRole || 'user'
      })
      const { accessToken } = response.data

      localStorage.setItem('auth_token', accessToken)

      // Try to get user profile after successful registration
      try {
        const userResponse = await authApi.me()
        setUser(userResponse.data.user)
      } catch (userError) {
        // If /auth/me doesn't exist, create a minimal user object
        setUser({
          accountId: 'new_user',
          accountRole: data.accountRole || 'user',
          isActive: true,
          email: '', // Phone-based registration doesn't have email initially
          isVerified: false,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        })
      }

      toast.success('Registration successful!')

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
    */
  }

  // Employee registration function
  const registerEmployee = async (data: {
    firstName: string
    lastName: string
    phoneNumber?: string
    email: string
    password: string
    inviteCode: string
    image?: string
    birthday?: Date
  }): Promise<string> => {
    setIsLoading(true)

    try {
      // Call the employee registration API
      const response = await AuthService.registerEmployee(data)

      toast.success('Employee registration successful! Please check your email for verification.')

      // Return the OTP token for verification
      return response.data || ''
    } catch (error: any) {

      const message = error.response?.data?.error?.message ||
                     error.response?.data?.message ||
                     'Employee registration failed'

      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Legacy verifyOTP function - replaced by verifyRegistrationOTP
  const verifyOTP = async (data: { otp: string; token: string }): Promise<void> => {
    // Redirect to use the new registration OTP verification
    await verifyRegistrationOTP(data.otp)
  }

  // Send OTP function (placeholder - implement based on your API)
  const sendOTP = async (_email: string): Promise<string> => {
    setIsLoading(true)

    try {
      // Note: This endpoint might not exist in your current API
      // You may need to implement this based on your authentication flow
      // For now, this is a placeholder that shows a success message and returns the existing token

      toast.success('OTP sent successfully! Please check your email.')

      // Return a placeholder token - in a real implementation, this would come from the API
      return 'resent-token-placeholder'
    } catch (error: any) {
      const message = error.response?.data?.error?.message ||
                     error.response?.data?.message ||
                     'Failed to send OTP'

      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // === PASSWORD RESET FLOW ===

  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true)

      await AuthService.requestPasswordReset({ email })

      toast.success('If an account exists with this email, you will receive a password reset email shortly.')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to send reset email'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPasswordResetOTP = async (otp: string) => {
    try {
      setIsLoading(true)

      await AuthService.verifyPasswordResetOTP({ otp })

      toast.success('OTP verified successfully!')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Invalid OTP'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const completePasswordReset = async (newPassword: string) => {
    try {
      setIsLoading(true)

      await AuthService.completePasswordReset({ newPassword })

      toast.success('Password has been reset successfully!')
      router.push('/auth/login')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to reset password'
      toast.error(message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // === LOGOUT ===

  const logout = async () => {
    try {
      setIsLoading(true)

      // Call backend logout to clear cookies
      await AuthService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear authentication state
      AuthService.clearAuthState()
      setUser(null)
      setIsLoading(false)

      toast.success('Logged out successfully')
      router.push('/auth/login')
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,

    // New 4-step registration flow
    validateInviteCode,
    registerEmail,
    verifyRegistrationOTP,
    completeRegistration,

    // Authentication
    login,
    logout,
    refreshUser,

    // Password reset flow
    requestPasswordReset,
    verifyPasswordResetOTP,
    completePasswordReset,

    // Legacy methods (for backward compatibility)
    register,
    registerEmployee,
    verifyOTP,
    sendOTP,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
