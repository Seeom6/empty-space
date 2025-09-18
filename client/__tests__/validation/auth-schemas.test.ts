import { describe, it, expect } from '@jest/globals';
import {
  validateInviteCodeSchema,
  registerEmailSchema,
  verifyRegistrationOTPSchema,
  completeRegistrationSchema,
  loginSchema,
  requestPasswordResetSchema,
  verifyPasswordResetOTPSchema,
  completePasswordResetSchema,
} from '@/lib/validation/auth-schemas';

describe('Authentication Validation Schemas', () => {
  describe('validateInviteCodeSchema', () => {
    it('should validate correct invite code', () => {
      const validData = { inviteCode: 'ABC12345' };
      const result = validateInviteCodeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty invite code', () => {
      const invalidData = { inviteCode: '' };
      const result = validateInviteCodeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('required');
      }
    });

    it('should reject invite code with wrong length', () => {
      const invalidData = { inviteCode: 'ABC123' }; // Too short
      const result = validateInviteCodeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 characters');
      }
    });

    it('should accept alphanumeric invite codes', () => {
      const validCodes = ['ABC12345', '12345678', 'ABCDEFGH'];
      validCodes.forEach(code => {
        const result = validateInviteCodeSchema.safeParse({ inviteCode: code });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('registerEmailSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };
      const result = registerEmailSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe'
      };
      const result = registerEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('email');
      }
    });

    it('should reject empty first name', () => {
      const invalidData = {
        email: 'test@example.com',
        firstName: '',
        lastName: 'Doe'
      };
      const result = registerEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(51); // 51 characters
      const invalidData = {
        email: 'test@example.com',
        firstName: longName,
        lastName: 'Doe'
      };
      const result = registerEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('verifyRegistrationOTPSchema', () => {
    it('should validate correct 6-digit OTP', () => {
      const validData = { otp: '123456' };
      const result = verifyRegistrationOTPSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject OTP with wrong length', () => {
      const invalidData = { otp: '12345' }; // Too short
      const result = verifyRegistrationOTPSchema.safeParse(validData);
      expect(result.success).toBe(false);
    });

    it('should reject non-numeric OTP', () => {
      const invalidData = { otp: 'ABC123' };
      const result = verifyRegistrationOTPSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('completeRegistrationSchema', () => {
    it('should validate correct registration completion data', () => {
      const validData = {
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        phoneNumber: '+1234567890'
      };
      const result = completeRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', () => {
      const invalidData = {
        password: 'weak',
        confirmPassword: 'weak'
      };
      const result = completeRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass123!'
      };
      const result = completeRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('match');
      }
    });

    it('should validate without phone number', () => {
      const validData = {
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      };
      const result = completeRegistrationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone number format', () => {
      const invalidData = {
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        phoneNumber: '123-456-7890' // Invalid format
      };
      const result = completeRegistrationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'SecurePass123!'
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'SecurePass123!'
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Password Reset Schemas', () => {
    it('should validate password reset request', () => {
      const validData = { email: 'test@example.com' };
      const result = requestPasswordResetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate password reset OTP', () => {
      const validData = { otp: '123456' };
      const result = verifyPasswordResetOTPSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate password reset completion', () => {
      const validData = {
        newPassword: 'NewSecurePass123!',
        confirmPassword: 'NewSecurePass123!'
      };
      const result = completePasswordResetSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Password Validation', () => {
    const testPassword = (password: string) => {
      return completeRegistrationSchema.safeParse({
        password,
        confirmPassword: password
      });
    };

    it('should require minimum length', () => {
      const result = testPassword('Short1!');
      expect(result.success).toBe(false);
    });

    it('should require uppercase letter', () => {
      const result = testPassword('lowercase123!');
      expect(result.success).toBe(false);
    });

    it('should require lowercase letter', () => {
      const result = testPassword('UPPERCASE123!');
      expect(result.success).toBe(false);
    });

    it('should require number', () => {
      const result = testPassword('NoNumbers!');
      expect(result.success).toBe(false);
    });

    it('should require special character', () => {
      const result = testPassword('NoSpecialChar123');
      expect(result.success).toBe(false);
    });

    it('should accept strong password', () => {
      const result = testPassword('StrongPass123!');
      expect(result.success).toBe(true);
    });
  });
});
