import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ApiErrorResponse, ErrorCodes } from './types';

// API Configuration
const API_CONFIG = {
  baseURL: 'http://localhost:12001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create(API_CONFIG);

// Log the base URL for debugging
console.log('🌐 API Client configured with baseURL:', API_CONFIG.baseURL);

// Auth token management
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize auth token from localStorage (moved to QueryProvider to avoid SSR issues)

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ensure auth token is always included if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${fullUrl}`);
    console.log(`🔑 Authorization Header: ${config.headers.Authorization ? 'Present' : 'Missing'}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('auth_token');
      setAuthToken(null);
      
      // Only redirect if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Custom error class for API errors
export class ApiError extends Error {
  public readonly code: number;
  public readonly errorType: string;
  public readonly path: string;
  public readonly timestamp: string;

  constructor(errorResponse: ApiErrorResponse) {
    super(errorResponse.error.message);
    this.name = 'ApiError';
    this.code = errorResponse.error.code;
    this.errorType = errorResponse.error.errorType;
    this.path = errorResponse.error.path;
    this.timestamp = errorResponse.error.time;
  }

  // Helper methods for common error types
  public isValidationError(): boolean {
    return this.code === ErrorCodes.VALIDATION_ERROR;
  }

  public isNotFoundError(): boolean {
    return [
      ErrorCodes.TECHNOLOGY_NOT_FOUND,
      ErrorCodes.DEPARTMENT_NOT_FOUND,
      ErrorCodes.POSITION_NOT_FOUND,
    ].includes(this.code);
  }

  public isAlreadyExistsError(): boolean {
    return [
      ErrorCodes.TECHNOLOGY_ALREADY_EXISTS,
      ErrorCodes.DEPARTMENT_ALREADY_EXISTS,
      ErrorCodes.POSITION_ALREADY_EXISTS,
    ].includes(this.code);
  }

  public isAuthError(): boolean {
    return [ErrorCodes.UNAUTHORIZED, ErrorCodes.FORBIDDEN].includes(this.code);
  }

  public isDependencyError(): boolean {
    return [
      ErrorCodes.DEPARTMENT_HAS_POSITION,
      ErrorCodes.DEPARTMENT_HAS_EMPLOYEE,
    ].includes(this.code);
  }
}

// Helper function to handle API errors
export const handleApiError = (error: AxiosError<ApiErrorResponse>): never => {
  if (error.response?.data?.error) {
    throw new ApiError(error.response.data);
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    throw new Error('Network error: Unable to connect to the server');
  }
  
  // Handle timeout errors
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timeout: The server took too long to respond');
  }
  
  // Generic error fallback
  throw new Error(error.message || 'An unexpected error occurred');
};

// Generic API request wrapper with error handling
export const apiRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error) {
    return handleApiError(error as AxiosError<ApiErrorResponse>);
  }
};

// Health check endpoint
export const healthCheck = async (): Promise<{ status: string; timestamp: string }> => {
  return apiRequest(() => apiClient.get('/health'));
};

export default apiClient;
