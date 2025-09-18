import { Body, Post, Req, Res, UseGuards, UseInterceptors, Injectable, CanActivate, ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentService } from '@Infrastructure/config';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';
import { WebController } from '@Package/api';
import {
  PasswordResetRequestDto,
  PasswordResetRequestValidation,
  PasswordResetVerificationDto,
  PasswordResetVerificationValidation,
  PasswordResetCompletionDto,
  PasswordResetCompletionValidation
} from '../dto/validation/registration.schemas';
import { RateLimitInterceptor } from '../interceptors/rate-limit.interceptor';
import { OTPTokenGuard } from '@Package/auth/guards/otp-token.guard';
import { OTPToken } from '@Package/auth/decorators/otp-token.decorator';
import { SecureCookieService } from '@Package/auth/services/secure-cookie.service';
import { PasswordResetService } from '../../services/password-reset.service';
import { v4 as uuidv4 } from 'uuid';

// ResetTokenGuard definition
@Injectable()
export class ResetTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Extract reset token from HTTP-only cookie
    const resetToken = request.cookies?.resetToken;

    if (!resetToken) {
      throw new AppError({
        code: ErrorCode.INVALID_RESET_TOKEN,
        message: 'Reset token not found',
        errorType: 'INVALID_RESET_TOKEN'
      });
    }

    try {
      // Verify the reset token
      const payload = this.jwtService.verify(resetToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });

      // Validate token type
      if (payload.type !== 'password_reset') {
        throw new AppError({
          code: ErrorCode.INVALID_RESET_TOKEN,
          message: 'Invalid token type',
          errorType: 'INVALID_RESET_TOKEN'
        });
      }

      // Attach the token payload to the request for use in controllers
      request['resetToken'] = resetToken;
      request['resetPayload'] = payload;

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError({
        code: ErrorCode.INVALID_RESET_TOKEN,
        message: 'Invalid or expired reset token',
        errorType: 'INVALID_RESET_TOKEN'
      });
    }
  }
}

// ResetToken decorator definition
export const ResetToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.resetToken;
  },
);

@WebController({
  prefix: 'auth'
})
export class PasswordResetController {
  constructor(
    private readonly passwordResetService: PasswordResetService,
    private readonly secureCookieService: SecureCookieService
  ) {}

  @Post('request-password-reset')
  @UseInterceptors(RateLimitInterceptor('password_reset'))
  async requestPasswordReset(
    @Body(PasswordResetRequestValidation) body: PasswordResetRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    const result = await this.passwordResetService.requestPasswordReset(
      body.email,
      ipAddress,
      userAgent
    );

    // Set OTP token as HTTP-only cookie if reset was initiated
    if (result.otpToken) {
      res.cookie('otpToken', result.otpToken, this.secureCookieService.getCookieConfig('otp'));
    }

    return {
      data: {
        message: result.message
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }

  @Post('verify-password-reset-otp')
  @UseGuards(OTPTokenGuard)
  @UseInterceptors(RateLimitInterceptor('otp_verification'))
  async verifyPasswordResetOTP(
    @Body(PasswordResetVerificationValidation) body: PasswordResetVerificationDto,
    @OTPToken() otpToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.passwordResetService.verifyPasswordResetOTP(
      otpToken,
      body.otp
    );

    // Set reset token as HTTP-only cookie
    res.cookie('resetToken', result.resetToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    // Clear OTP token
    res.clearCookie('otpToken');

    return {
      data: {
        message: result.message
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }

  @Post('complete-password-reset')
  @UseGuards(ResetTokenGuard)
  @UseInterceptors(RateLimitInterceptor('password_reset_completion'))
  async completePasswordReset(
    @Body(PasswordResetCompletionValidation) body: PasswordResetCompletionDto,
    @ResetToken() resetToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.passwordResetService.completePasswordReset(
      resetToken,
      body.newPassword
    );

    // Clear reset token
    res.clearCookie('resetToken');

    return {
      data: {
        message: result.message,
        user: result.user
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }

  @Post('resend-password-reset-otp')
  @UseGuards(OTPTokenGuard)
  @UseInterceptors(RateLimitInterceptor('otp_generation'))
  async resendPasswordResetOTP(
    @OTPToken() otpToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.passwordResetService.resendPasswordResetOTP(otpToken);

    // Update OTP token cookie with new token
    res.cookie('otpToken', result.otpToken, this.secureCookieService.getCookieConfig('otp'));

    return {
      data: {
        message: result.message
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }
}
