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
export class RegistrationTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Extract registration token from HTTP-only cookie
    const registrationToken = request.cookies?.registrationToken;
    
    if (!registrationToken) {
      throw new AppError({
        code: ErrorCode.REGISTRATION_TOKEN_INVALID,
        message: 'Registration token not found',
        errorType: 'REGISTRATION_TOKEN_INVALID'
      });
    }

    try {
      // Verify the registration token
      const payload = this.jwtService.verify(registrationToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });

      // Validate token type
      if (payload.type !== 'registration') {
        throw new AppError({
          code: ErrorCode.REGISTRATION_TOKEN_INVALID,
          message: 'Invalid token type',
          errorType: 'REGISTRATION_TOKEN_INVALID'
        });
      }

      // Attach the token payload to the request for use in controllers
      request['registrationToken'] = registrationToken;
      request['registrationPayload'] = payload;
      
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError({
        code: ErrorCode.REGISTRATION_TOKEN_INVALID,
        message: 'Invalid or expired registration token',
        errorType: 'REGISTRATION_TOKEN_INVALID'
      });
    }
  }
}
