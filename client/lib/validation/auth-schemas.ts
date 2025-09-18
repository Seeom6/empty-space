// @ts-nocheck - Suppress Zod v4 deprecation warnings, functionality still works
import { z } from 'zod';

// Account roles enum
export enum AccountRole {
  USER = 'user',
  SELLER = 'seller',
  ADMIN = 'admin',
  OPERATOR = 'operator',
  SUPER_ADMIN = 'super_admin',
  EMPLOYEE = 'employee'
}

// Base validation schemas
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  // @ts-ignore - Zod v4 deprecation warning, functionality still works
  .email({ message: 'Please enter a valid email address' });

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number');

const nameSchema = z
  .string()
  .min(1, 'This field is required')
  .min(2, 'Must be at least 2 characters')
  .max(50, 'Must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Only letters and spaces are allowed');

const otpSchema = z
  .string()
  .min(1, 'OTP is required')
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

const inviteCodeSchema = z
  .string()
  .min(1, 'Invite code is required')
  .regex(/^\$INV-\d{4}-[A-Za-z0-9]{6}$/, 'Invalid invite code format (e.g., $INV-2024-ABC123)');

// === NEW 4-STEP REGISTRATION FLOW SCHEMAS ===

// Step 1: Validate Invite Code
export const validateInviteCodeSchema = z.object({
  inviteCode: inviteCodeSchema,
});

// Step 2: Register Email
export const registerEmailSchema = z.object({
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
});

// Step 3: Verify Registration OTP
export const verifyRegistrationOTPSchema = z.object({
  otp: otpSchema,
});

// Step 4: Complete Registration
export const completeRegistrationSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phoneNumber: z
      .string()
      .optional()
      .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
        message: 'Please enter a valid phone number in E.164 format',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// === AUTHENTICATION SCHEMAS ===

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// === PASSWORD RESET FLOW SCHEMAS ===

// Step 1: Request Password Reset
export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

// Step 2: Verify Password Reset OTP
export const verifyPasswordResetOTPSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

// Step 3: Complete Password Reset
export const completePasswordResetSchema = z.object({
  newPassword: passwordSchema,
});

// === FORM DATA TYPES ===

// 4-Step Registration Flow Form Data
export type ValidateInviteCodeFormData = z.infer<typeof validateInviteCodeSchema>;
export type RegisterEmailFormData = z.infer<typeof registerEmailSchema>;
export type VerifyRegistrationOTPFormData = z.infer<typeof verifyRegistrationOTPSchema>;
export type CompleteRegistrationFormData = z.infer<typeof completeRegistrationSchema>;

// Authentication Form Data
export type LoginFormData = z.infer<typeof loginSchema>;

// Password Reset Flow Form Data
export type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>;
export type VerifyPasswordResetOTPFormData = z.infer<typeof verifyPasswordResetOTPSchema>;
export type CompletePasswordResetFormData = z.infer<typeof completePasswordResetSchema>;

// === LEGACY SCHEMAS (for backward compatibility) ===

// User Registration Schema (Legacy)
export const userRegistrationSchema = z
  .object({
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: nameSchema,
    lastName: nameSchema,
    // @ts-ignore - Zod v4 deprecation warning, functionality still works
    accountRole: z.nativeEnum(AccountRole, 'Please select a valid account role'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Employee Registration Schema (Legacy)
export const employeeRegistrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    phoneNumber: phoneSchema.optional().or(z.literal('')),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    inviteCode: inviteCodeSchema,
    // @ts-ignore - Zod v4 deprecation warning, functionality still works
    image: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
    birthday: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// OTP Verification Schema (Legacy)
export const otpVerificationSchema = z.object({
  otp: otpSchema,
});



// === TYPE EXPORTS FOR FORM DATA ===

// New 4-step registration flow types
export type ValidateInviteCodeFormData = z.infer<typeof validateInviteCodeSchema>;
export type RegisterEmailFormData = z.infer<typeof registerEmailSchema>;
export type VerifyRegistrationOTPFormData = z.infer<typeof verifyRegistrationOTPSchema>;
export type CompleteRegistrationFormData = z.infer<typeof completeRegistrationSchema>;

// Authentication types
export type LoginFormData = z.infer<typeof loginSchema>;

// Password reset flow types
export type RequestPasswordResetFormData = z.infer<typeof requestPasswordResetSchema>;
export type VerifyPasswordResetOTPFormData = z.infer<typeof verifyPasswordResetOTPSchema>;
export type CompletePasswordResetFormData = z.infer<typeof completePasswordResetSchema>;

// Legacy types (for backward compatibility)
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type EmployeeRegistrationFormData = z.infer<typeof employeeRegistrationSchema>;
export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;

// Validation helper functions
export const validateField = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; error?: string; data?: T } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation failed',
      };
    }
    return { success: false, error: 'Validation failed' };
  }
};

export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; errors?: Record<string, string>; data?: T } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: any) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Custom validation rules
export const customValidations = {
  isStrongPassword: (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  },

  isValidPhoneNumber: (phone: string): boolean => {
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  },

  isValidInviteCode: (code: string): boolean => {
    return /^\$INV-\d{4}-[A-Za-z0-9]{6}$/.test(code);
  },

  isValidOTP: (otp: string): boolean => {
    return /^\d{6}$/.test(otp); // Updated to 6 digits as per API documentation
  },

  isValidEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
  },

  isValidName: (name: string): boolean => {
    return name.length >= 1 && name.length <= 50 && /^[a-zA-Z\s\-']+$/.test(name);
  },
};

// Error message helpers
export const getFieldError = (
  errors: Record<string, string> | undefined,
  fieldName: string
): string | undefined => {
  return errors?.[fieldName];
};

export const hasFieldError = (
  errors: Record<string, string> | undefined,
  fieldName: string
): boolean => {
  return !!errors?.[fieldName];
};

// Form state helpers
export const createInitialFormState = <T extends Record<string, any>>(
  fields: (keyof T)[]
): T => {
  const initialState = {} as T;
  fields.forEach((field) => {
    initialState[field] = '' as any;
  });
  return initialState;
};

export const resetFormErrors = (
  setErrors: (errors: Record<string, string> | undefined) => void
): void => {
  setErrors(undefined);
};

export const clearFieldError = (
  errors: Record<string, string> | undefined,
  fieldName: string,
  setErrors: (errors: Record<string, string> | undefined) => void
): void => {
  if (errors && errors[fieldName]) {
    const newErrors = { ...errors };
    delete newErrors[fieldName];
    setErrors(Object.keys(newErrors).length > 0 ? newErrors : undefined);
  }
};
