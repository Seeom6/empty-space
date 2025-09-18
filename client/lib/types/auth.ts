// Authentication Types based on API Documentation

export interface User {
  accountId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  accountRole: AccountRole;
  isActive: boolean;
  isVerified: boolean;
  image?: string;
  birthday?: Date;
}

export enum AccountRole {
  USER = 'user',
  SELLER = 'seller',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  SUPER_ADMIN = 'super_admin',
  EMPLOYEE = 'employee'
}

// Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRegistrationRequest {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  accountRole: AccountRole;
}

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

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  otp: string;
}

export interface ResetPasswordRequest {
  otp: string;
  newPassword: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

// Response Types
export interface LoginResponse {
  accessToken: string;
}

export interface UserRegistrationResponse {
  accessToken: string;
}

export interface EmployeeRegistrationResponse {
  data: string; // OTP token
}

export interface SendOTPResponse {
  data: string; // OTP token
}

export interface VerifyOTPResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyResetOTPResponse {
  message: string;
  token: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface AdminLoginResponse {
  access_token: string;
}

// Error Types
export interface AuthError {
  error: {
    path: string;
    time: string;
    message: string;
    code: number;
    errorType: string;
  };
}

export enum AuthErrorCode {
  // Authentication Errors (4xxx)
  OTP_EXPIRED = 4001,
  INVALID_OTP = 4002,
  INVALID_CREDENTIALS = 4003,
  OTP_VERIFICATION_FAILED = 4005,
  EXPIRED_ACCESS_TOKEN = 4006,
  EXPIRED_REFRESH_TOKEN = 4007,
  INVALID_TOKEN = 4009,
  REFRESH_TOKEN_NOT_IN_REDIS = 4010,
  ACCESS_TOKEN_NOT_EXIST = 4013,

  // Account Errors
  USER_ALREADY_EXISTS = 2002,
  ACCOUNT_NOT_FOUND = 5001,
  INVITE_CODE_NOT_FOUND = 13000,
  INVITE_CODE_USED = 13001,

  // Validation Errors
  VALIDATION_ERROR = 70000,
}

// Form Validation Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserRegistrationFormData {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  accountRole: AccountRole;
}

export interface EmployeeRegistrationFormData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
  image?: string;
  birthday?: string;
}

export interface OTPVerificationFormData {
  otp: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// Authentication Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  adminLogin: (credentials: AdminLoginRequest) => Promise<void>;
  registerUser: (data: UserRegistrationRequest) => Promise<string>; // Returns OTP token
  registerEmployee: (data: EmployeeRegistrationRequest) => Promise<string>; // Returns OTP token
  verifyOTP: (otp: string, token: string) => Promise<void>;
  sendOTP: (email: string) => Promise<string>; // Returns OTP token
  verifyResetOTP: (otp: string, token: string) => Promise<string>; // Returns reset token
  resetPassword: (otp: string, newPassword: string, token: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

// API Client Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface ApiError {
  response?: {
    data: AuthError;
    status: number;
    statusText: string;
  };
  message: string;
  code?: number;
}

// Authentication Flow States
export enum AuthFlowState {
  IDLE = 'idle',
  REGISTERING = 'registering',
  VERIFYING_OTP = 'verifying_otp',
  LOGGING_IN = 'logging_in',
  RESETTING_PASSWORD = 'resetting_password',
  VERIFYING_RESET_OTP = 'verifying_reset_otp',
  UPDATING_PASSWORD = 'updating_password',
  REFRESHING_TOKEN = 'refreshing_token',
  LOGGING_OUT = 'logging_out',
}

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  OTP_TOKEN: 'auth_otp_token',
  RESET_TOKEN: 'auth_reset_token',
  USER_DATA: 'auth_user_data',
} as const;

// Cookie Names
export const COOKIE_NAMES = {
  REFRESH_TOKEN: 'refreshToken',
  ACCESS_TOKEN: 'accessToken', // For admin routes
} as const;
