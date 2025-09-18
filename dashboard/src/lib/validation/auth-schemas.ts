import { z } from 'zod';
import { AccountRole } from '../types/auth';

// Base validation schemas
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

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
  .length(5, 'OTP must be exactly 5 digits')
  .regex(/^\d+$/, 'OTP must contain only numbers');

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// User Registration Schema
export const userRegistrationSchema = z
  .object({
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    firstName: nameSchema,
    lastName: nameSchema,
    accountRole: z.nativeEnum(AccountRole, {
      errorMap: () => ({ message: 'Please select a valid account role' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Employee Registration Schema
export const employeeRegistrationSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    phoneNumber: phoneSchema.optional().or(z.literal('')),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    inviteCode: z
      .string()
      .min(1, 'Invite code is required')
      .regex(/^\$INV-\d{4}-[A-Z0-9]{6}$/, 'Invalid invite code format'),
    image: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    birthday: z.date().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// OTP Verification Schema
export const otpVerificationSchema = z.object({
  otp: otpSchema,
});

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    otp: otpSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Admin Login Schema
export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Type exports for form data
export type LoginFormData = z.infer<typeof loginSchema>;
export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;
export type EmployeeRegistrationFormData = z.infer<typeof employeeRegistrationSchema>;
export type OTPVerificationFormData = z.infer<typeof otpVerificationSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

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
        error: error.errors[0]?.message || 'Validation failed',
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
      error.errors.forEach((err) => {
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
    return /^\$INV-\d{4}-[A-Z0-9]{6}$/.test(code);
  },

  isValidOTP: (otp: string): boolean => {
    return /^\d{5}$/.test(otp);
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
