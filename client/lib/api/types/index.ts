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

// Authentication Types based on API_AUTHENTICATION.md

// User Profile (for /auth/me endpoint if it exists)
export interface User {
  accountId: string;
  accountRole: string;
  isActive: boolean;
  email: string;
  isVerified: boolean;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  permissions?: Record<string, any>; // For backward compatibility with protected routes
}

// Regular Login (POST /auth/log-in)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

// Admin Login (POST /admin/auth/login)
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
}

// Sign-in/Registration (POST /auth/sign-in)
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

// Token Refresh (POST /auth/refresh)
export interface RefreshTokenResponse {
  accessToken: string;
}

// OTP Verification (POST /auth/verify-otp, /auth/verify-reset-otp)
export interface VerifyOTPRequest {
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  token?: string; // Only for verify-reset-otp
}

// Password Reset (POST /auth/reset-password)
export interface ResetPasswordRequest {
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Auth Error Codes (from API documentation)
export enum AuthErrorCodes {
  USER_ALREADY_EXISTS = 2002,
  OTP_EXPIRED_OR_NOT_FOUND = 4001,
  INVALID_OTP = 4002,
  INVALID_CREDENTIALS = 4003,
  FAILED_TO_VERIFY_OTP = 4005,
  SESSION_EXPIRED = 4006,
  SESSION_EXPIRED_LOGIN_AGAIN = 4007,
  INVALID_TOKEN = 4009,
  REFRESH_TOKEN_NOT_IN_REDIS = 4010,
  ACCESS_TOKEN_NOT_EXIST = 4013,
  OTP_TOKEN_NOT_EXIST = 4014,
  VALIDATION_ERROR = 70000,
}
