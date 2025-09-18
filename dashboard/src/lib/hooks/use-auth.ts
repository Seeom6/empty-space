import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import authApiClient from '../api/auth-client';
import {
  LoginRequest,
  UserRegistrationRequest,
  EmployeeRegistrationRequest,
  AdminLoginRequest,
  AuthErrorCode,
  User,
} from '../types/auth';

// Query Keys
export const AUTH_QUERY_KEYS = {
  user: ['auth', 'user'] as const,
  profile: ['auth', 'profile'] as const,
} as const;

// Custom hook for login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApiClient.login(credentials),
    onSuccess: (data) => {
      toast.success('Login successful!');
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      const errorMessage = authApiClient.getErrorMessage(error);

      switch (errorCode) {
        case AuthErrorCode.INVALID_CREDENTIALS:
          toast.error('Invalid email or password');
          break;
        case AuthErrorCode.ACCOUNT_NOT_FOUND:
          toast.error('Account not found');
          break;
        default:
          toast.error(errorMessage || 'Login failed');
      }
    },
  });
};

// Custom hook for admin login
export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: AdminLoginRequest) => authApiClient.adminLogin(credentials),
    onSuccess: (data) => {
      toast.success('Admin login successful!');
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      const errorMessage = authApiClient.getErrorMessage(error);

      switch (errorCode) {
        case AuthErrorCode.INVALID_CREDENTIALS:
          toast.error('Invalid admin credentials');
          break;
        default:
          toast.error(errorMessage || 'Admin login failed');
      }
    },
  });
};

// Custom hook for user registration
export const useUserRegistration = () => {
  return useMutation({
    mutationFn: (data: UserRegistrationRequest) => authApiClient.registerUser(data),
    onSuccess: () => {
      toast.success('Registration successful! Please verify your email.');
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      const errorMessage = authApiClient.getErrorMessage(error);

      switch (errorCode) {
        case AuthErrorCode.USER_ALREADY_EXISTS:
          toast.error('An account with this email or phone number already exists');
          break;
        case AuthErrorCode.VALIDATION_ERROR:
          toast.error('Please check your information and try again');
          break;
        default:
          toast.error(errorMessage || 'Registration failed');
      }
    },
  });
};

// Custom hook for employee registration
export const useEmployeeRegistration = () => {
  return useMutation({
    mutationFn: (data: EmployeeRegistrationRequest) => authApiClient.registerEmployee(data),
    onSuccess: () => {
      toast.success('Employee registration successful! Please verify your email.');
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      const errorMessage = authApiClient.getErrorMessage(error);

      switch (errorCode) {
        case AuthErrorCode.USER_ALREADY_EXISTS:
          toast.error('An account with this email already exists');
          break;
        case AuthErrorCode.INVITE_CODE_NOT_FOUND:
          toast.error('Invalid invite code');
          break;
        case AuthErrorCode.INVITE_CODE_USED:
          toast.error('This invite code has already been used');
          break;
        default:
          toast.error(errorMessage || 'Employee registration failed');
      }
    },
  });
};

// Custom hook for sending OTP
export const useSendOTP = () => {
  return useMutation({
    mutationFn: (email: string) => authApiClient.sendOTP({ email }),
    onSuccess: () => {
      toast.success('OTP sent to your email!');
    },
    onError: (error: any) => {
      const errorMessage = authApiClient.getErrorMessage(error);
      toast.error(errorMessage || 'Failed to send OTP');
    },
  });
};

// Custom hook for verifying OTP
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ otp, token }: { otp: string; token?: string }) =>
      authApiClient.verifyOTP({ otp }, token),
    onSuccess: () => {
      toast.success('Email verified successfully!');
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      const errorMessage = authApiClient.getErrorMessage(error);

      switch (errorCode) {
        case AuthErrorCode.INVALID_OTP:
          toast.error('Invalid OTP code');
          break;
        case AuthErrorCode.OTP_EXPIRED:
          toast.error('OTP has expired. Please request a new one.');
          break;
        default:
          toast.error(errorMessage || 'OTP verification failed');
      }
    },
  });
};

// Custom hook for verifying reset OTP
export const useVerifyResetOTP = () => {
  return useMutation({
    mutationFn: ({ otp, token }: { otp: string; token?: string }) =>
      authApiClient.verifyResetOTP({ otp }, token),
    onSuccess: () => {
      toast.success('OTP verified! You can now reset your password.');
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      const errorMessage = authApiClient.getErrorMessage(error);

      switch (errorCode) {
        case AuthErrorCode.INVALID_OTP:
          toast.error('Invalid OTP code');
          break;
        case AuthErrorCode.OTP_EXPIRED:
          toast.error('OTP has expired. Please request a new one.');
          break;
        default:
          toast.error(errorMessage || 'OTP verification failed');
      }
    },
  });
};

// Custom hook for resetting password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ otp, newPassword, token }: { otp: string; newPassword: string; token?: string }) =>
      authApiClient.resetPassword({ otp, newPassword }, token),
    onSuccess: () => {
      toast.success('Password reset successfully! Please login with your new password.');
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      const errorMessage = authApiClient.getErrorMessage(error);

      switch (errorCode) {
        case AuthErrorCode.OTP_VERIFICATION_FAILED:
          toast.error('OTP verification failed');
          break;
        default:
          toast.error(errorMessage || 'Password reset failed');
      }
    },
  });
};

// Custom hook for token refresh
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApiClient.refreshToken(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.user });
    },
    onError: (error: any) => {
      const errorCode = authApiClient.getErrorCode(error);
      
      switch (errorCode) {
        case AuthErrorCode.EXPIRED_REFRESH_TOKEN:
        case AuthErrorCode.REFRESH_TOKEN_NOT_IN_REDIS:
          // Clear tokens and redirect to login
          authApiClient.clearTokens();
          queryClient.clear();
          toast.error('Session expired. Please login again.');
          break;
        default:
          toast.error('Failed to refresh session');
      }
    },
  });
};

// Custom hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApiClient.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: () => {
      // Even if logout fails, clear local data
      authApiClient.clearTokens();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
};

// Custom hook for authentication status
export const useAuthStatus = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.user,
    queryFn: async (): Promise<User | null> => {
      const token = authApiClient.getCurrentToken();
      if (!token) {
        return null;
      }

      // Here you would typically make an API call to get user profile
      // For now, we'll return a basic user object based on token existence
      // This should be replaced with actual user profile API call
      return {
        accountId: 'temp-id',
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Name',
        accountRole: 'user' as any,
        isActive: true,
        isVerified: true,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Utility hooks
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useAuthStatus();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

export const useAuthError = () => {
  const refreshToken = useRefreshToken();

  const handleAuthError = async (error: any) => {
    const errorCode = authApiClient.getErrorCode(error);

    if (errorCode === AuthErrorCode.EXPIRED_ACCESS_TOKEN) {
      try {
        await refreshToken.mutateAsync();
        return true; // Token refreshed successfully
      } catch (refreshError) {
        return false; // Refresh failed
      }
    }

    return false; // Not an auth error or refresh not needed
  };

  return { handleAuthError };
};
