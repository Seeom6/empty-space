import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { JwtService } from '@nestjs/jwt';
import { ErrorCode } from '@Common/error';
import { StandardizedError, ErrorType } from '@Common/error/error-response.interface';

export interface BlacklistedToken {
  jti: string;
  tokenType: 'access' | 'refresh' | 'session' | 'otp' | 'registration';
  userId?: string;
  sessionId?: string;
  blacklistedAt: Date;
  expiresAt: Date;
  reason: BlacklistReason;
  ipAddress?: string;
  userAgent?: string;
}

export enum BlacklistReason {
  USER_LOGOUT = 'user_logout',
  ADMIN_REVOKE = 'admin_revoke',
  SECURITY_BREACH = 'security_breach',
  TOKEN_ROTATION = 'token_rotation',
  ACCOUNT_LOCKED = 'account_locked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PASSWORD_CHANGED = 'password_changed',
  PRIVILEGE_CHANGED = 'privilege_changed',
  SESSION_EXPIRED = 'session_expired',
  REFRESH_TOKEN_REUSE = 'refresh_token_reuse',
  CONCURRENT_SESSION_LIMIT = 'concurrent_session_limit'
}

export interface TokenFamily {
  familyId: string;
  userId: string;
  createdAt: Date;
  lastUsedAt: Date;
  tokenCount: number;
  isActive: boolean;
}

@Injectable()
export class TokenBlacklistService {
  private readonly blacklistTTL = 30 * 24 * 60 * 60; // 30 days in seconds
  private readonly familyTTL = 90 * 24 * 60 * 60; // 90 days in seconds

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService
  ) {}

  async blacklistToken(
    token: string,
    reason: BlacklistReason,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // Decode token to get metadata
      const decoded = this.jwtService.decode(token) as any;
      if (!decoded || !decoded.jti) {
        throw new StandardizedError(
          ErrorCode.TOKEN_SIGNATURE_INVALID,
          'Invalid token format for blacklisting',
          ErrorType.TOKEN_ERROR
        );
      }

      const blacklistedToken: BlacklistedToken = {
        jti: decoded.jti,
        tokenType: this.determineTokenType(decoded),
        userId: decoded.sub || decoded.userId,
        sessionId: decoded.sessionId,
        blacklistedAt: new Date(),
        expiresAt: new Date(decoded.exp * 1000),
        reason,
        ipAddress,
        userAgent
      };

      // Store in Redis with TTL
      const key = `token_blacklist:${decoded.jti}`;
      await this.redisService.set(
        key,
        JSON.stringify(blacklistedToken),
        this.blacklistTTL
      );

      // Add to user's blacklisted tokens list
      if (blacklistedToken.userId) {
        await this.addToUserBlacklist(blacklistedToken.userId, decoded.jti);
      }

      // Handle token family invalidation for refresh tokens
      if (blacklistedToken.tokenType === 'refresh' && decoded.familyId) {
        await this.handleTokenFamilyInvalidation(decoded.familyId, reason);
      }

    } catch (error) {
      if (error instanceof StandardizedError) {
        throw error;
      }
      throw new StandardizedError(
        ErrorCode.TOKEN_BLACKLISTING_FAILED,
        'Failed to blacklist token',
        ErrorType.TOKEN_ERROR,
        { originalError: error.message }
      );
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.decode(token) as any;
      if (!decoded || !decoded.jti) {
        return true; // Invalid tokens are considered blacklisted
      }

      const key = `token_blacklist:${decoded.jti}`;
      const blacklistedData = await this.redisService.get<string>(key);
      
      return !!blacklistedData;
    } catch (error) {
      return true; // On error, consider token blacklisted for security
    }
  }

  async getBlacklistedTokenInfo(jti: string): Promise<BlacklistedToken | null> {
    const key = `token_blacklist:${jti}`;
    const data = await this.redisService.get<string>(key);
    
    return data ? JSON.parse(data) : null;
  }

  async blacklistAllUserTokens(
    userId: string,
    reason: BlacklistReason,
    excludeJti?: string
  ): Promise<number> {
    // Get all active tokens for user
    const userTokensKey = `user_tokens:${userId}`;
    const tokenJtis = await this.redisService.smembers(userTokensKey);
    
    let blacklistedCount = 0;
    
    for (const jti of tokenJtis) {
      if (excludeJti && jti === excludeJti) {
        continue; // Skip excluded token
      }

      // Get token data to reconstruct token for blacklisting
      const tokenKey = `active_token:${jti}`;
      const tokenData = await this.redisService.get<string>(tokenKey);
      
      if (tokenData) {
        const token = JSON.parse(tokenData);
        await this.blacklistToken(token.rawToken, reason);
        blacklistedCount++;
      }
    }

    return blacklistedCount;
  }

  async blacklistAllSessionTokens(
    sessionId: string,
    reason: BlacklistReason
  ): Promise<number> {
    const sessionTokensKey = `session_tokens:${sessionId}`;
    const tokenJtis = await this.redisService.smembers(sessionTokensKey);
    
    let blacklistedCount = 0;
    
    for (const jti of tokenJtis) {
      const tokenKey = `active_token:${jti}`;
      const tokenData = await this.redisService.get<string>(tokenKey);
      
      if (tokenData) {
        const token = JSON.parse(tokenData);
        await this.blacklistToken(token.rawToken, reason);
        blacklistedCount++;
      }
    }

    return blacklistedCount;
  }

  async createTokenFamily(userId: string): Promise<string> {
    const familyId = `fam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const family: TokenFamily = {
      familyId,
      userId,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      tokenCount: 0,
      isActive: true
    };

    const key = `token_family:${familyId}`;
    await this.redisService.set(key, JSON.stringify(family), this.familyTTL);
    
    return familyId;
  }

  async addTokenToFamily(familyId: string, jti: string): Promise<void> {
    const familyKey = `token_family:${familyId}`;
    const familyData = await this.redisService.get<string>(familyKey);
    
    if (familyData) {
      const family: TokenFamily = JSON.parse(familyData);
      family.tokenCount++;
      family.lastUsedAt = new Date();
      
      await this.redisService.set(familyKey, JSON.stringify(family), this.familyTTL);
      
      // Add token to family members list
      const membersKey = `token_family_members:${familyId}`;
      await this.redisService.sadd(membersKey, jti);
      await this.redisService.expire(membersKey, this.familyTTL);
    }
  }

  async invalidateTokenFamily(
    familyId: string,
    reason: BlacklistReason
  ): Promise<number> {
    // Get all tokens in the family
    const membersKey = `token_family_members:${familyId}`;
    const memberJtis = await this.redisService.smembers(membersKey);
    
    let invalidatedCount = 0;
    
    for (const jti of memberJtis) {
      const tokenKey = `active_token:${jti}`;
      const tokenData = await this.redisService.get<string>(tokenKey);
      
      if (tokenData) {
        const token = JSON.parse(tokenData);
        await this.blacklistToken(token.rawToken, reason);
        invalidatedCount++;
      }
    }

    // Mark family as inactive
    const familyKey = `token_family:${familyId}`;
    const familyData = await this.redisService.get<string>(familyKey);
    
    if (familyData) {
      const family: TokenFamily = JSON.parse(familyData);
      family.isActive = false;
      await this.redisService.set(familyKey, JSON.stringify(family), this.familyTTL);
    }

    return invalidatedCount;
  }

  async detectRefreshTokenReuse(jti: string, familyId: string): Promise<boolean> {
    // Check if this token has already been used
    const usedKey = `used_refresh_token:${jti}`;
    const wasUsed = await this.redisService.get<string>(usedKey);
    
    if (wasUsed) {
      // Token reuse detected - invalidate entire family
      await this.invalidateTokenFamily(familyId, BlacklistReason.REFRESH_TOKEN_REUSE);
      return true;
    }

    // Mark token as used
    await this.redisService.set(usedKey, 'used', this.blacklistTTL);
    
    return false;
  }

  async getUserBlacklistedTokens(userId: string, limit: number = 50): Promise<BlacklistedToken[]> {
    const userBlacklistKey = `user_blacklist:${userId}`;
    const jtis = await this.redisService.lrange(userBlacklistKey, 0, limit - 1);
    
    const tokens: BlacklistedToken[] = [];
    
    for (const jti of jtis) {
      const tokenInfo = await this.getBlacklistedTokenInfo(jti);
      if (tokenInfo) {
        tokens.push(tokenInfo);
      }
    }

    return tokens;
  }

  async getBlacklistStats(): Promise<{
    totalBlacklisted: number;
    byReason: Record<BlacklistReason, number>;
    byTokenType: Record<string, number>;
    recentBlacklists: BlacklistedToken[];
  }> {
    const keys = await this.redisService.keys('token_blacklist:*');
    const stats = {
      totalBlacklisted: keys.length,
      byReason: {} as Record<BlacklistReason, number>,
      byTokenType: {} as Record<string, number>,
      recentBlacklists: [] as BlacklistedToken[]
    };

    // Sample recent blacklists for analysis
    const sampleSize = Math.min(100, keys.length);
    const sampleKeys = keys.slice(0, sampleSize);
    
    for (const key of sampleKeys) {
      const data = await this.redisService.get<string>(key);
      if (data) {
        const token: BlacklistedToken = JSON.parse(data);
        
        stats.byReason[token.reason] = (stats.byReason[token.reason] || 0) + 1;
        stats.byTokenType[token.tokenType] = (stats.byTokenType[token.tokenType] || 0) + 1;
        
        if (stats.recentBlacklists.length < 20) {
          stats.recentBlacklists.push(token);
        }
      }
    }

    // Sort recent blacklists by date
    stats.recentBlacklists.sort((a, b) => 
      new Date(b.blacklistedAt).getTime() - new Date(a.blacklistedAt).getTime()
    );

    return stats;
  }

  async cleanupExpiredBlacklists(): Promise<number> {
    const keys = await this.redisService.keys('token_blacklist:*');
    let cleanedCount = 0;
    
    for (const key of keys) {
      const data = await this.redisService.get<string>(key);
      if (data) {
        const token: BlacklistedToken = JSON.parse(data);
        if (new Date() > new Date(token.expiresAt)) {
          await this.redisService.del([key]);
          cleanedCount++;
        }
      }
    }

    return cleanedCount;
  }

  async validateTokenNotBlacklisted(token: string): Promise<void> {
    const isBlacklisted = await this.isTokenBlacklisted(token);
    
    if (isBlacklisted) {
      const decoded = this.jwtService.decode(token) as any;
      const tokenInfo = decoded?.jti ? await this.getBlacklistedTokenInfo(decoded.jti) : null;
      
      throw new StandardizedError(
        ErrorCode.TOKEN_BLACKLISTED,
        'Token has been blacklisted',
        ErrorType.TOKEN_ERROR,
        {
          jti: decoded?.jti,
          reason: tokenInfo?.reason,
          blacklistedAt: tokenInfo?.blacklistedAt
        }
      );
    }
  }

  private determineTokenType(decoded: any): 'access' | 'refresh' | 'session' | 'otp' | 'registration' {
    if (decoded.type) return decoded.type;
    if (decoded.tokenType) return decoded.tokenType;
    
    // Fallback based on token structure
    if (decoded.sessionId && !decoded.sub) return 'session';
    if (decoded.otp) return 'otp';
    if (decoded.registrationStep) return 'registration';
    if (decoded.refresh) return 'refresh';
    
    return 'access'; // Default
  }

  private async addToUserBlacklist(userId: string, jti: string): Promise<void> {
    const userBlacklistKey = `user_blacklist:${userId}`;
    
    // Add to beginning of list (most recent first)
    await this.redisService.lpush(userBlacklistKey, jti);
    
    // Keep only last 100 blacklisted tokens per user
    await this.redisService.ltrim(userBlacklistKey, 0, 99);
    
    // Set TTL for user blacklist
    await this.redisService.expire(userBlacklistKey, this.blacklistTTL);
  }

  private async handleTokenFamilyInvalidation(
    familyId: string,
    reason: BlacklistReason
  ): Promise<void> {
    // For security-related reasons, invalidate entire family
    const securityReasons = [
      BlacklistReason.SECURITY_BREACH,
      BlacklistReason.SUSPICIOUS_ACTIVITY,
      BlacklistReason.REFRESH_TOKEN_REUSE,
      BlacklistReason.ACCOUNT_LOCKED
    ];

    if (securityReasons.includes(reason)) {
      await this.invalidateTokenFamily(familyId, reason);
    }
  }

  createTokenBlacklistError(
    jti: string,
    reason?: BlacklistReason,
    requestId?: string
  ): StandardizedError {
    return new StandardizedError(
      ErrorCode.TOKEN_BLACKLISTED,
      'Token has been blacklisted and is no longer valid',
      ErrorType.TOKEN_ERROR,
      {
        jti: jti.substring(0, 8) + '...',
        reason,
        action: 'Please obtain a new token'
      },
      requestId
    );
  }
}
