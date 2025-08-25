import { useState, useCallback } from 'react'
import { authApi } from '@/lib/api/invites'

interface RegistrationState {
  step: 'invite-code' | 'personal-info' | 'otp-verification' | 'password-setup' | 'complete'
  inviteCode: string
  departmentId: string
  departmentName: string
  firstName: string
  lastName: string
  email: string
  otpVerified: boolean
}

interface UseAuthReturn {
  registrationState: RegistrationState
  loading: boolean
  error: string | null
  verifyInviteCode: (code: string) => Promise<boolean>
  startRegistration: (data: { firstName: string; lastName: string; email: string }) => Promise<boolean>
  verifyOtp: (otp: string) => Promise<boolean>
  setPassword: (password: string, confirmPassword: string) => Promise<{ token: string; user: any }>
  login: (email: string, password: string) => Promise<{ token: string; user: any }>
  resetState: () => void
}

export function useAuth(): UseAuthReturn {
  const [registrationState, setRegistrationState] = useState<RegistrationState>({
    step: 'invite-code',
    inviteCode: '',
    departmentId: '',
    departmentName: '',
    firstName: '',
    lastName: '',
    email: '',
    otpVerified: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyInviteCode = useCallback(async (code: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authApi.verifyInviteCode(code)
      
      if (result.valid) {
        setRegistrationState(prev => ({
          ...prev,
          step: 'personal-info',
          inviteCode: result.invite_code,
          departmentId: result.department_id,
          departmentName: result.department_name
        }))
        return true
      } else {
        setError(result.message || 'Invalid invite code')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify invite code')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const startRegistration = useCallback(async (data: { 
    firstName: string
    lastName: string
    email: string 
  }): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authApi.startRegistration({
        invite_code: registrationState.inviteCode,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email
      })
      
      if (result.otp_sent) {
        setRegistrationState(prev => ({
          ...prev,
          step: 'otp-verification',
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        }))
        return true
      } else {
        setError('Failed to send OTP')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start registration')
      return false
    } finally {
      setLoading(false)
    }
  }, [registrationState.inviteCode])

  const verifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authApi.verifyOtp(otp)
      
      if (result.email_verified) {
        setRegistrationState(prev => ({
          ...prev,
          step: 'password-setup',
          otpVerified: true
        }))
        return true
      } else {
        setError('Invalid OTP')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const setPassword = useCallback(async (
    password: string, 
    confirmPassword: string
  ): Promise<{ token: string; user: any }> => {
    try {
      setLoading(true)
      setError(null)
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      const result = await authApi.setPassword({
        password,
        confirm_password: confirmPassword
      })
      
      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }
      
      setRegistrationState(prev => ({
        ...prev,
        step: 'complete'
      }))
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set password')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (
    email: string, 
    password: string
  ): Promise<{ token: string; user: any }> => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authApi.login({ email, password })
      
      // Store token in localStorage
      if (result.token) {
        localStorage.setItem('authToken', result.token)
      }
      
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetState = useCallback(() => {
    setRegistrationState({
      step: 'invite-code',
      inviteCode: '',
      departmentId: '',
      departmentName: '',
      firstName: '',
      lastName: '',
      email: '',
      otpVerified: false
    })
    setError(null)
  }, [])

  return {
    registrationState,
    loading,
    error,
    verifyInviteCode,
    startRegistration,
    verifyOtp,
    setPassword,
    login,
    resetState
  }
}
