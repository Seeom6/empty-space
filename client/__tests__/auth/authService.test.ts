import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import axios from 'axios';
import { AuthService } from '@/lib/api/services/authService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset any stored state
    AuthService.clearAuthState();
  });

  describe('4-Step Registration Flow', () => {
    it('should validate invite code successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            inviteCode: 'VALID123',
            position: {
              id: '1',
              name: 'Developer',
              department: {
                id: '1',
                name: 'Engineering'
              }
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.validateInviteCode({ inviteCode: 'VALID123' });

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/validate-invite-code', {
        inviteCode: 'VALID123'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should register email successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'OTP sent to email'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const registrationData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };

      const result = await AuthService.registerEmail(registrationData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register-email', registrationData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should verify registration OTP successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'OTP verified successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.verifyRegistrationOTP({ otp: '123456' });

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/verify-registration-otp', {
        otp: '123456'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should complete registration successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              isActive: true,
              isVerified: true
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const completionData = {
        password: 'SecurePass123!',
        phoneNumber: '+1234567890'
      };

      const result = await AuthService.completeRegistration(completionData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/complete-registration', completionData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Authentication', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              firstName: 'John',
              lastName: 'Doe',
              isActive: true,
              isVerified: true
            }
          }
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const credentials = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const result = await AuthService.login(credentials);

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should logout successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Logged out successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual(mockResponse.data);
    });

    it('should refresh token successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Token refreshed successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.refreshToken();

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/refresh');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Password Reset Flow', () => {
    it('should request password reset successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Password reset email sent'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.requestPasswordReset({ email: 'test@example.com' });

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/request-password-reset', {
        email: 'test@example.com'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should verify password reset OTP successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'OTP verified successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.verifyPasswordResetOTP({ otp: '123456' });

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/verify-password-reset-otp', {
        otp: '123456'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should complete password reset successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Password reset successfully'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await AuthService.completePasswordReset({ newPassword: 'NewSecurePass123!' });

      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/complete-password-reset', {
        newPassword: 'NewSecurePass123!'
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors properly', async () => {
      const mockError = {
        response: {
          data: {
            error: {
              code: 400,
              message: 'Invalid invite code',
              type: 'VALIDATION_ERROR'
            }
          }
        }
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(AuthService.validateInviteCode({ inviteCode: 'INVALID' }))
        .rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockedAxios.post.mockRejectedValueOnce(networkError);

      await expect(AuthService.login({ email: 'test@example.com', password: 'password' }))
        .rejects.toEqual(networkError);
    });
  });
});
