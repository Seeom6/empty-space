import {
  ExecutionContext,
  Injectable,
  CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';
import { EnvironmentService } from '@Infrastructure/config';

@Injectable()
export class OTPTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extract OTP token from HTTP-only cookie
    const otpToken = request.cookies?.otpToken;
    
    if (!otpToken) {
      throw new AppError({
        code: ErrorCode.OTP_TOKEN_NOT_EXIST,
        message: 'OTP token not found',
        errorType: 'OTP_TOKEN_NOT_EXIST'
      });
    }

    try {
      // Verify the OTP token
      const payload = this.jwtService.verify(otpToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });

      // Validate token type
      if (payload.type !== 'otp') {
        throw new AppError({
          code: ErrorCode.OTP_TOKEN_NOT_EXIST,
          message: 'Invalid token type',
          errorType: 'OTP_TOKEN_NOT_EXIST'
        });
      }

      // Attach the token payload to the request for use in controllers
      request['otpToken'] = otpToken;
      request['otpPayload'] = payload;
      
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError({
        code: ErrorCode.OTP_TOKEN_NOT_EXIST,
        message: 'Invalid or expired OTP token',
        errorType: 'OTP_TOKEN_NOT_EXIST'
      });
    }
  }
}
