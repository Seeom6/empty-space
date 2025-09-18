import { z } from 'zod';
import { zodValidationPipeFactory } from '@Package/api';

// Invite Code Validation Schema
export const InviteCodeSchema = z.object({
  inviteCode: z.string()
    .regex(/^\$INV-\d{4}-[A-Za-z0-9]{6}$/, 'Invalid invite code format')
    .describe('Invite code in format $INV-YYYY-XXXXXX')
});

export type InviteCodeDto = z.infer<typeof InviteCodeSchema>;
export const InviteCodeValidation = zodValidationPipeFactory(InviteCodeSchema);

// Email Registration Schema
export const EmailRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
    .describe('Valid email address'),
  firstName: z.string()
    .min(1, 'First name required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in first name')
    .trim(),
  lastName: z.string()
    .min(1, 'Last name required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid characters in last name')
    .trim()
});

export type EmailRegistrationDto = z.infer<typeof EmailRegistrationSchema>;
export const EmailRegistrationValidation = zodValidationPipeFactory(EmailRegistrationSchema);

// OTP Verification Schema
export const OTPVerificationSchema = z.object({
  otp: z.string()
    .regex(/^\d{6}$/, 'OTP must be 6 digits')
    .describe('6-digit OTP code')
});

export type OTPVerificationDto = z.infer<typeof OTPVerificationSchema>;
export const OTPVerificationValidation = zodValidationPipeFactory(OTPVerificationSchema);

// Password Schema
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  );

// Phone Number Schema with comprehensive validation
export const PhoneNumberSchema = z.string()
  .min(1, 'Phone number is required')
  .max(20, 'Phone number too long')
  .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be in international format (e.g., +1234567890)')
  .refine((phone) => {
    // Remove + and check length
    const digits = phone.replace(/^\+/, '');
    return digits.length >= 7 && digits.length <= 15;
  }, 'Phone number must be between 7 and 15 digits')
  .refine((phone) => {
    // Ensure it starts with country code (not 0)
    const digits = phone.replace(/^\+/, '');
    return !digits.startsWith('0');
  }, 'Phone number cannot start with 0 after country code')
  .transform((phone) => {
    // Normalize phone number format
    return phone.startsWith('+') ? phone : `+${phone}`;
  });

// Registration Completion Schema
export const RegistrationCompletionSchema = z.object({
  password: PasswordSchema,
  phoneNumber: PhoneNumberSchema.optional()
    .describe('Phone number in international E.164 format (e.g., +1234567890)')
});

export type RegistrationCompletionDto = z.infer<typeof RegistrationCompletionSchema>;
export const RegistrationCompletionValidation = zodValidationPipeFactory(RegistrationCompletionSchema);

// Enhanced Login Schema
export const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password too long')
});

export type LoginDto = z.infer<typeof LoginSchema>;
export const LoginValidation = zodValidationPipeFactory(LoginSchema);

// Password Reset Request Schema
export const PasswordResetRequestSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase()
});

export type PasswordResetRequestDto = z.infer<typeof PasswordResetRequestSchema>;
export const PasswordResetRequestValidation = zodValidationPipeFactory(PasswordResetRequestSchema);

// Password Reset Verification Schema
export const PasswordResetVerificationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long')
    .toLowerCase(),
  otp: z.string()
    .regex(/^\d{6}$/, 'OTP must be 6 digits')
});

export type PasswordResetVerificationDto = z.infer<typeof PasswordResetVerificationSchema>;
export const PasswordResetVerificationValidation = zodValidationPipeFactory(PasswordResetVerificationSchema);

// Password Reset Completion Schema
export const PasswordResetCompletionSchema = z.object({
  newPassword: PasswordSchema
});

export type PasswordResetCompletionDto = z.infer<typeof PasswordResetCompletionSchema>;
export const PasswordResetCompletionValidation = zodValidationPipeFactory(PasswordResetCompletionSchema);

// Standard Error Response Schema
export const ErrorResponseSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
    type: z.string(),
    timestamp: z.string(),
    requestId: z.string(),
    details: z.object({
      field: z.string().optional(),
      retryAfter: z.number().optional(),
      maxAttempts: z.number().optional(),
      remainingAttempts: z.number().optional()
    }).optional()
  })
});

export type ErrorResponseDto = z.infer<typeof ErrorResponseSchema>;

// Standard Success Response Schema
export const SuccessResponseSchema = z.object({
  data: z.any(),
  message: z.string().optional(),
  meta: z.object({
    timestamp: z.string(),
    requestId: z.string()
  }).optional()
});

export type SuccessResponseDto = z.infer<typeof SuccessResponseSchema>;
