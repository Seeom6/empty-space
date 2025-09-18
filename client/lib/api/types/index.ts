// API Types based on the documented API specifications

export type Status = "ACTIVE" | "INACTIVE";

// Technology System Types
export interface Technology {
  id: string;
  name: string;
  version: string;
  icon: string;
  website: string;
  status: Status;
  description: string;
  category: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TechnologyStatistics {
  count: Array<{ count: number }>;
  status: Array<{ status: Status; count: number }>;
}

export interface CreateTechnologyRequest {
  name: string;
  description: string;
  icon: string;
  website: string;
  version: string;
  category: string;
}

export interface UpdateTechnologyRequest {
  name: string;
  description: string;
  status: Status;
  icon: string;
  website: string;
  version: string;
  category: string;
}

// Department System Types
export interface Department {
  id: string;
  name: string;
  description?: string;
  status: Status;
  isDeleted: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  status?: Status;
}

export interface UpdateDepartmentRequest {
  name: string;
  description?: string;
  status?: Status;
}

// Position System Types
export interface Position {
  id: string;
  name: string;
  departmentId: string;
  description?: string;
  status: Status;
  isDeleted: boolean;
}

export interface PositionWithDepartment {
  id: string;
  name: string;
  description?: string;
  status: Status;
  department: string;
}

export interface CreatePositionRequest {
  name: string;
  departmentId: string;
  description?: string;
  status?: Status;
}

export interface UpdatePositionRequest {
  name: string;
  departmentId: string;
  description?: string;
  status?: Status;
}

// Error Response Types
export interface ApiErrorData {
  path: string;
  time: string;
  message: string;
  code: number;
  errorType: string;
}

export interface ApiErrorResponse {
  error: ApiErrorData;
}

// Error Codes
export enum ErrorCodes {
  // Technology Errors
  TECHNOLOGY_NOT_FOUND = 90000,
  TECHNOLOGY_ALREADY_EXISTS = 90001,
  
  // Department Errors
  DEPARTMENT_NOT_FOUND = 10000,
  DEPARTMENT_ALREADY_EXISTS = 10001,
  DEPARTMENT_HAS_POSITION = 10002,
  DEPARTMENT_HAS_EMPLOYEE = 10003,
  
  // Position Errors
  POSITION_NOT_FOUND = 11000,
  POSITION_ALREADY_EXISTS = 11001,
  
  // Validation Errors
  VALIDATION_ERROR = 70000,
  
  // Auth Errors
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  
  // Server Errors
  SERVER_ERROR = 500
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Query Keys for TanStack Query
export const QueryKeys = {
  // Technology queries
  TECHNOLOGY_STATISTICS: ['technology', 'statistics'] as const,
  TECHNOLOGY_ALL: ['technology', 'all'] as const,
  TECHNOLOGY_BY_ID: (id: string) => ['technology', 'detail', id] as const,
  
  // Department queries
  DEPARTMENT_ALL: ['department', 'all'] as const,
  DEPARTMENT_BY_ID: (id: string) => ['department', 'detail', id] as const,
  
  // Position queries
  POSITION_ALL: ['position', 'all'] as const,
  POSITION_BY_ID: (id: string) => ['position', 'detail', id] as const,
} as const;

// Mutation Keys for TanStack Query
export const MutationKeys = {
  // Technology mutations
  CREATE_TECHNOLOGY: 'createTechnology',
  UPDATE_TECHNOLOGY: 'updateTechnology',
  DELETE_TECHNOLOGY: 'deleteTechnology',
  
  // Department mutations
  CREATE_DEPARTMENT: 'createDepartment',
  UPDATE_DEPARTMENT: 'updateDepartment',
  DELETE_DEPARTMENT: 'deleteDepartment',
  
  // Position mutations
  CREATE_POSITION: 'createPosition',
  UPDATE_POSITION: 'updatePosition',
  DELETE_POSITION: 'deletePosition',
} as const;

// Authentication Types based on AUTHENTICATION_API_DOCUMENTATION.md

// Common Response Format
export interface AuthApiResponse<T = any> {
  data: T;
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface AuthErrorResponse {
  error: {
    code: number;
    message: string;
    type: string;
    timestamp: string;
    requestId: string;
    details?: {
      field?: string;
      retryAfter?: number;
      maxAttempts?: number;
      remainingAttempts?: number;
    };
  };
}

// User Profile Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  accountRole: 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN';
  isVerified: boolean;
  phoneNumber?: string;
  employee?: {
    position: {
      id: string;
      name: string;
    };
    department: {
      id: string;
      name: string;
    };
    privileges: Array<{
      id: string;
      name: string;
      description: string;
    }>;
    hireDate: string;
  };
  permissions?: Record<string, any>; // For backward compatibility
}

// Position and Department Types for Registration
export interface Position {
  id: string;
  name: string;
  department: {
    id: string;
    name: string;
  };
}

export interface Privilege {
  id: string;
  name: string;
  description: string;
}

// === 4-STEP REGISTRATION FLOW ===

// Step 1: Validate Invite Code (POST /auth/validate-invite-code)
export interface ValidateInviteCodeRequest {
  inviteCode: string;
}

export interface ValidateInviteCodeResponse {
  data: {
    position: Position;
    privileges: Privilege[];
  };
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Step 2: Register Email (POST /auth/register-email)
export interface RegisterEmailRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterEmailResponse {
  data: {};
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Step 3: Verify Registration OTP (POST /auth/verify-registration-otp)
export interface VerifyRegistrationOTPRequest {
  otp: string;
}

export interface VerifyRegistrationOTPResponse {
  data: {};
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Step 4: Complete Registration (POST /auth/complete-registration)
export interface CompleteRegistrationRequest {
  password: string;
  phoneNumber?: string;
}

export interface CompleteRegistrationResponse {
  data: {
    user: User;
  };
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// === AUTHENTICATION ENDPOINTS ===

// Login (POST /auth/log-in)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    user: User;
  };
  message: string;
}

// Refresh Token (POST /auth/refresh)
export interface RefreshTokenResponse {
  data: {
    user: User;
  };
  message: string;
}

// Logout (POST /auth/log-out)
export interface LogoutResponse {
  message: string;
}

// === PASSWORD RESET FLOW ===

// Step 1: Request Password Reset (POST /auth/request-password-reset)
export interface RequestPasswordResetRequest {
  email: string;
}

export interface RequestPasswordResetResponse {
  data: {};
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Step 2: Verify Password Reset OTP (POST /auth/verify-password-reset-otp)
export interface VerifyPasswordResetOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyPasswordResetOTPResponse {
  data: {};
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// Step 3: Complete Password Reset (POST /auth/complete-password-reset)
export interface CompletePasswordResetRequest {
  newPassword: string;
}

export interface CompletePasswordResetResponse {
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
  message: string;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

// === LEGACY AND ADMIN ENDPOINTS ===

// Admin Login (POST /admin/auth/login)
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    accountRole: string;
  };
}

// Legacy Sign-in (POST /auth/sign-in) - Deprecated
export interface SignInRequest {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  accountRole: string;
}

export interface SignInResponse {
  accessToken: string;
}

// Employee Registration (Legacy - POST /admin/auth/register)
export interface EmployeeRegistrationRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  password: string;
  inviteCode: string;
  image?: string;
  birthday?: Date;
}

export interface EmployeeRegistrationResponse {
  data: string; // OTP token
}

// OTP Verification (Legacy endpoints)
export interface VerifyOTPRequest {
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  token?: string;
  user?: User;
}

// Password Reset (Legacy)
export interface ResetPasswordRequest {
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// === AUTHENTICATION ERROR CODES ===

export enum AuthErrorCodes {
  // Authentication Errors (4000-4099)
  OTP_EXPIRED = 4001,
  INVALID_OTP = 4002,
  INVALID_CREDENTIALS = 4003,
  INVALID_RESET_TOKEN = 4004,
  OTP_VERIFICATION_FAILED = 4005,
  INVALID_TOKEN = 4009,
  REFRESH_TOKEN_NOT_IN_REDIS = 4010,
  INVALID_OTP_TOKEN = 4017,
  OTP_GENERATION_FAILED = 4018,
  PASSWORD_RESET_FAILED = 4019,
  TOKEN_BLACKLISTING_FAILED = 4020,

  // Session Management (4200-4299)
  INVALID_SESSION_TOKEN = 4200,
  EXPIRED_SESSION_TOKEN = 4201,
  SESSION_NOT_FOUND = 4202,

  // Registration Flow (4300-4399)
  REGISTRATION_TOKEN_INVALID = 4300,
  REGISTRATION_TOKEN_EXPIRED = 4301,
  REGISTRATION_STEP_INVALID = 4302,

  // Rate Limiting (4400-4499)
  RATE_LIMIT_EXCEEDED = 4400,
  OTP_ATTEMPTS_EXCEEDED = 4401,
  LOGIN_ATTEMPTS_EXCEEDED = 4402,

  // Account Security (4500-4599)
  ACCOUNT_LOCKED = 4500,
  ACCOUNT_TEMPORARILY_LOCKED = 4501,
  FAILED_LOGIN_LIMIT_EXCEEDED = 4503,

  // Account Errors (5000-5099)
  ACCOUNT_NOT_FOUND = 5001,
  DUPLICATED_EMAIL = 5011,
  DUPLICATED_PHONE_NUMBER = 5012,

  // Invite Code Errors (13000-13099)
  INVITE_CODE_NOT_FOUND = 13000,
  INVITE_CODE_USED = 13001,
  INVITE_CODE_EXPIRED = 13002,

  // General Validation
  VALIDATION_ERROR = 70000,
}

// === AUTHENTICATION QUERY KEYS ===

export const AuthQueryKeys = {
  // User queries
  USER_PROFILE: ['auth', 'user'] as const,
  USER_REFRESH: ['auth', 'refresh'] as const,

  // Registration flow
  VALIDATE_INVITE: (code: string) => ['auth', 'validate-invite', code] as const,
  REGISTRATION_STATUS: ['auth', 'registration-status'] as const,

  // Password reset flow
  PASSWORD_RESET_STATUS: ['auth', 'password-reset-status'] as const,
} as const;

// === AUTHENTICATION MUTATION KEYS ===

export const AuthMutationKeys = {
  // Registration flow
  VALIDATE_INVITE_CODE: 'validateInviteCode',
  REGISTER_EMAIL: 'registerEmail',
  VERIFY_REGISTRATION_OTP: 'verifyRegistrationOTP',
  COMPLETE_REGISTRATION: 'completeRegistration',

  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  REFRESH_TOKEN: 'refreshToken',

  // Password reset
  REQUEST_PASSWORD_RESET: 'requestPasswordReset',
  VERIFY_PASSWORD_RESET_OTP: 'verifyPasswordResetOTP',
  COMPLETE_PASSWORD_RESET: 'completePasswordReset',

  // Legacy
  ADMIN_LOGIN: 'adminLogin',
  EMPLOYEE_REGISTRATION: 'employeeRegistration',
  VERIFY_OTP: 'verifyOTP',
} as const;
