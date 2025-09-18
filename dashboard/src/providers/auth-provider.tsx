'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  AuthContextType,
  LoginRequest,
  UserRegistrationRequest,
  EmployeeRegistrationRequest,
  AdminLoginRequest,
  AuthFlowState,
} from '@/lib/types/auth';
import {
  useLogin,
  useAdminLogin,
  useUserRegistration,
  useEmployeeRegistration,
  useSendOTP,
  useVerifyOTP,
  useVerifyResetOTP,
  useResetPassword,
  useRefreshToken,
  useLogout,
  useAuthStatus,
} from '@/lib/hooks/use-auth';
import authApiClient from '@/lib/api/auth-client';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  flowState: AuthFlowState;
  otpToken: string | null;
  resetToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  
  // Local state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    flowState: AuthFlowState.IDLE,
    otpToken: null,
    resetToken: null,
  });

  // Mutations
  const loginMutation = useLogin();
  const adminLoginMutation = useAdminLogin();
  const userRegistrationMutation = useUserRegistration();
  const employeeRegistrationMutation = useEmployeeRegistration();
  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();
  const verifyResetOTPMutation = useVerifyResetOTP();
  const resetPasswordMutation = useResetPassword();
  const refreshTokenMutation = useRefreshToken();
  const logoutMutation = useLogout();

  // Auth status query
  const { data: user, isLoading: isUserLoading, error: userError } = useAuthStatus();

  // Update auth state when user data changes
  useEffect(() => {
    setAuthState(prev => ({
      ...prev,
      user: user || null,
      isAuthenticated: !!user,
      isLoading: isUserLoading,
      error: userError ? 'Failed to load user data' : null,
    }));
  }, [user, isUserLoading, userError]);

  // Auto-refresh token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authApiClient.getCurrentToken();
      if (token) {
        try {
          await refreshTokenMutation.mutateAsync();
        } catch (error) {
          // Token refresh failed, user needs to login again
          authApiClient.clearTokens();
        }
      }
    };

    initializeAuth();
  }, []);

  // Auth methods
  const login = async (credentials: LoginRequest): Promise<void> => {
    setAuthState(prev => ({ ...prev, flowState: AuthFlowState.LOGGING_IN, error: null }));
    
    try {
      await loginMutation.mutateAsync(credentials);
      setAuthState(prev => ({ ...prev, flowState: AuthFlowState.IDLE }));
      router.push('/dashboard');
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.IDLE,
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const adminLogin = async (credentials: AdminLoginRequest): Promise<void> => {
    setAuthState(prev => ({ ...prev, flowState: AuthFlowState.LOGGING_IN, error: null }));
    
    try {
      await adminLoginMutation.mutateAsync(credentials);
      setAuthState(prev => ({ ...prev, flowState: AuthFlowState.IDLE }));
      router.push('/dashboard');
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.IDLE,
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const registerUser = async (data: UserRegistrationRequest): Promise<string> => {
    setAuthState(prev => ({ ...prev, flowState: AuthFlowState.REGISTERING, error: null }));
    
    try {
      const response = await userRegistrationMutation.mutateAsync(data);
      const otpToken = response.accessToken; // The access token is used for OTP verification
      
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.VERIFYING_OTP,
        otpToken 
      }));
      
      return otpToken;
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.IDLE,
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const registerEmployee = async (data: EmployeeRegistrationRequest): Promise<string> => {
    setAuthState(prev => ({ ...prev, flowState: AuthFlowState.REGISTERING, error: null }));
    
    try {
      const response = await employeeRegistrationMutation.mutateAsync(data);
      const otpToken = response.data; // OTP token for verification
      
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.VERIFYING_OTP,
        otpToken 
      }));
      
      return otpToken;
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.IDLE,
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const sendOTP = async (email: string): Promise<string> => {
    try {
      const response = await sendOTPMutation.mutateAsync(email);
      const otpToken = response.data;
      
      setAuthState(prev => ({ ...prev, otpToken }));
      return otpToken;
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const verifyOTP = async (otp: string, token?: string): Promise<void> => {
    const verificationToken = token || authState.otpToken;
    if (!verificationToken) {
      throw new Error('No OTP token available');
    }

    try {
      await verifyOTPMutation.mutateAsync({ otp, token: verificationToken });
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.IDLE,
        otpToken: null 
      }));
      router.push('/dashboard');
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const verifyResetOTP = async (otp: string, token?: string): Promise<string> => {
    const verificationToken = token || authState.otpToken;
    if (!verificationToken) {
      throw new Error('No OTP token available');
    }

    try {
      const response = await verifyResetOTPMutation.mutateAsync({ otp, token: verificationToken });
      const resetToken = response.token;
      
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.UPDATING_PASSWORD,
        resetToken,
        otpToken: null 
      }));
      
      return resetToken;
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const resetPassword = async (otp: string, newPassword: string, token?: string): Promise<void> => {
    const resetToken = token || authState.resetToken;
    if (!resetToken) {
      throw new Error('No reset token available');
    }

    try {
      await resetPasswordMutation.mutateAsync({ otp, newPassword, token: resetToken });
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.IDLE,
        resetToken: null 
      }));
      router.push('/auth/login');
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const refreshToken = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, flowState: AuthFlowState.REFRESHING_TOKEN }));
    
    try {
      await refreshTokenMutation.mutateAsync();
      setAuthState(prev => ({ ...prev, flowState: AuthFlowState.IDLE }));
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        flowState: AuthFlowState.IDLE,
        error: authApiClient.getErrorMessage(error)
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, flowState: AuthFlowState.LOGGING_OUT }));
    
    try {
      await logoutMutation.mutateAsync();
    } finally {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        flowState: AuthFlowState.IDLE,
        otpToken: null,
        resetToken: null,
      });
      router.push('/auth/login');
    }
  };

  const clearError = (): void => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    adminLogin,
    registerUser,
    registerEmployee,
    verifyOTP,
    sendOTP,
    verifyResetOTP,
    resetPassword,
    refreshToken,
    logout,
    clearError,
    error: authState.error,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
