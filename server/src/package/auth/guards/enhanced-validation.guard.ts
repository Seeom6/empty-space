import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { z } from 'zod';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';

// Common validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const INVITE_CODE_REGEX = /^\$INV-\d{4}-[A-Z0-9]{6}$/;
const OTP_REGEX = /^\d{6}$/;

// Sanitization functions
function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .substring(0, 1000); // Limit length
}

function sanitizeEmail(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .substring(0, 254); // RFC 5321 limit
}

function sanitizeName(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z\s'-]/g, '') // Only allow letters, spaces, hyphens, apostrophes
    .substring(0, 50);
}

@Injectable()
export class EnhancedValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Validate and sanitize request body
    if (request.body && typeof request.body === 'object') {
      this.validateAndSanitizeBody(request);
    }

    // Validate headers
    this.validateHeaders(request);

    // Validate query parameters
    if (request.query && typeof request.query === 'object') {
      this.validateQueryParams(request);
    }

    return true;
  }

  private validateAndSanitizeBody(request: Request): void {
    const body = request.body;
    const path = request.path;

    // Route-specific validation
    if (path.includes('/validate-invite-code')) {
      this.validateInviteCodeRequest(body);
    } else if (path.includes('/register-email')) {
      this.validateEmailRegistrationRequest(body);
    } else if (path.includes('/verify-registration-otp') || path.includes('/verify-reset-otp')) {
      this.validateOTPRequest(body);
    } else if (path.includes('/complete-registration')) {
      this.validateRegistrationCompletionRequest(body);
    } else if (path.includes('/log-in') || path.includes('/login')) {
      this.validateLoginRequest(body);
    } else if (path.includes('/request-password-reset')) {
      this.validatePasswordResetRequest(body);
    } else if (path.includes('/reset-password')) {
      this.validatePasswordResetCompletionRequest(body);
    }

    // General sanitization for all string fields
    this.sanitizeObjectStrings(body);
  }

  private validateInviteCodeRequest(body: any): void {
    if (!body.inviteCode || typeof body.inviteCode !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invite code is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!INVITE_CODE_REGEX.test(body.inviteCode)) {
      throw new AppError({
        code: ErrorCode.INVITE_CODE_INVALID_FORMAT,
        message: 'Invalid invite code format',
        errorType: 'VALIDATION_ERROR'
      });
    }
  }

  private validateEmailRegistrationRequest(body: any): void {
    // Validate email
    if (!body.email || typeof body.email !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Email is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!EMAIL_REGEX.test(body.email) || body.email.length > 254) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid email format',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Validate first name
    if (!body.firstName || typeof body.firstName !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'First name is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!NAME_REGEX.test(body.firstName) || body.firstName.length > 50) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid first name format',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Validate last name
    if (!body.lastName || typeof body.lastName !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Last name is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!NAME_REGEX.test(body.lastName) || body.lastName.length > 50) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid last name format',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Sanitize
    body.email = sanitizeEmail(body.email);
    body.firstName = sanitizeName(body.firstName);
    body.lastName = sanitizeName(body.lastName);
  }

  private validateOTPRequest(body: any): void {
    if (!body.otp || typeof body.otp !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'OTP is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!OTP_REGEX.test(body.otp)) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'OTP must be 6 digits',
        errorType: 'VALIDATION_ERROR'
      });
    }
  }

  private validateRegistrationCompletionRequest(body: any): void {
    // Validate password
    if (!body.password || typeof body.password !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (body.password.length < 8 || body.password.length > 128) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password must be between 8 and 128 characters',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!PASSWORD_REGEX.test(body.password)) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password must contain uppercase, lowercase, number, and special character',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Validate phone number if provided
    if (body.phoneNumber && typeof body.phoneNumber === 'string') {
      if (!PHONE_REGEX.test(body.phoneNumber)) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid phone number format',
          errorType: 'VALIDATION_ERROR'
        });
      }
    }
  }

  private validateLoginRequest(body: any): void {
    // Validate email
    if (!body.email || typeof body.email !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Email is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!EMAIL_REGEX.test(body.email)) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid email format',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Validate password
    if (!body.password || typeof body.password !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (body.password.length > 128) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password too long',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Sanitize
    body.email = sanitizeEmail(body.email);
  }

  private validatePasswordResetRequest(body: any): void {
    if (!body.email || typeof body.email !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Email is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!EMAIL_REGEX.test(body.email)) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid email format',
        errorType: 'VALIDATION_ERROR'
      });
    }

    body.email = sanitizeEmail(body.email);
  }

  private validatePasswordResetCompletionRequest(body: any): void {
    if (!body.newPassword || typeof body.newPassword !== 'string') {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'New password is required',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (body.newPassword.length < 8 || body.newPassword.length > 128) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password must be between 8 and 128 characters',
        errorType: 'VALIDATION_ERROR'
      });
    }

    if (!PASSWORD_REGEX.test(body.newPassword)) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password must contain uppercase, lowercase, number, and special character',
        errorType: 'VALIDATION_ERROR'
      });
    }
  }

  private validateHeaders(request: Request): void {
    // Validate User-Agent
    const userAgent = request.get('User-Agent');
    if (userAgent && userAgent.length > 500) {
      throw new AppError({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid User-Agent header',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Validate Content-Type for POST requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.get('Content-Type');
      if (contentType && !contentType.includes('application/json')) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Invalid Content-Type',
          errorType: 'VALIDATION_ERROR'
        });
      }
    }
  }

  private validateQueryParams(request: Request): void {
    const query = request.query;
    
    // Limit query parameter values
    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string' && value.length > 1000) {
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: `Query parameter ${key} too long`,
          errorType: 'VALIDATION_ERROR'
        });
      }
    }
  }

  private sanitizeObjectStrings(obj: any): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        this.sanitizeObjectStrings(obj[key]);
      }
    }
  }
}
