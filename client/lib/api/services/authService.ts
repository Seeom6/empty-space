import { apiClient } from '../client';
import {
  // New 4-step registration flow types
  ValidateInviteCodeRequest,
  ValidateInviteCodeResponse,
  RegisterEmailRequest,
  RegisterEmailResponse,
  VerifyRegistrationOTPRequest,
  VerifyRegistrationOTPResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,

  // Authentication types
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,

  // Password reset flow types
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  VerifyPasswordResetOTPRequest,
  VerifyPasswordResetOTPResponse,
  CompletePasswordResetRequest,
  CompletePasswordResetResponse,

  // Legacy and admin types
  AdminLoginRequest,
  AdminLoginResponse,
  EmployeeRegistrationRequest,
  EmployeeRegistrationResponse,
  User
} from '../types';

/**
 * Utility function to read cookies
 */
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

/**
 * Authentication Service
 * Handles all authentication-related API calls according to AUTHENTICATION_API_DOCUMENTATION.md
 * Supports cookie-based authentication with 4-step registration flow
 */
export class AuthService {
  // === 4-STEP REGISTRATION FLOW ===

  /**
   * Step 1: Validate Invite Code
   * POST /auth/validate-invite-code
   * Sets sessionToken cookie (15 minutes expiry)
   */
  static async validateInviteCode(data: ValidateInviteCodeRequest): Promise<ValidateInviteCodeResponse> {
    const response = await apiClient.post<ValidateInviteCodeResponse>('/website/auth/validate-invite-code', data);
    return response.data;
  }

  /**
   * Step 2: Register Email
   * POST /auth/register-email
   * Requires sessionToken cookie, sets otpToken cookie (10 minutes expiry)
   */
  static async registerEmail(data: RegisterEmailRequest): Promise<RegisterEmailResponse> {
    const response = await apiClient.post<RegisterEmailResponse>('/website/auth/register-email', data);
    return response.data;
  }

  /**
   * Step 3: Verify Registration OTP
   * POST /auth/verify-registration-otp
   * Requires otpToken cookie, sets registrationToken cookie (15 minutes expiry)
   */
  static async verifyRegistrationOTP(data: VerifyRegistrationOTPRequest): Promise<VerifyRegistrationOTPResponse> {
    const response = await apiClient.post<VerifyRegistrationOTPResponse>('/website/auth/verify-registration-otp', data);
    return response.data;
  }

  /**
   * Step 4: Complete Registration
   * POST /auth/complete-registration
   * Requires registrationToken cookie, sets accessToken cookie (15 minutes expiry)
   */
  static async completeRegistration(data: CompleteRegistrationRequest): Promise<CompleteRegistrationResponse> {
    const response = await apiClient.post<CompleteRegistrationResponse>('/website/auth/complete-registration', data);
    return response.data;
  }

  // === AUTHENTICATION ENDPOINTS ===

  /**
   * User Login
   * POST /admin/auth/login
   * Sets accessToken and refreshToken cookies
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>('/admin/auth/login', credentials);
      console.log('✅ Login API response:', response.data);

      // For admin login, the response contains access_token and user info
      // Transform admin login response to match expected LoginResponse format
      if (response.data.access_token) {
        // Decode the JWT to get user info
        const tokenPayload = AuthService.decodeJWT(response.data.access_token);

        if (!tokenPayload) {
          console.warn('⚠️ Could not decode JWT token, using response data');
        }

        // Normalize the role format (convert snake_case to UPPER_CASE)
        const rawRole = tokenPayload?.accountRole || response.data.user?.accountRole || 'ADMIN';
        const normalizedRole = AuthService.normalizeRole(rawRole);

        console.log('🔄 Role normalization:', { rawRole, normalizedRole });

        // Create user object from token payload and response
        // Note: AdminLoginResponse.user only has id, email, accountRole
        const user = {
          id: tokenPayload?.accountId || response.data.user?.id || 'unknown',
          email: tokenPayload?.email || response.data.user?.email || credentials.email,
          firstName: 'Admin', // Default for admin users (not in AdminLoginResponse)
          lastName: 'User',   // Default for admin users (not in AdminLoginResponse)
          accountRole: normalizedRole as 'EMPLOYEE' | 'ADMIN' | 'SUPER_ADMIN',
          isVerified: tokenPayload?.isVerified || true,
          phoneNumber: undefined, // Not available in AdminLoginResponse
          employee: undefined     // Not available in AdminLoginResponse
        };

        console.log('✅ Created user object:', user);

        return {
          data: {
            user: user
          },
          message: 'Login successful'
        };
      } else {
        console.error('❌ No access token in response:', response.data);
        throw new Error('Login failed: No access token received');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);

      // Re-throw with better error message
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Login failed: Unknown error');
      }
    }
  }

  /**
   * Refresh Token
   * POST /auth/refresh
   * Uses refreshToken cookie, sets new accessToken and refreshToken cookies
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/website/auth/refresh');
    return response.data;
  }

  /**
   * Logout
   * POST /auth/logout
   * Clears all authentication cookies
   */
  static async logout(): Promise<LogoutResponse> {
    const response = await apiClient.post<LogoutResponse>('/website/auth/logout');
    return response.data;
  }

  // === PASSWORD RESET FLOW ===

  /**
   * Step 1: Request Password Reset
   * POST /auth/request-password-reset
   * Sets otpToken cookie if account exists (10 minutes expiry)
   */
  static async requestPasswordReset(data: RequestPasswordResetRequest): Promise<RequestPasswordResetResponse> {
    const response = await apiClient.post<RequestPasswordResetResponse>('/website/auth/request-password-reset', data);
    return response.data;
  }

  /**
   * Step 2: Verify Password Reset OTP
   * POST /auth/verify-password-reset-otp
   * Requires otpToken cookie, sets resetToken cookie (15 minutes expiry)
   */
  static async verifyPasswordResetOTP(data: VerifyPasswordResetOTPRequest): Promise<VerifyPasswordResetOTPResponse> {
    const response = await apiClient.post<VerifyPasswordResetOTPResponse>('/website/auth/verify-password-reset-otp', data);
    return response.data;
  }

  /**
   * Step 3: Complete Password Reset
   * POST /auth/complete-password-reset
   * Requires resetToken cookie, blacklists all existing tokens
   */
  static async completePasswordReset(data: CompletePasswordResetRequest): Promise<CompletePasswordResetResponse> {
    const response = await apiClient.post<CompletePasswordResetResponse>('/website/auth/complete-password-reset', data);
    return response.data;
  }

  // === ADMIN ENDPOINTS ===

  /**
   * Admin Login (SUPER_ADMIN only)
   * POST /admin/auth/login
   * Sets accessToken cookie
   */
  static async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await apiClient.post<AdminLoginResponse>('/admin/auth/login', credentials);
    return response.data;
  }

  /**
   * Admin Send OTP
   * POST /admin/auth/send-otp
   * Sends OTP for admin operations
   */
  static async adminSendOTP(data: { email: string }): Promise<{ data: { message: string; otpExpiresIn: number } }> {
    const response = await apiClient.post('/admin/auth/send-otp', data);
    return response.data;
  }

  /**
   * Admin Verify OTP
   * POST /admin/auth/verify-otp
   * Verifies OTP for admin operations
   */
  static async adminVerifyOTP(data: { otp: string }): Promise<{ data: { message: string; verified: boolean } }> {
    const response = await apiClient.post('/admin/auth/verify-otp', data);
    return response.data;
  }

  // === LEGACY ENDPOINTS (for backward compatibility) ===



  /**
   * Employee registration (Legacy)
   * POST /admin/auth/register
   */
  static async registerEmployee(data: EmployeeRegistrationRequest): Promise<EmployeeRegistrationResponse> {
    const requestData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      inviteCode: data.inviteCode,
    };

    if (data.phoneNumber) requestData.phoneNumber = data.phoneNumber;
    if (data.image) requestData.image = data.image;
    if (data.birthday) requestData.birthday = data.birthday;

    const response = await apiClient.post<EmployeeRegistrationResponse>('/admin/auth/register', requestData);
    return response.data;
  }



  // === UTILITY FUNCTIONS ===

  /**
   * Get current user profile
   * GET /website/account/me
   * Requires accessToken cookie
   */
  static async me(): Promise<{ data: { data: { user: User }; message: string } }> {
    const response = await apiClient.get<{ data: { data: { user: User }; message: string } }>('/website/account/me');
    console.log('🔍 AuthService.me() - Raw axios response:', response);
    console.log('🔍 AuthService.me() - Response data:', response.data);
    return response.data;
  }

  /**
   * Check if user is authenticated via cookies
   * Note: HTTP-only cookies cannot be read by JavaScript, so we'll try to make an API call
   */
  static isAuthenticatedViaCookies(): boolean {
    // First, try to read non-HTTP-only cookies if they exist
    const accessToken = getCookie('accessToken');
    const refreshToken = getCookie('refreshToken');

    // If we can read cookies and they exist, user is authenticated
    if (accessToken || refreshToken) {
      console.log('🔍 Found readable auth cookies:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
      return true;
    }

    // If no readable cookies, we can't determine auth state from cookies alone
    // The auth provider will need to make an API call to check
    console.log('🔍 No readable auth cookies found - will need API call to verify');
    return false;
  }

  /**
   * Get access token from cookie
   */
  static getAccessTokenFromCookie(): string | null {
    return getCookie('accessToken');
  }

  /**
   * Get refresh token from cookie
   */
  static getRefreshTokenFromCookie(): string | null {
    return getCookie('refreshToken');
  }

  /**
   * Clear all authentication state (client-side)
   */
  static clearAuthState(): void {
    if (typeof document !== 'undefined') {
      // Clear all authentication cookies
      const cookiesToClear = ['accessToken', 'refreshToken', 'sessionToken', 'otpToken', 'registrationToken', 'resetToken'];
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
      });

    }
  }

  /**
   * Decode JWT token to extract payload
   */
  static decodeJWT(token: string): any {
    try {
      if (!token || typeof token !== 'string') {
        console.warn('Invalid token provided to decodeJWT:', token);
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT format - expected 3 parts, got:', parts.length);
        return null;
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if needed
      const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);

      const jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const parsed = JSON.parse(jsonPayload);
      console.log('✅ Successfully decoded JWT payload:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Failed to decode JWT:', error, 'Token:', token?.substring(0, 50) + '...');
      return null;
    }
  }

  /**
   * Normalize role format to match frontend expectations
   * Converts: super_admin -> SUPER_ADMIN, admin -> ADMIN, etc.
   */
  static normalizeRole(role: string): string {
    if (!role) return 'employee';

    // Convert to lowercase and normalize format to match AccountRole enum
    const normalized = role.toLowerCase();

    // Map common role variations to match AccountRole enum values
    const roleMap: Record<string, string> = {
      'super_admin': 'super_admin',
      'superadmin': 'super_admin',
      'admin': 'admin',
      'employee': 'employee',
      'operator': 'operator',
      'user': 'employee', // Map user to employee
      'seller': 'seller',
    };

    return roleMap[normalized] || 'employee';
  }
}
