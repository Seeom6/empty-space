export interface StandardizedErrorResponse {
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
      lockDuration?: number;
      nextRetryAt?: string;
    };
  };
}

export interface RateLimitErrorDetails {
  retryAfter: number;
  maxAttempts: number;
  remainingAttempts: number;
  windowMs: number;
  resetTime: number;
}

export interface AccountLockErrorDetails {
  lockDuration: number;
  lockedUntil: string;
  reason: string;
  failedAttempts: number;
}

export interface ValidationErrorDetails {
  field: string;
  value?: any;
  constraint: string;
  allowedValues?: any[];
}

export interface SecurityEventDetails {
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  userAgent: string;
  additionalInfo?: Record<string, any>;
}

export class StandardizedError extends Error {
  public readonly code: number;
  public readonly type: string;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly requestId: string;

  constructor(
    code: number,
    message: string,
    type: string,
    details?: any,
    requestId?: string
  ) {
    super(message);
    this.code = code;
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId || this.generateRequestId();
    this.name = 'StandardizedError';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  toResponse(): StandardizedErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        type: this.type,
        timestamp: this.timestamp,
        requestId: this.requestId,
        details: this.details
      }
    };
  }
}

export enum ErrorType {
  // Authentication & Authorization
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  TOKEN_ERROR = 'TOKEN_ERROR',
  SESSION_ERROR = 'SESSION_ERROR',
  
  // Security
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  ACCOUNT_SECURITY_ERROR = 'ACCOUNT_SECURITY_ERROR',
  CSRF_ERROR = 'CSRF_ERROR',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INPUT_ERROR = 'INPUT_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  
  // Business Logic
  BUSINESS_LOGIC_ERROR = 'BUSINESS_LOGIC_ERROR',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
