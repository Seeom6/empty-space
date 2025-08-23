import { apiClient } from '../client';
import {
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
  User
} from '../types';

/**
 * Authentication Service
 * Handles all authentication-related API calls according to API_AUTHENTICATION.md
 */
export class AuthService {
  /**
   * Regular user login
   * POST /auth/log-in
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/log-in', credentials);
    return response.data;
  }

  /**
   * Admin login (SUPER_ADMIN only)
   * POST /admin/auth/login
   */
  static async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    console.log('🌐 AuthService.adminLogin called with:', credentials);
    console.log('📡 Making POST request to: /admin/auth/login');

    const response = await apiClient.post<AdminLoginResponse>('/admin/auth/login', credentials);

    console.log('📨 API Response status:', response.status);
    console.log('📦 API Response data:', response.data);

    return response.data;
  }

  /**
   * Sign-in (Registration)
   * POST /auth/sign-in
   */
  static async signIn(data: SignInRequest): Promise<SignInResponse> {
    const response = await apiClient.post<SignInResponse>('/auth/sign-in', data);
    return response.data;
  }

  /**
   * Seller sign-in (Registration for sellers)
   * POST /auth/seller-sign-in
   */
  static async sellerSignIn(data: SignInRequest): Promise<SignInResponse> {
    const response = await apiClient.post<SignInResponse>('/auth/seller-sign-in', data);
    return response.data;
  }

  /**
   * Refresh authentication token
   * POST /auth/refresh
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh');
    return response.data;
  }

  /**
   * Logout user
   * POST /auth/log-out
   */
  static async logout(): Promise<void> {
    await apiClient.post('/auth/log-out');
  }

  /**
   * Verify OTP for phone number verification
   * POST /auth/verify-otp
   * Requires: Bearer token
   */
  static async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>('/auth/verify-otp', data);
    return response.data;
  }

  /**
   * Verify OTP for password reset
   * POST /auth/verify-reset-otp
   * Requires: Bearer token
   */
  static async verifyResetOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>('/auth/verify-reset-otp', data);
    return response.data;
  }

  /**
   * Reset password after OTP verification
   * POST /auth/reset-password
   * Requires: Bearer token
   */
  static async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  }

  /**
   * Get current user profile (if endpoint exists)
   * This endpoint is not documented in API_AUTHENTICATION.md
   * but may be needed for user profile functionality
   */
  static async me(): Promise<{ user: User }> {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data;
  }
}
