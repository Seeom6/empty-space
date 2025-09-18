import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '@Infrastructure/cache';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';
import { StandardizedError, ErrorType } from '@Common/error/error-response.interface';
import { randomBytes } from 'crypto';

interface CSRFConfig {
  tokenLength: number;
  headerName: string;
  cookieName: string;
  cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    maxAge: number;
  };
}

@Injectable()
export class CSRFProtectionMiddleware implements NestMiddleware {
  private readonly config: CSRFConfig;

  constructor(private readonly redisService: RedisService) {
    this.config = {
      tokenLength: 32,
      headerName: 'X-CSRF-Token',
      cookieName: 'csrf-token',
      cookieOptions: {
        httpOnly: false, // Client needs to read for AJAX requests
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      }
    };
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF protection for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip CSRF protection for certain endpoints (like initial login)
    const skipPaths = ['/auth/login', '/auth/validate-invite-code'];
    if (skipPaths.some(path => req.path.includes(path))) {
      return next();
    }

    const sessionId = this.extractSessionId(req);
    if (!sessionId) {
      // No session, skip CSRF protection
      return next();
    }

    const csrfToken = req.headers[this.config.headerName.toLowerCase()] as string;
    const cookieToken = req.cookies[this.config.cookieName];

    if (!csrfToken || !cookieToken) {
      throw new StandardizedError(
        ErrorCode.CSRF_TOKEN_MISSING,
        'CSRF token missing',
        ErrorType.CSRF_ERROR,
        {
          headerName: this.config.headerName,
          cookieName: this.config.cookieName,
          hasHeader: !!csrfToken,
          hasCookie: !!cookieToken
        }
      );
    }

    // Validate CSRF token
    const isValid = await this.validateCSRFToken(sessionId, csrfToken, cookieToken);
    if (!isValid) {
      throw new StandardizedError(
        ErrorCode.CSRF_TOKEN_INVALID,
        'Invalid CSRF token',
        ErrorType.CSRF_ERROR,
        {
          sessionId: sessionId.substring(0, 8) + '...',
          tokenMatch: csrfToken === cookieToken
        }
      );
    }

    next();
  }

  async generateCSRFToken(sessionId: string): Promise<string> {
    const token = randomBytes(this.config.tokenLength).toString('hex');
    const key = `csrf:${sessionId}`;
    
    // Store token in Redis with TTL
    await this.redisService.set(key, token, this.config.cookieOptions.maxAge / 1000);
    
    return token;
  }

  async validateCSRFToken(sessionId: string, headerToken: string, cookieToken: string): Promise<boolean> {
    // Both tokens must match
    if (headerToken !== cookieToken) {
      return false;
    }

    const key = `csrf:${sessionId}`;
    const storedToken = await this.redisService.get<string>(key);
    
    return storedToken === headerToken;
  }

  async setCSRFCookie(res: Response, sessionId: string): Promise<void> {
    const token = await this.generateCSRFToken(sessionId);
    
    res.cookie(this.config.cookieName, token, this.config.cookieOptions);
  }

  private extractSessionId(req: Request): string | null {
    // Try to extract session ID from various token types
    const sessionToken = req.cookies?.sessionToken;
    const otpToken = req.cookies?.otpToken;
    const registrationToken = req.cookies?.registrationToken;
    const accessToken = req.cookies?.accessToken;

    if (sessionToken) {
      try {
        // Decode without verification to get session ID
        const payload = JSON.parse(Buffer.from(sessionToken.split('.')[1], 'base64').toString());
        return payload.sessionId;
      } catch (error) {
        // Ignore decode errors
      }
    }

    if (otpToken) {
      try {
        const payload = JSON.parse(Buffer.from(otpToken.split('.')[1], 'base64').toString());
        return payload.sessionId;
      } catch (error) {
        // Ignore decode errors
      }
    }

    if (registrationToken) {
      try {
        const payload = JSON.parse(Buffer.from(registrationToken.split('.')[1], 'base64').toString());
        return payload.sessionId;
      } catch (error) {
        // Ignore decode errors
      }
    }

    if (accessToken) {
      try {
        const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
        return payload.sub; // Use user ID as session identifier for access tokens
      } catch (error) {
        // Ignore decode errors
      }
    }

    return null;
  }
}
