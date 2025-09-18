import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { ErrorCode } from '@Common/error';
import { StandardizedError, ErrorType } from '@Common/error/error-response.interface';
import * as crypto from 'crypto';

export interface CSRFConfig {
  tokenLength: number;
  headerName: string;
  cookieName: string;
  sessionTTL: number; // in seconds
  secretKey: string;
}

export interface CSRFTokenInfo {
  token: string;
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

@Injectable()
export class CSRFProtectionService {
  private readonly config: CSRFConfig = {
    tokenLength: 32,
    headerName: 'X-CSRF-Token',
    cookieName: 'csrf-token',
    sessionTTL: 15 * 60, // 15 minutes
    secretKey: process.env.CSRF_SECRET_KEY || 'default-csrf-secret-key-change-in-production'
  };

  constructor(private readonly redisService: RedisService) {}

  async generateCSRFToken(
    sessionId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<CSRFTokenInfo> {
    // Generate cryptographically secure random token
    const token = crypto.randomBytes(this.config.tokenLength).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.sessionTTL * 1000);

    const tokenInfo: CSRFTokenInfo = {
      token,
      sessionId,
      createdAt: now,
      expiresAt,
      ipAddress,
      userAgent
    };

    // Store token in Redis with session association
    const tokenKey = `csrf_token:${token}`;
    const sessionKey = `csrf_session:${sessionId}`;

    await Promise.all([
      // Store token data
      this.redisService.set(
        tokenKey,
        JSON.stringify(tokenInfo),
        this.config.sessionTTL
      ),
      // Associate token with session
      this.redisService.set(
        sessionKey,
        token,
        this.config.sessionTTL
      )
    ]);

    return tokenInfo;
  }

  async validateCSRFToken(
    token: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    requestId?: string
  ): Promise<boolean> {
    if (!token || !sessionId) {
      throw new StandardizedError(
        ErrorCode.CSRF_TOKEN_MISSING,
        'CSRF token is required',
        ErrorType.CSRF_ERROR,
        { headerName: this.config.headerName },
        requestId
      );
    }

    // Validate token format
    if (!this.isValidTokenFormat(token)) {
      throw new StandardizedError(
        ErrorCode.CSRF_TOKEN_INVALID,
        'Invalid CSRF token format',
        ErrorType.CSRF_ERROR,
        { token: token.substring(0, 8) + '...' },
        requestId
      );
    }

    const tokenKey = `csrf_token:${token}`;
    const tokenData = await this.redisService.get<string>(tokenKey);

    if (!tokenData) {
      throw new StandardizedError(
        ErrorCode.CSRF_TOKEN_INVALID,
        'CSRF token not found or expired',
        ErrorType.CSRF_ERROR,
        { token: token.substring(0, 8) + '...' },
        requestId
      );
    }

    const tokenInfo: CSRFTokenInfo = JSON.parse(tokenData);

    // Validate token hasn't expired
    if (new Date() > new Date(tokenInfo.expiresAt)) {
      await this.invalidateCSRFToken(token, sessionId);
      throw new StandardizedError(
        ErrorCode.CSRF_TOKEN_EXPIRED,
        'CSRF token has expired',
        ErrorType.CSRF_ERROR,
        { 
          expiredAt: tokenInfo.expiresAt,
          token: token.substring(0, 8) + '...'
        },
        requestId
      );
    }

    // Validate session association
    if (tokenInfo.sessionId !== sessionId) {
      throw new StandardizedError(
        ErrorCode.CSRF_VALIDATION_FAILED,
        'CSRF token session mismatch',
        ErrorType.CSRF_ERROR,
        { 
          expectedSession: sessionId.substring(0, 8) + '...',
          tokenSession: tokenInfo.sessionId.substring(0, 8) + '...'
        },
        requestId
      );
    }

    // Optional: Validate IP address (can be disabled for mobile apps)
    if (process.env.CSRF_VALIDATE_IP === 'true' && tokenInfo.ipAddress !== ipAddress) {
      throw new StandardizedError(
        ErrorCode.CSRF_VALIDATION_FAILED,
        'CSRF token IP address mismatch',
        ErrorType.CSRF_ERROR,
        { 
          expectedIP: ipAddress,
          tokenIP: tokenInfo.ipAddress
        },
        requestId
      );
    }

    return true;
  }

  async refreshCSRFToken(
    oldToken: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    requestId?: string
  ): Promise<CSRFTokenInfo> {
    // Validate old token first
    await this.validateCSRFToken(oldToken, sessionId, ipAddress, userAgent, requestId);

    // Invalidate old token
    await this.invalidateCSRFToken(oldToken, sessionId);

    // Generate new token
    return await this.generateCSRFToken(sessionId, ipAddress, userAgent);
  }

  async invalidateCSRFToken(token: string, sessionId: string): Promise<void> {
    const tokenKey = `csrf_token:${token}`;
    const sessionKey = `csrf_session:${sessionId}`;

    await Promise.all([
      this.redisService.del([tokenKey]),
      this.redisService.del([sessionKey])
    ]);
  }

  async invalidateAllSessionTokens(sessionId: string): Promise<void> {
    const sessionKey = `csrf_session:${sessionId}`;
    const token = await this.redisService.get<string>(sessionKey);

    if (token) {
      await this.invalidateCSRFToken(token, sessionId);
    }
  }

  async getCSRFTokenForSession(sessionId: string): Promise<string | null> {
    const sessionKey = `csrf_session:${sessionId}`;
    return await this.redisService.get<string>(sessionKey);
  }

  async isCSRFTokenValid(token: string): Promise<boolean> {
    if (!this.isValidTokenFormat(token)) {
      return false;
    }

    const tokenKey = `csrf_token:${token}`;
    const tokenData = await this.redisService.get<string>(tokenKey);

    if (!tokenData) {
      return false;
    }

    const tokenInfo: CSRFTokenInfo = JSON.parse(tokenData);
    return new Date() <= new Date(tokenInfo.expiresAt);
  }

  private isValidTokenFormat(token: string): boolean {
    // Check if token is hex string of expected length
    const expectedLength = this.config.tokenLength * 2; // hex encoding doubles length
    return /^[a-f0-9]+$/i.test(token) && token.length === expectedLength;
  }

  generateSecureToken(): string {
    return crypto.randomBytes(this.config.tokenLength).toString('hex');
  }

  createCSRFTokenHash(token: string, sessionId: string): string {
    const hmac = crypto.createHmac('sha256', this.config.secretKey);
    hmac.update(`${token}:${sessionId}`);
    return hmac.digest('hex');
  }

  verifyCSRFTokenHash(token: string, sessionId: string, hash: string): boolean {
    const expectedHash = this.createCSRFTokenHash(token, sessionId);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  }

  getCSRFConfig(): Partial<CSRFConfig> {
    return {
      headerName: this.config.headerName,
      cookieName: this.config.cookieName,
      tokenLength: this.config.tokenLength,
      sessionTTL: this.config.sessionTTL
    };
  }

  async getCSRFTokenInfo(token: string): Promise<CSRFTokenInfo | null> {
    if (!this.isValidTokenFormat(token)) {
      return null;
    }

    const tokenKey = `csrf_token:${token}`;
    const tokenData = await this.redisService.get<string>(tokenKey);

    return tokenData ? JSON.parse(tokenData) : null;
  }

  async extendCSRFTokenTTL(token: string, additionalSeconds: number = 900): Promise<boolean> {
    const tokenInfo = await this.getCSRFTokenInfo(token);
    
    if (!tokenInfo) {
      return false;
    }

    const tokenKey = `csrf_token:${token}`;
    const sessionKey = `csrf_session:${tokenInfo.sessionId}`;
    const newTTL = this.config.sessionTTL + additionalSeconds;

    // Update expiration time
    tokenInfo.expiresAt = new Date(Date.now() + newTTL * 1000);

    await Promise.all([
      this.redisService.set(tokenKey, JSON.stringify(tokenInfo), newTTL),
      this.redisService.set(sessionKey, token, newTTL)
    ]);

    return true;
  }

  async cleanupExpiredTokens(): Promise<number> {
    // This would typically be called by a scheduled job
    // For now, we rely on Redis TTL for automatic cleanup
    // In a production environment, you might want to implement
    // a more sophisticated cleanup mechanism
    return 0;
  }

  async getActiveTokensCount(): Promise<number> {
    // Get approximate count of active CSRF tokens
    // This is a rough estimate and might not be 100% accurate
    const keys = await this.redisService.keys('csrf_token:*');
    return keys.length;
  }

  createCSRFError(
    code: ErrorCode,
    message: string,
    details?: any,
    requestId?: string
  ): StandardizedError {
    return new StandardizedError(
      code,
      message,
      ErrorType.CSRF_ERROR,
      {
        ...details,
        headerName: this.config.headerName,
        cookieName: this.config.cookieName
      },
      requestId
    );
  }
}
