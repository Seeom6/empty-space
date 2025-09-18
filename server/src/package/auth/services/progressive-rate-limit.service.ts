import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { ErrorCode } from '@Common/error';
import { StandardizedError, ErrorType, RateLimitErrorDetails } from '@Common/error/error-response.interface';

export interface RateLimitResult {
  limited: boolean;
  retryAfter?: number;
  remainingAttempts?: number;
  resetTime?: number;
}

export interface ProgressiveRateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBase: number;
}

@Injectable()
export class ProgressiveRateLimitService {
  private readonly configs: Record<string, ProgressiveRateLimitConfig> = {
    invite_code_validation: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      baseDelayMs: 1000, // 1 second
      maxDelayMs: 300000, // 5 minutes
      exponentialBase: 2
    },
    otp_verification: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxAttempts: 3,
      baseDelayMs: 2000, // 2 seconds
      maxDelayMs: 600000, // 10 minutes
      exponentialBase: 3
    },
    login_attempts: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      baseDelayMs: 5000, // 5 seconds
      maxDelayMs: 900000, // 15 minutes
      exponentialBase: 2
    },
    password_reset: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxAttempts: 3,
      baseDelayMs: 10000, // 10 seconds
      maxDelayMs: 1800000, // 30 minutes
      exponentialBase: 2
    },
    email_registration: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
      baseDelayMs: 2000, // 2 seconds
      maxDelayMs: 300000, // 5 minutes
      exponentialBase: 2
    },
    registration_completion: {
      windowMs: 10 * 60 * 1000, // 10 minutes
      maxAttempts: 3,
      baseDelayMs: 3000, // 3 seconds
      maxDelayMs: 600000, // 10 minutes
      exponentialBase: 2
    },
    otp_generation: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 3,
      baseDelayMs: 5000, // 5 seconds
      maxDelayMs: 900000, // 15 minutes
      exponentialBase: 3
    }
  };

  constructor(private readonly redisService: RedisService) {}

  async checkRateLimit(identifier: string, type: string): Promise<RateLimitResult> {
    const config = this.configs[type];
    if (!config) {
      return { limited: false };
    }

    const key = `progressive_rate_limit:${type}:${identifier}`;
    const attemptData = await this.redisService.get<string>(key);
    
    if (!attemptData) {
      return {
        limited: false,
        remainingAttempts: config.maxAttempts
      };
    }

    const { count, firstAttempt, lastAttempt } = JSON.parse(attemptData);
    const now = Date.now();

    // Check if window has expired
    if (now - firstAttempt > config.windowMs) {
      // Window expired, reset
      await this.redisService.del([key]);
      return {
        limited: false,
        remainingAttempts: config.maxAttempts
      };
    }

    // Check if currently in delay period
    const delay = this.calculateDelay(count, config);
    const timeSinceLastAttempt = now - lastAttempt;
    
    if (timeSinceLastAttempt < delay) {
      return {
        limited: true,
        retryAfter: Math.ceil((delay - timeSinceLastAttempt) / 1000),
        remainingAttempts: Math.max(0, config.maxAttempts - count),
        resetTime: firstAttempt + config.windowMs
      };
    }

    // Check if max attempts exceeded
    if (count >= config.maxAttempts) {
      const windowReset = firstAttempt + config.windowMs;
      if (now < windowReset) {
        return {
          limited: true,
          retryAfter: Math.ceil((windowReset - now) / 1000),
          remainingAttempts: 0,
          resetTime: windowReset
        };
      } else {
        // Window expired, reset
        await this.redisService.del([key]);
        return {
          limited: false,
          remainingAttempts: config.maxAttempts
        };
      }
    }

    return {
      limited: false,
      remainingAttempts: config.maxAttempts - count
    };
  }

  async recordFailedAttempt(identifier: string, type: string): Promise<number> {
    const config = this.configs[type];
    if (!config) {
      return 0;
    }

    const key = `progressive_rate_limit:${type}:${identifier}`;
    const attemptData = await this.redisService.get<string>(key);
    const now = Date.now();

    let count = 1;
    let firstAttempt = now;

    if (attemptData) {
      const parsed = JSON.parse(attemptData);
      
      // Check if window has expired
      if (now - parsed.firstAttempt > config.windowMs) {
        // Window expired, reset
        count = 1;
        firstAttempt = now;
      } else {
        count = parsed.count + 1;
        firstAttempt = parsed.firstAttempt;
      }
    }

    const newData = {
      count,
      firstAttempt,
      lastAttempt: now
    };

    // Store with TTL equal to window duration
    await this.redisService.set(
      key,
      JSON.stringify(newData),
      Math.ceil(config.windowMs / 1000)
    );

    return count;
  }

  async resetFailureCount(identifier: string, type: string): Promise<void> {
    const key = `progressive_rate_limit:${type}:${identifier}`;
    await this.redisService.del([key]);
  }

  calculateDelay(attemptCount: number, config: ProgressiveRateLimitConfig): number {
    if (attemptCount <= 1) {
      return 0;
    }

    // Exponential backoff: baseDelay * (exponentialBase ^ (attemptCount - 1))
    const delay = config.baseDelayMs * Math.pow(config.exponentialBase, attemptCount - 1);
    
    // Cap at maximum delay
    return Math.min(delay, config.maxDelayMs);
  }

  async isRateLimited(identifier: string, type: string): Promise<RateLimitResult> {
    return this.checkRateLimit(identifier, type);
  }

  // Utility method to get rate limit info without checking
  async getRateLimitInfo(identifier: string, type: string): Promise<{
    attempts: number;
    firstAttempt: number;
    lastAttempt: number;
    windowMs: number;
    maxAttempts: number;
  } | null> {
    const config = this.configs[type];
    if (!config) {
      return null;
    }

    const key = `progressive_rate_limit:${type}:${identifier}`;
    const attemptData = await this.redisService.get<string>(key);
    
    if (!attemptData) {
      return null;
    }

    const parsed = JSON.parse(attemptData);
    return {
      attempts: parsed.count,
      firstAttempt: parsed.firstAttempt,
      lastAttempt: parsed.lastAttempt,
      windowMs: config.windowMs,
      maxAttempts: config.maxAttempts
    };
  }

  // Method to manually set rate limit (useful for testing or admin actions)
  async setRateLimit(
    identifier: string, 
    type: string, 
    attempts: number, 
    firstAttempt?: number
  ): Promise<void> {
    const config = this.configs[type];
    if (!config) {
      return;
    }

    const key = `progressive_rate_limit:${type}:${identifier}`;
    const now = Date.now();
    
    const data = {
      count: attempts,
      firstAttempt: firstAttempt || now,
      lastAttempt: now
    };

    await this.redisService.set(
      key,
      JSON.stringify(data),
      Math.ceil(config.windowMs / 1000)
    );
  }

  createRateLimitError(
    type: string,
    result: RateLimitResult,
    requestId?: string
  ): StandardizedError {
    const config = this.configs[type];
    const details: RateLimitErrorDetails = {
      retryAfter: result.retryAfter || 0,
      maxAttempts: config?.maxAttempts || 0,
      remainingAttempts: result.remainingAttempts || 0,
      windowMs: config?.windowMs || 0,
      resetTime: result.resetTime || 0
    };

    return new StandardizedError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded for ${type}. Please try again in ${result.retryAfter} seconds.`,
      ErrorType.RATE_LIMIT_ERROR,
      details,
      requestId
    );
  }

  async recordSuccessfulAttempt(identifier: string, type: string): Promise<void> {
    // Reset rate limit on successful attempt
    await this.resetFailureCount(identifier, type);
  }

  async getDetailedRateLimitStatus(identifier: string, type: string): Promise<{
    isLimited: boolean;
    config: ProgressiveRateLimitConfig;
    currentAttempts: number;
    nextAllowedTime?: number;
    windowResetTime?: number;
  }> {
    const config = this.configs[type];
    if (!config) {
      throw new StandardizedError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `Rate limit configuration not found for type: ${type}`,
        ErrorType.INTERNAL_ERROR
      );
    }

    const result = await this.checkRateLimit(identifier, type);
    const info = await this.getRateLimitInfo(identifier, type);

    return {
      isLimited: result.limited,
      config,
      currentAttempts: info?.attempts || 0,
      nextAllowedTime: result.limited && result.retryAfter
        ? Date.now() + (result.retryAfter * 1000)
        : undefined,
      windowResetTime: result.resetTime
    };
  }
}
