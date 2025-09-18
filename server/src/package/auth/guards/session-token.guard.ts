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
export class SessionTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    console.log(`[SESSION_TOKEN_GUARD] Checking session token`);
    console.log(`[SESSION_TOKEN_GUARD] Request cookies:`, request.cookies);
    console.log(`[SESSION_TOKEN_GUARD] All headers:`, request.headers);

    // Extract session token from HTTP-only cookie
    const sessionToken = request.cookies?.sessionToken;

    console.log(`[SESSION_TOKEN_GUARD] Extracted session token:`, sessionToken);
    console.log(`[SESSION_TOKEN_GUARD] Session token length:`, sessionToken?.length || 'undefined');

    if (!sessionToken) {
      console.log(`[SESSION_TOKEN_GUARD] No session token found - throwing error`);
      throw new AppError({
        code: ErrorCode.INVALID_SESSION_TOKEN,
        message: 'Session token not found',
        errorType: 'INVALID_SESSION_TOKEN'
      });
    }

    try {
      // Verify the session token
      const payload = this.jwtService.verify(sessionToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });

      // Validate token type and step
      if (payload.type !== 'session') {
        throw new AppError({
          code: ErrorCode.INVALID_SESSION_TOKEN,
          message: 'Invalid token type',
          errorType: 'INVALID_SESSION_TOKEN'
        });
      }

      // Attach the token payload to the request for use in controllers
      request['sessionToken'] = sessionToken;
      request['sessionPayload'] = payload;
      
      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError({
        code: ErrorCode.INVALID_SESSION_TOKEN,
        message: 'Invalid or expired session token',
        errorType: 'INVALID_SESSION_TOKEN'
      });
    }
  }
}
