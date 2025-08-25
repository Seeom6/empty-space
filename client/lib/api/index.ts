// Main API exports - Single entry point for all API functionality

// Internal imports for authApi compatibility layer
import { AuthService } from './services/authService';

// Types
export * from './types';

// HTTP Client
export { 
  apiClient, 
  setAuthToken, 
  ApiError, 
  handleApiError, 
  apiRequest, 
  healthCheck 
} from './client';

// Services
export { AuthService } from './services/authService';
export { TechnologyService } from './services/technologyService';
export { DepartmentService } from './services/departmentService';
export { PositionService } from './services/positionService';

// React Query Hooks - Technology
export {
  useTechnologyStatistics,
  useTechnologies,
  useTechnology,
  useActiveTechnologies,
  useCreateTechnology,
  useUpdateTechnology,
  useDeleteTechnology,
  useSearchTechnologies,
  useTechnologiesByCategory,
} from './hooks/useTechnology';

// React Query Hooks - Department
export {
  useDepartments,
  useDepartment,
  useActiveDepartments,
  useDepartmentStatistics,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useSearchDepartments,
  useDepartmentNameExists,
  useBulkUpdateDepartmentStatus,
} from './hooks/useDepartment';

// React Query Hooks - Position
export {
  usePositions,
  usePosition,
  useActivePositions,
  usePositionsByDepartment,
  usePositionStatistics,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
  useSearchPositions,
  usePositionNameExists,
  useBulkUpdatePositionStatus,
} from './hooks/usePosition';

// Re-export commonly used types for convenience
export type {
  Technology,
  Department,
  Position,
  PositionWithDepartment,
  TechnologyStatistics,
  CreateTechnologyRequest,
  UpdateTechnologyRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreatePositionRequest,
  UpdatePositionRequest,
  ApiErrorResponse,
  Status,
  // Auth types
  User,
  LoginRequest,
  LoginResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  SignInRequest,
  SignInResponse,
  RefreshTokenResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  AuthErrorCodes,
} from './types';

// Auth API compatibility layer - updated to match API_AUTHENTICATION.md
export const authApi = {
  // Regular login endpoint (POST /auth/log-in) - DISABLED FOR NOW
  login: (_credentials: any) => {
    console.log('🚫 Regular login is temporarily disabled');
    return Promise.reject(new Error('Regular login is temporarily disabled'));
  },

  // Admin login endpoint (POST /admin/auth/login) - MAIN LOGIN METHOD
  adminLogin: (credentials: any) => {
    console.log('🔗 authApi.adminLogin called with:', credentials);
    return AuthService.adminLogin(credentials).then(data => {
      console.log('🔗 authApi.adminLogin received from AuthService:', data);
      const wrappedData = { data };
      console.log('🔗 authApi.adminLogin returning wrapped data:', wrappedData);
      return wrappedData;
    });
  },

  // TEMPORARILY DISABLED - Non-login methods commented out for now

  // Sign-in/Registration (POST /auth/sign-in) - DISABLED
  signIn: (_data: any) => {
    console.log('🚫 SignIn is temporarily disabled');
    return Promise.reject(new Error('SignIn is temporarily disabled'));
  },

  // Seller sign-in (POST /auth/seller-sign-in) - DISABLED
  sellerSignIn: (_data: any) => {
    console.log('🚫 SellerSignIn is temporarily disabled');
    return Promise.reject(new Error('SellerSignIn is temporarily disabled'));
  },

  // Verify OTP (POST /auth/verify-otp) - DISABLED
  verifyOTP: (_otp: string) => {
    console.log('🚫 VerifyOTP is temporarily disabled');
    return Promise.reject(new Error('VerifyOTP is temporarily disabled'));
  },

  // Verify Reset OTP (POST /auth/verify-reset-otp) - DISABLED
  verifyResetOTP: (_otp: string) => {
    console.log('🚫 VerifyResetOTP is temporarily disabled');
    return Promise.reject(new Error('VerifyResetOTP is temporarily disabled'));
  },

  // Reset password (POST /auth/reset-password) - DISABLED
  resetPassword: (_otp: string, _newPassword: string) => {
    console.log('🚫 ResetPassword is temporarily disabled');
    return Promise.reject(new Error('ResetPassword is temporarily disabled'));
  },

  // Token refresh (POST /auth/refresh)
  refreshToken: () =>
    AuthService.refreshToken().then(data => ({ data })),

  // Logout (POST /auth/log-out)
  logout: () =>
    AuthService.logout().then(() => ({ data: {} })),

  // Get user profile (if endpoint exists)
  me: () =>
    AuthService.me().then(data => ({ data })),

  // Legacy compatibility methods (deprecated - use new methods above)
  register: (_data: any) => {
    console.log('🚫 Legacy register is temporarily disabled');
    return Promise.reject(new Error('Legacy register is temporarily disabled'));
  },

  forgotPassword: (_email: string) => {
    console.log('🚫 ForgotPassword is temporarily disabled');
    return Promise.reject(new Error('ForgotPassword is temporarily disabled'));
  },

  // Legacy methods for backward compatibility - ALL DISABLED
  verifyInviteCode: (_invite_code: string) => {
    console.log('🚫 VerifyInviteCode is temporarily disabled');
    return Promise.reject(new Error('VerifyInviteCode is temporarily disabled'));
  },

  startRegistration: (_data: any) => {
    console.log('🚫 StartRegistration is temporarily disabled');
    return Promise.reject(new Error('StartRegistration is temporarily disabled'));
  },

  setPassword: (_data: any) => {
    console.log('🚫 SetPassword is temporarily disabled');
    return Promise.reject(new Error('SetPassword is temporarily disabled'));
  },
};
