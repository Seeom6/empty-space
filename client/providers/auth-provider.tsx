'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi, User, setAuthToken } from '@/lib/api/index'
import { toast } from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (data: {
    phoneNumber: string
    firstName: string
    lastName: string
    password: string
    accountRole?: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  // TEMPORARILY DISABLED - RefreshUser function commented out for now
  const refreshUser = async () => {
    console.log('🚫 RefreshUser is temporarily disabled');
    // Simple loading state management for now
    setIsLoading(false)

    /* COMMENTED OUT FOR NOW - WILL BE ENABLED LATER
    try {
      const response = await authApi.me()
      setUser(response.data.user)
    } catch (error) {
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
    */
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('🔐 Login attempt with credentials:', credentials)

      // Use admin login for dashboard access (requires SUPER_ADMIN role)
      const response = await authApi.adminLogin(credentials)
      console.log('📥 Raw API response:', response)
      console.log('📦 Response data:', response.data)

      const { access_token } = response.data
      console.log('🔑 Extracted access_token:', access_token)

      localStorage.setItem('auth_token', access_token)
      setAuthToken(access_token) // Set token in API client headers immediately
      console.log('💾 Token saved to localStorage and set in API client')
      // Try to get user profile after successful login
      try {
        console.log('👤 Attempting to fetch user profile...')
        const userResponse = await authApi.me()
        console.log('👤 User profile response:', userResponse)
        setUser(userResponse.data.user)
        console.log('✅ User profile set:', userResponse.data.user)
      } catch (userError) {
        console.log('❌ User profile fetch failed:', userError)
        // If /auth/me doesn't exist, create a minimal user object
        const fallbackUser = {
          accountId: 'admin',
          accountRole: 'SUPER_ADMIN',
          isActive: true,
          email: credentials.email,
          isVerified: true,
        }
        console.log('🔄 Using fallback user:', fallbackUser)
        setUser(fallbackUser)
      }

      console.log('🎉 Login successful!')
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      console.log('💥 Login error occurred:', error)
      console.log('📄 Error response:', error.response)
      console.log('📊 Error data:', error.response?.data)

      const message = error.response?.data?.error?.message || error.response?.data?.message || 'Login failed'
      console.log('📢 Error message to show user:', message)

      toast.error(message)
      throw error
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
    console.log('🚫 Registration is temporarily disabled');
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

  // TEMPORARILY DISABLED - Logout function simplified for now
  const logout = async () => {
    console.log('🚫 Using simplified logout (API call disabled)');
    // Simple logout without API call for now
    localStorage.removeItem('auth_token')
    setAuthToken(null) // Clear token from API client headers
    setUser(null)
    toast.success('Logged out successfully')
    router.push('/auth/login')

    /* COMMENTED OUT FOR NOW - WILL BE ENABLED LATER
    try {
      await authApi.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('auth_token')
      setUser(null)
      toast.success('Logged out successfully')
      router.push('/auth/login')
    }
    */
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
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
