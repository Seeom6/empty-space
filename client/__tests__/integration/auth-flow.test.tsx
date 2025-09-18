import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RegistrationFlowPage from '@/app/auth/register-flow/page';
import { AuthService } from '@/lib/api/services/authService';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthService
jest.mock('@/lib/api/services/authService');
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('Authentication Flow Integration', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should complete the full registration flow', async () => {
    const user = userEvent.setup();

    // Mock API responses for each step
    const mockInviteResponse = {
      data: {
        inviteCode: 'VALID123',
        position: {
          id: '1',
          name: 'Developer',
          department: { id: '1', name: 'Engineering' }
        }
      }
    };

    const mockEmailResponse = {
      data: { success: true, message: 'OTP sent' }
    };

    const mockOTPResponse = {
      data: { success: true, message: 'OTP verified' }
    };

    const mockCompleteResponse = {
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

    mockedAuthService.validateInviteCode.mockResolvedValueOnce(mockInviteResponse);
    mockedAuthService.registerEmail.mockResolvedValueOnce(mockEmailResponse);
    mockedAuthService.verifyRegistrationOTP.mockResolvedValueOnce(mockOTPResponse);
    mockedAuthService.completeRegistration.mockResolvedValueOnce(mockCompleteResponse);

    render(<RegistrationFlowPage />);

    // Step 1: Validate Invite Code
    expect(screen.getByText('Validate Invite Code')).toBeInTheDocument();
    
    const inviteInput = screen.getByLabelText(/invite code/i);
    await user.type(inviteInput, 'VALID123');
    
    const validateButton = screen.getByRole('button', { name: /validate code/i });
    await user.click(validateButton);

    await waitFor(() => {
      expect(mockedAuthService.validateInviteCode).toHaveBeenCalledWith({
        inviteCode: 'VALID123'
      });
    });

    // Step 2: Register Email
    await waitFor(() => {
      expect(screen.getByText('Register Email')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(firstNameInput, 'John');
    await user.type(lastNameInput, 'Doe');
    await user.type(emailInput, 'test@example.com');

    const registerButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(mockedAuthService.registerEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    // Step 3: Verify OTP
    await waitFor(() => {
      expect(screen.getByText('Verify Email')).toBeInTheDocument();
    });

    const otpInput = screen.getByLabelText(/verification code/i);
    await user.type(otpInput, '123456');

    const verifyButton = screen.getByRole('button', { name: /verify code/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(mockedAuthService.verifyRegistrationOTP).toHaveBeenCalledWith({
        otp: '123456'
      });
    });

    // Step 4: Complete Registration
    await waitFor(() => {
      expect(screen.getByText('Complete Registration')).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'SecurePass123!');
    await user.type(confirmPasswordInput, 'SecurePass123!');

    const completeButton = screen.getByRole('button', { name: /complete registration/i });
    await user.click(completeButton);

    await waitFor(() => {
      expect(mockedAuthService.completeRegistration).toHaveBeenCalledWith({
        password: 'SecurePass123!'
      });
    });

    // Should show success state
    await waitFor(() => {
      expect(screen.getByText('Registration Complete!')).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock API error
    const mockError = {
      response: {
        data: {
          error: {
            message: 'Invalid invite code'
          }
        }
      }
    };

    mockedAuthService.validateInviteCode.mockRejectedValueOnce(mockError);

    render(<RegistrationFlowPage />);

    const inviteInput = screen.getByLabelText(/invite code/i);
    await user.type(inviteInput, 'INVALID1');
    
    const validateButton = screen.getByRole('button', { name: /validate code/i });
    await user.click(validateButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid invite code')).toBeInTheDocument();
    });

    // Should still be on step 1
    expect(screen.getByText('Validate Invite Code')).toBeInTheDocument();
  });

  it('should allow navigation between steps', async () => {
    const user = userEvent.setup();

    // Mock successful first step
    const mockInviteResponse = {
      data: {
        inviteCode: 'VALID123',
        position: {
          id: '1',
          name: 'Developer',
          department: { id: '1', name: 'Engineering' }
        }
      }
    };

    mockedAuthService.validateInviteCode.mockResolvedValueOnce(mockInviteResponse);

    render(<RegistrationFlowPage />);

    // Complete step 1
    const inviteInput = screen.getByLabelText(/invite code/i);
    await user.type(inviteInput, 'VALID123');
    
    const validateButton = screen.getByRole('button', { name: /validate code/i });
    await user.click(validateButton);

    // Should be on step 2
    await waitFor(() => {
      expect(screen.getByText('Register Email')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    // Should be back on step 1
    expect(screen.getByText('Validate Invite Code')).toBeInTheDocument();
  });

  it('should show progress correctly', async () => {
    render(<RegistrationFlowPage />);

    // Step 1 should show 25% progress
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
    expect(screen.getByText('25% complete')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<RegistrationFlowPage />);

    // Check for progress bar accessibility
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '25');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');

    // Check for proper form labels
    const inviteInput = screen.getByLabelText(/invite code/i);
    expect(inviteInput).toBeInTheDocument();

    // Check for button accessibility
    const validateButton = screen.getByRole('button', { name: /validate code/i });
    expect(validateButton).toHaveAttribute('type', 'submit');
  });
});
