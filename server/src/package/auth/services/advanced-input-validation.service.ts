import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ErrorCode } from '@Common/error';
import { StandardizedError, ErrorType, ValidationErrorDetails } from '@Common/error/error-response.interface';

export interface ValidationRule {
  field: string;
  rules: string[];
  customValidator?: (value: any) => boolean;
  sanitizer?: (value: any) => any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorDetails[];
  sanitizedData: Record<string, any>;
  securityFlags: string[];
}

@Injectable()
export class AdvancedInputValidationService {
  private readonly suspiciousPatterns = [
    // SQL Injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/|;|'|"|`)/,
    
    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    
    // Path traversal
    /\.\.[\/\\]/,
    /(\.\.%2f|\.\.%5c)/i,
    
    // Command injection
    /[;&|`$(){}[\]]/,
    /(curl|wget|nc|netcat|bash|sh|cmd|powershell)/i,
    
    // LDAP injection
    /[()&|!]/,
    
    // NoSQL injection
    /\$where|\$ne|\$gt|\$lt|\$regex/i
  ];

  private readonly emailSchema = z.string()
    .email('Invalid email format')
    .min(5, 'Email too short')
    .max(254, 'Email too long')
    .refine(email => !this.containsSuspiciousPatterns(email), 'Email contains suspicious patterns');

  private readonly passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .refine(pwd => /[a-z]/.test(pwd), 'Password must contain lowercase letter')
    .refine(pwd => /[A-Z]/.test(pwd), 'Password must contain uppercase letter')
    .refine(pwd => /\d/.test(pwd), 'Password must contain number')
    .refine(pwd => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd), 'Password must contain special character');

  private readonly nameSchema = z.string()
    .min(1, 'Name is required')
    .max(50, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .refine(name => !this.containsSuspiciousPatterns(name), 'Name contains suspicious patterns');

  private readonly inviteCodeSchema = z.string()
    .regex(/^\$INV-\d{4}-[A-Z0-9]{6}$/, 'Invalid invite code format')
    .refine(code => !this.containsSuspiciousPatterns(code), 'Invite code contains suspicious patterns');

  private readonly otpSchema = z.string()
    .regex(/^\d{6}$/, 'OTP must be 6 digits')
    .refine(otp => !this.containsSuspiciousPatterns(otp), 'OTP contains suspicious patterns');

  validateEmail(email: string, requestId?: string): ValidationResult {
    return this.validateField('email', email, this.emailSchema, requestId);
  }

  validatePassword(password: string, requestId?: string): ValidationResult {
    return this.validateField('password', password, this.passwordSchema, requestId);
  }

  validateName(name: string, fieldName: string = 'name', requestId?: string): ValidationResult {
    return this.validateField(fieldName, name, this.nameSchema, requestId);
  }

  validateInviteCode(inviteCode: string, requestId?: string): ValidationResult {
    return this.validateField('inviteCode', inviteCode, this.inviteCodeSchema, requestId);
  }

  validateOTP(otp: string, requestId?: string): ValidationResult {
    return this.validateField('otp', otp, this.otpSchema, requestId);
  }

  validateRegistrationData(data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
  }, requestId?: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      sanitizedData: {},
      securityFlags: []
    };

    // Validate email
    const emailResult = this.validateEmail(data.email, requestId);
    if (!emailResult.isValid) {
      result.isValid = false;
      result.errors.push(...emailResult.errors);
    } else {
      result.sanitizedData.email = emailResult.sanitizedData.email;
    }
    result.securityFlags.push(...emailResult.securityFlags);

    // Validate first name
    const firstNameResult = this.validateName(data.firstName, 'firstName', requestId);
    if (!firstNameResult.isValid) {
      result.isValid = false;
      result.errors.push(...firstNameResult.errors);
    } else {
      result.sanitizedData.firstName = firstNameResult.sanitizedData.firstName;
    }
    result.securityFlags.push(...firstNameResult.securityFlags);

    // Validate last name
    const lastNameResult = this.validateName(data.lastName, 'lastName', requestId);
    if (!lastNameResult.isValid) {
      result.isValid = false;
      result.errors.push(...lastNameResult.errors);
    } else {
      result.sanitizedData.lastName = lastNameResult.sanitizedData.lastName;
    }
    result.securityFlags.push(...lastNameResult.securityFlags);

    // Validate password if provided
    if (data.password) {
      const passwordResult = this.validatePassword(data.password, requestId);
      if (!passwordResult.isValid) {
        result.isValid = false;
        result.errors.push(...passwordResult.errors);
      } else {
        result.sanitizedData.password = passwordResult.sanitizedData.password;
      }
      result.securityFlags.push(...passwordResult.securityFlags);
    }

    return result;
  }

  validateLoginData(data: {
    email: string;
    password: string;
  }, requestId?: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      sanitizedData: {},
      securityFlags: []
    };

    // For login, we use more lenient validation to avoid revealing information
    const emailResult = this.validateBasicEmail(data.email, requestId);
    const passwordResult = this.validateBasicPassword(data.password, requestId);

    if (!emailResult.isValid || !passwordResult.isValid) {
      result.isValid = false;
      result.errors.push({
        field: 'credentials',
        value: '[REDACTED]',
        constraint: 'Invalid email or password format',
        allowedValues: undefined
      });
    } else {
      result.sanitizedData.email = emailResult.sanitizedData.email;
      result.sanitizedData.password = passwordResult.sanitizedData.password;
    }

    result.securityFlags.push(...emailResult.securityFlags, ...passwordResult.securityFlags);

    return result;
  }

  sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;&|`$(){}[\]]/g, '') // Remove command injection chars
      .substring(0, 1000); // Limit length
  }

  detectSuspiciousActivity(input: string): string[] {
    const flags: string[] = [];

    if (this.containsSuspiciousPatterns(input)) {
      flags.push('suspicious_patterns');
    }

    if (this.containsExcessiveSpecialChars(input)) {
      flags.push('excessive_special_chars');
    }

    if (this.containsEncodedContent(input)) {
      flags.push('encoded_content');
    }

    if (this.containsLongRepeatedChars(input)) {
      flags.push('repeated_chars');
    }

    return flags;
  }

  createValidationError(
    field: string,
    value: any,
    constraint: string,
    requestId?: string
  ): StandardizedError {
    const details: ValidationErrorDetails = {
      field,
      value: this.sanitizeForError(value),
      constraint,
      allowedValues: undefined
    };

    return new StandardizedError(
      ErrorCode.VALIDATION_ERROR,
      `Validation failed for field: ${field}`,
      ErrorType.VALIDATION_ERROR,
      details,
      requestId
    );
  }

  private validateField(
    fieldName: string,
    value: any,
    schema: z.ZodSchema,
    requestId?: string
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      sanitizedData: {},
      securityFlags: []
    };

    try {
      // Sanitize input first
      const sanitizedValue = typeof value === 'string' ? this.sanitizeInput(value) : value;
      
      // Validate with schema
      const validatedValue = schema.parse(sanitizedValue);
      result.sanitizedData[fieldName] = validatedValue;

      // Check for suspicious patterns
      if (typeof value === 'string') {
        result.securityFlags = this.detectSuspiciousActivity(value);
      }

    } catch (error) {
      result.isValid = false;
      
      if (error instanceof z.ZodError) {
        for (const issue of error.issues) {
          result.errors.push({
            field: fieldName,
            value: this.sanitizeForError(value),
            constraint: issue.message,
            allowedValues: undefined
          });
        }
      } else {
        result.errors.push({
          field: fieldName,
          value: this.sanitizeForError(value),
          constraint: 'Validation failed',
          allowedValues: undefined
        });
      }
    }

    return result;
  }

  private validateBasicEmail(email: string, requestId?: string): ValidationResult {
    const basicEmailSchema = z.string()
      .min(1, 'Email required')
      .max(254, 'Email too long')
      .refine(e => e.includes('@'), 'Invalid email format');

    return this.validateField('email', email, basicEmailSchema, requestId);
  }

  private validateBasicPassword(password: string, requestId?: string): ValidationResult {
    const basicPasswordSchema = z.string()
      .min(1, 'Password required')
      .max(128, 'Password too long');

    return this.validateField('password', password, basicPasswordSchema, requestId);
  }

  private containsSuspiciousPatterns(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    
    return this.suspiciousPatterns.some(pattern => pattern.test(input));
  }

  private containsExcessiveSpecialChars(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    
    const specialCharCount = (input.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    return specialCharCount > input.length * 0.3; // More than 30% special chars
  }

  private containsEncodedContent(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    
    // Check for URL encoding, base64, hex encoding
    const encodingPatterns = [
      /%[0-9a-fA-F]{2}/, // URL encoding
      /[A-Za-z0-9+\/]{20,}={0,2}/, // Base64
      /\\x[0-9a-fA-F]{2}/, // Hex encoding
      /\\u[0-9a-fA-F]{4}/ // Unicode encoding
    ];
    
    return encodingPatterns.some(pattern => pattern.test(input));
  }

  private containsLongRepeatedChars(input: string): boolean {
    if (!input || typeof input !== 'string') return false;
    
    // Check for more than 10 repeated characters
    return /(.)\1{10,}/.test(input);
  }

  private sanitizeForError(value: any): any {
    if (typeof value === 'string') {
      // Truncate and sanitize for error reporting
      return value.substring(0, 50).replace(/[<>'"]/g, '');
    }
    return value;
  }
}
