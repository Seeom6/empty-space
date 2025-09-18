import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';

export interface StandardErrorResponse {
  error: {
    code: number;
    message: string;
    type: string;
    timestamp: string;
    requestId: string;
    details?: {
      field?: string;
      retryAfter?: number;
      maxAttempts?: number;
      remainingAttempts?: number;
    };
  };
}

@Injectable()
export class ErrorResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = uuidv4();

    // Add request ID to request for logging
    request['requestId'] = requestId;

    return next.handle().pipe(
      catchError((error) => {
        const standardError = this.transformError(error, requestId);
        
        // Log error for monitoring
        this.logError(error, request, requestId);

        // Set appropriate HTTP status
        const httpStatus = this.getHttpStatus(error);
        response.status(httpStatus);

        return throwError(() => new HttpException(standardError, httpStatus));
      }),
    );
  }

  private transformError(error: any, requestId: string): StandardErrorResponse {
    const timestamp = new Date().toISOString();
    const isProduction = process.env.NODE_ENV === 'production';

    // Handle AppError (our custom errors)
    if (error instanceof AppError) {
      return {
        error: {
          code: error.code,
          message: this.sanitizeErrorMessage(error.message, isProduction),
          type: error.errorType || 'APPLICATION_ERROR',
          timestamp,
          requestId,
          details: this.sanitizeErrorDetails(error.details, isProduction)
        }
      };
    }

    // Handle validation errors
    if (error.name === 'ValidationError' || error.name === 'ZodError') {
      return {
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: this.sanitizeErrorMessage(this.extractValidationMessage(error), isProduction),
          type: 'VALIDATION_ERROR',
          timestamp,
          requestId,
          details: {
            field: this.extractValidationField(error)
          }
        }
      };
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
      return {
        error: {
          code: ErrorCode.INVALID_TOKEN,
          message: 'Invalid token',
          type: 'INVALID_TOKEN',
          timestamp,
          requestId
        }
      };
    }

    if (error.name === 'TokenExpiredError') {
      return {
        error: {
          code: ErrorCode.EXPIRED_TOKEN,
          message: 'Token has expired',
          type: 'EXPIRED_TOKEN',
          timestamp,
          requestId
        }
      };
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = this.extractDuplicateField(error);
      return {
        error: {
          code: ErrorCode.DUPLICATED_EMAIL, // Default to email, can be enhanced
          message: `${field} already exists`,
          type: 'DUPLICATE_ERROR',
          timestamp,
          requestId,
          details: {
            field
          }
        }
      };
    }

    // Handle rate limiting errors
    if (error.message && error.message.includes('Too many requests')) {
      return {
        error: {
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: error.message,
          type: 'RATE_LIMIT_EXCEEDED',
          timestamp,
          requestId,
          details: error.details
        }
      };
    }

    // Handle generic HTTP exceptions
    if (error instanceof HttpException) {
      return {
        error: {
          code: error.getStatus(),
          message: error.message,
          type: 'HTTP_ERROR',
          timestamp,
          requestId
        }
      };
    }

    // Handle unknown errors
    return {
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred',
        type: 'INTERNAL_SERVER_ERROR',
        timestamp,
        requestId
      }
    };
  }

  private getHttpStatus(error: any): number {
    if (error instanceof AppError) {
      // Map error codes to HTTP status codes
      if (error.code >= 4000 && error.code < 5000) {
        return HttpStatus.BAD_REQUEST;
      }
      if (error.code >= 4010 && error.code < 4020) {
        return HttpStatus.UNAUTHORIZED;
      }
      if (error.code >= 4030 && error.code < 4040) {
        return HttpStatus.FORBIDDEN;
      }
      if (error.code >= 4040 && error.code < 4050) {
        return HttpStatus.NOT_FOUND;
      }
      if (error.code >= 4290 && error.code < 4300) {
        return HttpStatus.TOO_MANY_REQUESTS;
      }
      if (error.code >= 5000) {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
      return HttpStatus.BAD_REQUEST;
    }

    if (error instanceof HttpException) {
      return error.getStatus();
    }

    if (error.name === 'ValidationError' || error.name === 'ZodError') {
      return HttpStatus.BAD_REQUEST;
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return HttpStatus.UNAUTHORIZED;
    }

    if (error.code === 11000) {
      return HttpStatus.CONFLICT;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractValidationMessage(error: any): string {
    if (error.issues && Array.isArray(error.issues)) {
      // Zod error
      return error.issues.map((issue: any) => issue.message).join(', ');
    }

    if (error.errors) {
      // Mongoose validation error
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return messages.join(', ');
    }

    return error.message || 'Validation failed';
  }

  private extractValidationField(error: any): string | undefined {
    if (error.issues && Array.isArray(error.issues) && error.issues.length > 0) {
      // Zod error
      return error.issues[0].path?.join('.') || undefined;
    }

    if (error.errors) {
      // Mongoose validation error
      const firstError = Object.keys(error.errors)[0];
      return firstError;
    }

    return undefined;
  }

  private extractDuplicateField(error: any): string {
    if (error.keyPattern) {
      return Object.keys(error.keyPattern)[0] || 'field';
    }

    if (error.errmsg) {
      const match = error.errmsg.match(/index: (\w+)/);
      return match ? match[1] : 'field';
    }

    return 'field';
  }

  private logError(error: any, request: Request, requestId: string): void {
    const logData = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      timestamp: new Date().toISOString()
    };

    // Use proper logging service instead of console
    const logger = new (require('@nestjs/common').Logger)('ErrorResponseInterceptor');
    logger.error('Request Error', JSON.stringify(logData, null, 2));
  }

  /**
   * Sanitize error messages to prevent sensitive information leakage
   */
  private sanitizeErrorMessage(message: string, isProduction: boolean): string {
    if (!isProduction) {
      return message;
    }

    // List of sensitive patterns to remove in production
    const sensitivePatterns = [
      /password/gi,
      /secret/gi,
      /token/gi,
      /key/gi,
      /mongodb:\/\/[^@]+@/gi, // MongoDB connection strings
      /redis:\/\/[^@]+@/gi,   // Redis connection strings
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses (partial)
      /\/[a-zA-Z0-9\/\-_]+\.js:\d+:\d+/g, // File paths with line numbers
    ];

    let sanitizedMessage = message;
    sensitivePatterns.forEach(pattern => {
      sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
    });

    // Generic error messages for common authentication errors
    if (sanitizedMessage.toLowerCase().includes('invalid credentials')) {
      return 'Authentication failed';
    }
    if (sanitizedMessage.toLowerCase().includes('user not found')) {
      return 'Authentication failed';
    }
    if (sanitizedMessage.toLowerCase().includes('account locked')) {
      return 'Account temporarily unavailable';
    }

    return sanitizedMessage;
  }

  /**
   * Sanitize error details to prevent sensitive information leakage
   */
  private sanitizeErrorDetails(details: any, isProduction: boolean): any {
    if (!isProduction || !details) {
      return details;
    }

    const sanitizedDetails = { ...details };

    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'secret', 'token', 'key', 'hash', 'salt',
      'connectionString', 'uri', 'stack', 'stackTrace'
    ];

    sensitiveFields.forEach(field => {
      if (sanitizedDetails[field]) {
        sanitizedDetails[field] = '[REDACTED]';
      }
    });

    // Recursively sanitize nested objects
    Object.keys(sanitizedDetails).forEach(key => {
      if (typeof sanitizedDetails[key] === 'object' && sanitizedDetails[key] !== null) {
        sanitizedDetails[key] = this.sanitizeErrorDetails(sanitizedDetails[key], isProduction);
      }
    });

    return sanitizedDetails;
  }
}
