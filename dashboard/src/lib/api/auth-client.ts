import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  UserRegistrationRequest,
  UserRegistrationResponse,
  EmployeeRegistrationRequest,
  EmployeeRegistrationResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyResetOTPResponse,
  RefreshTokenResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  AuthError,
  ApiError,
} from '../types/auth';

class AuthApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      withCredentials: true, // Important for cookie handling
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.message,
          response: error.response,
          code: error.response?.data?.error?.code,
        };
        return Promise.reject(apiError);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_access_token');
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_access_token', token);
    }
  }

  private removeAccessToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_access_token');
    }
  }

  // User Authentication Endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.client.post(
      '/auth/log-in',
      credentials
    );
    
    // Store access token
    this.setAccessToken(response.data.accessToken);
    
    return response.data;
  }

  async registerUser(data: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    const response: AxiosResponse<UserRegistrationResponse> = await this.client.post(
      '/auth/sign-in',
      data
    );
    
    // Store access token
    this.setAccessToken(response.data.accessToken);
    
    return response.data;
  }

  async registerSeller(data: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    const response: AxiosResponse<UserRegistrationResponse> = await this.client.post(
      '/auth/seller-sign-in',
      data
    );
    
    // Store access token
    this.setAccessToken(response.data.accessToken);
    
    return response.data;
  }

  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response: AxiosResponse<SendOTPResponse> = await this.client.post(
      '/auth/send-otp',
      data
    );
    return response.data;
  }

  // Protected Endpoints (require authentication)
  async verifyOTP(data: VerifyOTPRequest, token?: string): Promise<VerifyOTPResponse> {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response: AxiosResponse<VerifyOTPResponse> = await this.client.post(
      '/auth/verify-otp',
      data,
      config
    );
    return response.data;
  }

  async verifyResetOTP(data: VerifyOTPRequest, token?: string): Promise<VerifyResetOTPResponse> {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response: AxiosResponse<VerifyResetOTPResponse> = await this.client.post(
      '/auth/verify-reset-otp',
      data,
      config
    );
    return response.data;
  }

  async resetPassword(data: ResetPasswordRequest, token?: string): Promise<ResetPasswordResponse> {
    const config = token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {};
    
    const response: AxiosResponse<ResetPasswordResponse> = await this.client.post(
      '/auth/reset-password',
      data,
      config
    );
    return response.data;
  }

  // Token Management
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response: AxiosResponse<RefreshTokenResponse> = await this.client.post(
      '/auth/refresh'
    );
    
    // Update stored access token
    this.setAccessToken(response.data.accessToken);
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/log-out');
    } finally {
      // Always clear local token even if request fails
      this.removeAccessToken();
    }
  }

  // Admin Authentication
  async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response: AxiosResponse<AdminLoginResponse> = await this.client.post(
      '/admin/auth/login',
      credentials
    );
    
    // Store admin access token
    this.setAccessToken(response.data.access_token);
    
    return response.data;
  }

  async registerEmployee(data: EmployeeRegistrationRequest): Promise<EmployeeRegistrationResponse> {
    const response: AxiosResponse<EmployeeRegistrationResponse> = await this.client.post(
      '/admin/auth/register',
      data
    );
    return response.data;
  }

  async adminSendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response: AxiosResponse<SendOTPResponse> = await this.client.post(
      '/admin/auth/send-otp',
      data
    );
    return response.data;
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentToken(): string | null {
    return this.getAccessToken();
  }

  clearTokens(): void {
    this.removeAccessToken();
  }

  // Error Helper
  static isAuthError(error: any): error is ApiError {
    return error?.response?.data?.error !== undefined;
  }

  static getErrorMessage(error: any): string {
    if (this.isAuthError(error)) {
      return error.response?.data.error.message || 'Authentication failed';
    }
    return error.message || 'An unexpected error occurred';
  }

  static getErrorCode(error: any): number | undefined {
    if (this.isAuthError(error)) {
      return error.response?.data.error.code;
    }
    return error.code;
  }
}

// Create singleton instance
export const authApiClient = new AuthApiClient();
export default authApiClient;
