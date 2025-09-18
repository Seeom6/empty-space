import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SessionService, SessionData } from './session.service';
import { OtpService } from './otp.service';
import { AccountService } from '@Modules/account/account/services';
import { HashService } from '@Package/auth';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';
import { EnvironmentService } from '@Infrastructure/config';
import { EmailTemplateService } from '@Package/auth/services/email-template.service';
import { SecurityEventLoggingService, SecurityEventType, SecurityEventSeverity } from '@Package/auth/services/security-event-logging.service';
import { TokenBlacklistService, BlacklistReason } from '@Package/auth/services/token-blacklist.service';
import { RedisService } from '@Infrastructure/cache';
import { v4 as uuidv4 } from 'uuid';

export interface PasswordResetRequestResult {
  message: string;
  otpToken?: string;
}

export interface PasswordResetVerificationResult {
  message: string;
  resetToken: string;
}

export interface PasswordResetCompletionResult {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ResendOTPResult {
  message: string;
  otpToken: string;
}

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly otpService: OtpService,
    private readonly accountService: AccountService,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly securityEventService: SecurityEventLoggingService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly redisService: RedisService
  ) {}

  async requestPasswordReset(
    email: string,
    ipAddress: string,
    userAgent: string
  ): Promise<PasswordResetRequestResult> {
    try {
      // Always return the same message for security (prevent email enumeration)
      const securityMessage = 'If an account exists with this email, you will receive a password reset email shortly.';

      // Check if account exists
      const account = await this.accountService.findByEmail(email, false);
      
      if (!account) {
        // Log security event for non-existent email attempt
        await this.securityEventService.logEvent({
          eventType: SecurityEventType.PASSWORD_RESET_REQUESTED,
          severity: SecurityEventSeverity.LOW,
          ipAddress,
          userAgent,
          details: {
            email,
            accountExists: false,
            reason: 'Email not found'
          }
        });

        return { message: securityMessage };
      }

      // Check if account is locked
      if (account.lockedUntil && account.lockedUntil > new Date()) {
        await this.securityEventService.logEvent({
          eventType: SecurityEventType.PASSWORD_RESET_REQUESTED,
          severity: SecurityEventSeverity.MEDIUM,
          accountId: account._id.toString(),
          ipAddress,
          userAgent,
          details: {
            email,
            accountLocked: true,
            lockedUntil: account.lockedUntil
          }
        });

        throw new AppError({
          code: ErrorCode.ACCOUNT_LOCKED,
          message: 'Account is temporarily locked. Please try again later.',
          errorType: 'ACCOUNT_LOCKED'
        });
      }

      // Generate and send OTP
      await this.otpService.generateAndSendOTP(email, 'password_reset', {
        firstName: account.employee?.firstName || account.firstName,
        lastName: account.employee?.lastName || account.lastName
      });

      // Create OTP token for session management
      const otpToken = this.jwtService.sign(
        {
          email,
          type: 'otp',
          purpose: 'password_reset',
          jti: uuidv4(),
          iat: Math.floor(Date.now() / 1000)
        },
        {
          secret: this.environmentService.get('jwt.jwtAccessSecret'),
          expiresIn: '10m'
        }
      );

      // Log successful password reset request
      await this.securityEventService.logEvent({
        eventType: SecurityEventType.PASSWORD_RESET_REQUESTED,
        severity: SecurityEventSeverity.MEDIUM,
        accountId: account._id.toString(),
        ipAddress,
        userAgent,
        details: {
          email,
          otpSent: true
        }
      });

      return {
        message: securityMessage,
        otpToken
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // Log unexpected error
      await this.securityEventService.logEvent({
        eventType: SecurityEventType.PASSWORD_RESET_REQUESTED,
        severity: SecurityEventSeverity.HIGH,
        ipAddress,
        userAgent,
        details: {
          email,
          error: error.message,
          errorType: 'UNEXPECTED_ERROR'
        }
      });

      throw new AppError({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred. Please try again later.',
        errorType: 'INTERNAL_ERROR'
      });
    }
  }

  async verifyPasswordResetOTP(
    otpToken: string,
    otp: string
  ): Promise<PasswordResetVerificationResult> {
    try {
      // Verify and decode OTP token
      const payload = this.jwtService.verify(otpToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });

      if (payload.type !== 'otp' || payload.purpose !== 'password_reset') {
        throw new AppError({
          code: ErrorCode.INVALID_OTP_TOKEN,
          message: 'Invalid OTP token',
          errorType: 'INVALID_OTP_TOKEN'
        });
      }

      const email = payload.email;

      // Verify OTP
      await this.otpService.verifyOTP(email, otp, 'password_reset');

      // Get account for logging
      const account = await this.accountService.findByEmail(email, false);
      
      // Create reset token
      const resetToken = this.jwtService.sign(
        {
          email,
          type: 'password_reset',
          jti: uuidv4(),
          iat: Math.floor(Date.now() / 1000)
        },
        {
          secret: this.environmentService.get('jwt.jwtAccessSecret'),
          expiresIn: '15m'
        }
      );

      // Store reset token in Redis for additional validation
      await this.redisService.set(
        `password_reset:${email}`,
        resetToken,
        15 * 60 // 15 minutes
      );

      // Log successful OTP verification
      await this.securityEventService.logEvent({
        eventType: SecurityEventType.OTP_VERIFIED,
        severity: SecurityEventSeverity.MEDIUM,
        accountId: account?._id.toString(),
        details: {
          email,
          purpose: 'password_reset',
          otpVerified: true
        }
      });

      return {
        message: 'OTP verified successfully. You can now reset your password.',
        resetToken
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: ErrorCode.OTP_VERIFICATION_FAILED,
        message: 'Failed to verify OTP. Please try again.',
        errorType: 'OTP_VERIFICATION_FAILED'
      });
    }
  }

  async completePasswordReset(
    resetToken: string,
    newPassword: string
  ): Promise<PasswordResetCompletionResult> {
    try {
      // Verify reset token
      const payload = this.jwtService.verify(resetToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });

      if (payload.type !== 'password_reset') {
        throw new AppError({
          code: ErrorCode.INVALID_RESET_TOKEN,
          message: 'Invalid reset token',
          errorType: 'INVALID_RESET_TOKEN'
        });
      }

      const email = payload.email;

      // Verify reset token exists in Redis
      const storedToken = await this.redisService.get(`password_reset:${email}`);
      if (!storedToken || storedToken !== resetToken) {
        throw new AppError({
          code: ErrorCode.INVALID_RESET_TOKEN,
          message: 'Reset token has expired or is invalid',
          errorType: 'INVALID_RESET_TOKEN'
        });
      }

      // Get account
      const account = await this.accountService.findByEmail(email, false);
      if (!account) {
        throw new AppError({
          code: ErrorCode.ACCOUNT_NOT_FOUND,
          message: 'Account not found',
          errorType: 'ACCOUNT_NOT_FOUND'
        });
      }

      // Hash new password
      const hashedPassword = await HashService.hashPassword(newPassword);

      // Update password and clear failed attempts
      await this.accountService.updateByEmail(email, {
        password: hashedPassword,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastPasswordChange: new Date()
      } as any);

      // Blacklist all existing tokens for this user for security
      await this.tokenBlacklistService.blacklistAllUserTokens(
        account._id.toString(),
        BlacklistReason.PASSWORD_CHANGED
      );

      // Clean up reset token
      await this.redisService.del([`password_reset:${email}`]);

      // Log successful password reset
      await this.securityEventService.logEvent({
        eventType: SecurityEventType.PASSWORD_RESET_COMPLETED,
        severity: SecurityEventSeverity.MEDIUM,
        accountId: account._id.toString(),
        details: {
          email,
          passwordChanged: true,
          tokensBlacklisted: true
        }
      });

      return {
        message: 'Password has been reset successfully. Please log in with your new password.',
        user: {
          id: account._id.toString(),
          email: account.email,
          firstName: account.employee?.firstName || account.firstName || '',
          lastName: account.employee?.lastName || account.lastName || ''
        }
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: ErrorCode.PASSWORD_RESET_FAILED,
        message: 'Failed to reset password. Please try again.',
        errorType: 'PASSWORD_RESET_FAILED'
      });
    }
  }

  async resendPasswordResetOTP(otpToken: string): Promise<ResendOTPResult> {
    try {
      // Verify and decode OTP token
      const payload = this.jwtService.verify(otpToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });

      if (payload.type !== 'otp' || payload.purpose !== 'password_reset') {
        throw new AppError({
          code: ErrorCode.INVALID_OTP_TOKEN,
          message: 'Invalid OTP token',
          errorType: 'INVALID_OTP_TOKEN'
        });
      }

      const email = payload.email;

      // Get account for user data
      const account = await this.accountService.findByEmail(email, false);
      if (!account) {
        throw new AppError({
          code: ErrorCode.ACCOUNT_NOT_FOUND,
          message: 'Account not found',
          errorType: 'ACCOUNT_NOT_FOUND'
        });
      }

      // Generate and send new OTP
      await this.otpService.generateAndSendOTP(email, 'password_reset', {
        firstName: account.employee?.firstName || account.firstName,
        lastName: account.employee?.lastName || account.lastName
      });

      // Create new OTP token
      const newOtpToken = this.jwtService.sign(
        {
          email,
          type: 'otp',
          purpose: 'password_reset',
          jti: uuidv4(),
          iat: Math.floor(Date.now() / 1000)
        },
        {
          secret: this.environmentService.get('jwt.jwtAccessSecret'),
          expiresIn: '10m'
        }
      );

      return {
        message: 'A new verification code has been sent to your email.',
        otpToken: newOtpToken
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: ErrorCode.OTP_GENERATION_FAILED,
        message: 'Failed to resend OTP. Please try again.',
        errorType: 'OTP_GENERATION_FAILED'
      });
    }
  }
}
