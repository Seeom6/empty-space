'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Clock, Lock, Mail } from 'lucide-react';
import { AuthErrorCodes } from '@/lib/api/types';

interface AuthError {
  code?: number;
  message: string;
  type?: string;
  details?: {
    field?: string;
    retryAfter?: number;
    maxAttempts?: number;
    remainingAttempts?: number;
  };
}

interface AuthErrorHandlerProps {
  error: AuthError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function AuthErrorHandler({ error, onRetry, onDismiss, className }: AuthErrorHandlerProps) {
  if (!error) return null;

  const getErrorIcon = () => {
    switch (error.code) {
      case AuthErrorCodes.RATE_LIMIT_EXCEEDED:
      case AuthErrorCodes.OTP_ATTEMPTS_EXCEEDED:
      case AuthErrorCodes.LOGIN_ATTEMPTS_EXCEEDED:
        return <Clock className="h-4 w-4" />;
      
      case AuthErrorCodes.ACCOUNT_LOCKED:
      case AuthErrorCodes.ACCOUNT_TEMPORARILY_LOCKED:
        return <Lock className="h-4 w-4" />;
      
      case AuthErrorCodes.INVALID_OTP:
      case AuthErrorCodes.OTP_EXPIRED:
        return <Mail className="h-4 w-4" />;
      
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorVariant = () => {
    switch (error.code) {
      case AuthErrorCodes.RATE_LIMIT_EXCEEDED:
      case AuthErrorCodes.ACCOUNT_LOCKED:
        return 'destructive' as const;
      
      case AuthErrorCodes.INVALID_OTP:
      case AuthErrorCodes.OTP_EXPIRED:
        return 'default' as const;
      
      default:
        return 'destructive' as const;
    }
  };

  const getRetryMessage = () => {
    if (error.details?.retryAfter) {
      const minutes = Math.ceil(error.details.retryAfter / 60);
      return `Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`;
    }
    
    if (error.details?.remainingAttempts !== undefined) {
      const remaining = error.details.remainingAttempts;
      if (remaining > 0) {
        return `${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`;
      }
    }
    
    return null;
  };

  const canRetry = () => {
    // Don't show retry for rate limiting or account locked errors
    if ([
      AuthErrorCodes.RATE_LIMIT_EXCEEDED,
      AuthErrorCodes.ACCOUNT_LOCKED,
      AuthErrorCodes.ACCOUNT_TEMPORARILY_LOCKED,
    ].includes(error.code as AuthErrorCodes)) {
      return false;
    }
    
    // Don't show retry if no attempts remaining
    if (error.details?.remainingAttempts === 0) {
      return false;
    }
    
    return true;
  };

  const getHelpText = () => {
    switch (error.code) {
      case AuthErrorCodes.INVITE_CODE_NOT_FOUND:
        return 'Please check your invite code or contact your administrator for a new one.';
      
      case AuthErrorCodes.INVITE_CODE_USED:
        return 'This invite code has already been used. Please contact your administrator for a new one.';
      
      case AuthErrorCodes.DUPLICATED_EMAIL:
        return 'An account with this email already exists. Try signing in instead.';
      
      case AuthErrorCodes.INVALID_CREDENTIALS:
        return 'Please check your email and password and try again.';
      
      case AuthErrorCodes.ACCOUNT_LOCKED:
        return 'Your account has been locked due to multiple failed login attempts. Please contact support.';
      
      case AuthErrorCodes.INVALID_OTP:
        return 'Please check the verification code and try again. Make sure to enter all 6 digits.';
      
      case AuthErrorCodes.OTP_EXPIRED:
        return 'The verification code has expired. Please request a new one.';
      
      case AuthErrorCodes.RATE_LIMIT_EXCEEDED:
        return 'Too many requests. Please wait before trying again.';
      
      default:
        return null;
    }
  };

  return (
    <Alert variant={getErrorVariant()} className={className}>
      {getErrorIcon()}
      <AlertDescription className="space-y-2">
        <div>
          <p className="font-medium">{error.message}</p>
          {getHelpText() && (
            <p className="text-sm mt-1">{getHelpText()}</p>
          )}
          {getRetryMessage() && (
            <p className="text-sm mt-1 text-muted-foreground">{getRetryMessage()}</p>
          )}
        </div>
        
        {(canRetry() && onRetry) || onDismiss ? (
          <div className="flex gap-2 mt-3">
            {canRetry() && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8"
              >
                Dismiss
              </Button>
            )}
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
