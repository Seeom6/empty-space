import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { EnvironmentService } from '@Infrastructure/config';
import * as crypto from 'crypto';

export interface SecureCookieConfig {
  domain?: string;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  signed: boolean;
  maxAge?: number;
  expires?: Date;
}

export interface CookieOptions extends SecureCookieConfig {
  name: string;
  value: string;
}

@Injectable()
export class SecureCookieService {
  private readonly cookieSecret: string;
  private readonly defaultConfig: SecureCookieConfig;
  private readonly isProduction: boolean;

  constructor(private readonly environmentService: EnvironmentService) {
    this.isProduction = this.environmentService.get('app.env') === 'production';
    this.cookieSecret = this.environmentService.get('cookie.secret') as string || 'default-cookie-secret-change-in-production';
    this.defaultConfig = {
      domain: this.isProduction ? this.environmentService.get('cookie.domain') as string : undefined,
      path: '/',
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? 'strict' : 'lax',
      signed: !!this.cookieSecret
    };

    // Validate configuration on startup
    this.validateCookieConfiguration();
  }

  private validateCookieConfiguration(): void {
    if (this.isProduction) {
      const cookieDomain = this.environmentService.get('cookie.domain') as string;

      if (!cookieDomain) {
        throw new Error('COOKIE_DOMAIN is required in production environment');
      }

      if (!this.cookieSecret || this.cookieSecret === 'default-cookie-secret-change-in-production') {
        throw new Error('COOKIE_SECRET must be set in production environment');
      }

      if (this.cookieSecret.length < 32) {
        throw new Error('COOKIE_SECRET must be at least 32 characters long');
      }
    }
  }

  // Session Token Cookie (Short-lived for registration flow)
  setSessionTokenCookie(res: Response, token: string): void {
    this.setCookie(res, {
      name: 'sessionToken',
      value: token,
      ...this.defaultConfig,
      maxAge: 15 * 60 * 1000, // 15 minutes (matches Redis TTL)
    });
  }

  // OTP Token Cookie (Short-lived)
  setOTPTokenCookie(res: Response, token: string): void {
    this.setCookie(res, {
      name: 'otpToken',
      value: token,
      ...this.defaultConfig,
      maxAge: 10 * 60 * 1000, // 10 minutes (matches Redis TTL)
    });
  }

  // Registration Token Cookie (Short-lived)
  setRegistrationTokenCookie(res: Response, token: string): void {
    this.setCookie(res, {
      name: 'registrationToken',
      value: token,
      ...this.defaultConfig,
      maxAge: 15 * 60 * 1000, // 15 minutes (matches Redis TTL)
    });
  }

  // Access Token Cookie (Short-lived)
  setAccessTokenCookie(res: Response, token: string): void {
    this.setCookie(res, {
      name: 'accessToken',
      value: token,
      ...this.defaultConfig,
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Refresh Token Cookie (Long-lived, most secure)
  setRefreshTokenCookie(res: Response, token: string): void {
    this.setCookie(res, {
      name: 'refreshToken',
      value: token,
      ...this.defaultConfig,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches Redis TTL)
      path: '/auth/refresh' // Restrict to refresh endpoint only
    });
  }

  // CSRF Token Cookie (Client-readable)
  setCSRFTokenCookie(res: Response, token: string): void {
    this.setCookie(res, {
      name: 'csrf-token',
      value: token,
      ...this.defaultConfig,
      maxAge: 15 * 60 * 1000, // 15 minutes
      httpOnly: false, // Client needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: false // CSRF tokens are validated differently
    });
  }

  // Remember Me Cookie (Very long-lived)
  setRememberMeCookie(res: Response, token: string): void {
    this.setCookie(res, {
      name: 'rememberMe',
      value: token,
      ...this.defaultConfig,
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }

  // Generic secure cookie setter
  setCookie(res: Response, options: CookieOptions): void {
    const cookieOptions: any = {
      domain: options.domain,
      path: options.path,
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
      signed: options.signed
    };

    // Set expiration
    if (options.maxAge) {
      cookieOptions.maxAge = options.maxAge;
    }
    if (options.expires) {
      cookieOptions.expires = options.expires;
    }

    // Sign the cookie value if required
    const cookieValue = options.signed 
      ? this.signCookieValue(options.value)
      : options.value;

    res.cookie(options.name, cookieValue, cookieOptions);
  }

  // Clear specific cookie
  clearCookie(res: Response, name: string, path: string = '/'): void {
    res.clearCookie(name, {
      domain: this.defaultConfig.domain,
      path: path,
      httpOnly: true,
      secure: this.defaultConfig.secure,
      sameSite: this.defaultConfig.sameSite
    });
  }

  // Clear all authentication cookies
  clearAllAuthCookies(res: Response): void {
    const authCookies = [
      'sessionToken',
      'otpToken', 
      'registrationToken',
      'accessToken',
      'refreshToken',
      'csrf-token',
      'rememberMe'
    ];

    authCookies.forEach(cookieName => {
      this.clearCookie(res, cookieName);
      
      // Also clear refresh token from its specific path
      if (cookieName === 'refreshToken') {
        this.clearCookie(res, cookieName, '/auth/refresh');
      }
    });
  }

  // Sign cookie value with HMAC
  private signCookieValue(value: string): string {
    const hmac = crypto.createHmac('sha256', this.cookieSecret);
    hmac.update(value);
    const signature = hmac.digest('base64url');
    return `${value}.${signature}`;
  }

  // Verify signed cookie value
  verifyCookieSignature(signedValue: string): string | null {
    if (!signedValue || !signedValue.includes('.')) {
      return null;
    }

    const lastDotIndex = signedValue.lastIndexOf('.');
    const value = signedValue.substring(0, lastDotIndex);
    const signature = signedValue.substring(lastDotIndex + 1);

    // Verify signature
    const hmac = crypto.createHmac('sha256', this.cookieSecret);
    hmac.update(value);
    const expectedSignature = hmac.digest('base64url');

    // Use timing-safe comparison
    if (crypto.timingSafeEqual(
      Buffer.from(signature, 'base64url'),
      Buffer.from(expectedSignature, 'base64url')
    )) {
      return value;
    }

    return null;
  }

  // Get secure cookie configuration for specific cookie type
  getCookieConfig(cookieType: string): SecureCookieConfig {
    const configs = {
      sessionToken: {
        ...this.defaultConfig,
        maxAge: 7 * 24 * 60 * 60 * 1000
      },
      otpToken: {
        ...this.defaultConfig,
        maxAge: 10 * 60 * 1000
      },
      registrationToken: {
        ...this.defaultConfig,
        maxAge: 30 * 60 * 1000
      },
      accessToken: {
        ...this.defaultConfig,
        maxAge: 15 * 60 * 1000
      },
      refreshToken: {
        ...this.defaultConfig,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/auth/refresh'
      },
      csrfToken: {
        ...this.defaultConfig,
        maxAge: 15 * 60 * 1000,
        httpOnly: false,
        signed: false
      },
      rememberMe: {
        ...this.defaultConfig,
        maxAge: 90 * 24 * 60 * 60 * 1000
      }
    };

    return configs[cookieType] || this.defaultConfig;
  }

  // Validate cookie security settings
  validateCookieConfig(config: SecureCookieConfig): boolean {
    // In production, ensure secure settings
    if (process.env.NODE_ENV === 'production') {
      if (!config.secure) {
        console.warn('Cookie security warning: secure flag should be true in production');
        return false;
      }
      
      if (config.sameSite !== 'strict' && config.sameSite !== 'lax') {
        console.warn('Cookie security warning: sameSite should be strict or lax in production');
        return false;
      }
    }

    return true;
  }

  // Generate secure random cookie value
  generateSecureCookieValue(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  // Create cookie with automatic security headers
  setSecureResponseHeaders(res: Response): void {
    // Security headers for cookie protection
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  }

  // Cookie rotation for enhanced security
  rotateCookie(res: Response, cookieName: string, newValue: string): void {
    // Clear old cookie first
    this.clearCookie(res, cookieName);
    
    // Set new cookie with updated value
    const config = this.getCookieConfig(cookieName);
    this.setCookie(res, {
      name: cookieName,
      value: newValue,
      ...config
    });
  }
}
