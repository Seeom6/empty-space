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
  ApiError as ApiErrorType,
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
  // Regular login endpoint (POST /auth/log-in)
  login: (credentials: LoginRequest) =>
    AuthService.login(credentials).then(data => ({ data })),

  // Admin login endpoint (POST /admin/auth/login)
  adminLogin: (credentials: AdminLoginRequest) => {
    console.log('🔗 authApi.adminLogin called with:', credentials);
    return AuthService.adminLogin(credentials).then(data => {
      console.log('🔗 authApi.adminLogin received from AuthService:', data);
      const wrappedData = { data };
      console.log('🔗 authApi.adminLogin returning wrapped data:', wrappedData);
      return wrappedData;
    });
  },

  // Sign-in/Registration (POST /auth/sign-in)
  signIn: (data: SignInRequest) =>
    AuthService.signIn(data).then(data => ({ data })),

  // Seller sign-in (POST /auth/seller-sign-in)
  sellerSignIn: (data: SignInRequest) =>
    AuthService.sellerSignIn(data).then(data => ({ data })),

  // Verify OTP (POST /auth/verify-otp)
  verifyOTP: (otp: string) =>
    AuthService.verifyOTP({ otp }).then(data => ({ data })),

  // Verify Reset OTP (POST /auth/verify-reset-otp)
  verifyResetOTP: (otp: string) =>
    AuthService.verifyResetOTP({ otp }).then(data => ({ data })),

  // Reset password (POST /auth/reset-password)
  resetPassword: (otp: string, newPassword: string) =>
    AuthService.resetPassword({ otp, newPassword }).then(data => ({ data })),

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
  register: (data: any) => {
    console.warn('authApi.register is deprecated. Use authApi.signIn instead.');
    return AuthService.signIn({
      phoneNumber: data.phoneNumber || '',
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      accountRole: data.accountRole || 'user'
    }).then(data => ({ data }));
  },

  forgotPassword: (email: string) => {
    console.warn('authApi.forgotPassword is not implemented in the current API. Use OTP-based password reset instead.');
    return Promise.reject(new Error('Forgot password by email is not supported. Use OTP-based reset.'));
  },

  // Legacy methods for backward compatibility
  verifyInviteCode: (invite_code: string) => {
    console.warn('authApi.verifyInviteCode is deprecated. This functionality is not in the current API.');
    return Promise.reject(new Error('Invite code verification is not supported in the current API.'));
  },

  startRegistration: (data: any) => {
    console.warn('authApi.startRegistration is deprecated. Use authApi.signIn instead.');
    return Promise.reject(new Error('Use authApi.signIn for registration.'));
  },

  setPassword: (data: any) => {
    console.warn('authApi.setPassword is deprecated. Use authApi.resetPassword instead.');
    return Promise.reject(new Error('Use authApi.resetPassword for password changes.'));
  },
};
