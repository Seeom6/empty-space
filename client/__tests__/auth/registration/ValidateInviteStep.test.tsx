import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ValidateInviteStep } from '@/components/auth/registration/ValidateInviteStep';
import { AuthService } from '@/lib/api/services/authService';

// Mock the AuthService
jest.mock('@/lib/api/services/authService');
const mockedAuthService = AuthService as jest.Mocked<typeof AuthService>;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('ValidateInviteStep', () => {
  const mockOnComplete = jest.fn();
  const mockSetIsLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (isLoading = false) => {
    return render(
      <ValidateInviteStep
        onComplete={mockOnComplete}
        isLoading={isLoading}
        setIsLoading={mockSetIsLoading}
      />
    );
  };

  it('renders correctly', () => {
    renderComponent();

    expect(screen.getByText('Validate Invite Code')).toBeInTheDocument();
    expect(screen.getByLabelText(/invite code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /validate code/i })).toBeInTheDocument();
  });

  it('shows validation error for empty invite code', async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByRole('button', { name: /validate code/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invite code is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid invite code format', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByLabelText(/invite code/i);
    await user.type(input, 'invalid');

    const submitButton = screen.getByRole('button', { name: /validate code/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invite code must be exactly 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits valid invite code successfully', async () => {
    const user = userEvent.setup();
    const mockResponse = {
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
    };

    mockedAuthService.validateInviteCode.mockResolvedValueOnce(mockResponse);
    renderComponent();

    const input = screen.getByLabelText(/invite code/i);
    await user.type(input, 'VALID123');

    const submitButton = screen.getByRole('button', { name: /validate code/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAuthService.validateInviteCode).toHaveBeenCalledWith({
        inviteCode: 'VALID123'
      });
      expect(mockOnComplete).toHaveBeenCalledWith(mockResponse.data);
    });
  });

  it('handles API error correctly', async () => {
    const user = userEvent.setup();
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
    renderComponent();

    const input = screen.getByLabelText(/invite code/i);
    await user.type(input, 'INVALID1');

    const submitButton = screen.getByRole('button', { name: /validate code/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid invite code')).toBeInTheDocument();
    });
  });

  it('disables form when loading', () => {
    renderComponent(true);

    const input = screen.getByLabelText(/invite code/i);
    const submitButton = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/validating/i)).toBeInTheDocument();
  });

  it('formats invite code input correctly', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByLabelText(/invite code/i) as HTMLInputElement;
    
    // Type lowercase letters
    await user.type(input, 'abc123de');
    
    // Should be converted to uppercase
    expect(input.value).toBe('ABC123DE');
  });

  it('limits invite code input to 8 characters', async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByLabelText(/invite code/i) as HTMLInputElement;
    
    // Type more than 8 characters
    await user.type(input, 'ABCDEFGHIJK');
    
    // Should be limited to 8 characters
    expect(input.value).toBe('ABCDEFGH');
  });

  it('has proper accessibility attributes', () => {
    renderComponent();

    const input = screen.getByLabelText(/invite code/i);
    const submitButton = screen.getByRole('button', { name: /validate code/i });

    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('autoFocus');
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('shows loading state correctly', () => {
    renderComponent(true);

    expect(screen.getByText(/validating/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
