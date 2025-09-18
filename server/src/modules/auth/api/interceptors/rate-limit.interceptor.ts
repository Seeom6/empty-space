import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { RedisService } from '@Infrastructure/cache';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests: boolean;
  keyGenerator: (req: Request) => string;
}

const rateLimitConfigs: Record<string, RateLimitConfig> = {
  invite_code_validation: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.ip || 'unknown'
  },
  email_registration: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts per window
    skipSuccessfulRequests: false,
    keyGenerator: (req) => req.body?.email || req.ip || 'unknown'
  },
  otp_verification: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // 3 verification attempts per window
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.body?.email || req.ip || 'unknown'
  },
  registration_completion: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts per window
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.cookies?.registrationToken || req.ip || 'unknown'
  },
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.body?.email || req.ip || 'unknown'
  },
  password_reset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 reset requests per hour
    skipSuccessfulRequests: false,
    keyGenerator: (req) => req.body?.email || req.ip || 'unknown'
  }
};

function createRateLimitInterceptor(type: string): Type<NestInterceptor> {
  @Injectable()
  class RateLimitInterceptorHost implements NestInterceptor {
    constructor(private readonly redisService: RedisService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();
      const config = rateLimitConfigs[type];
      
      if (!config) {
        // If no config found, proceed without rate limiting
        return next.handle();
      }

      const key = `rate_limit:${type}:${config.keyGenerator(request)}`;
      
      // Check current count
      const currentCountStr = await this.redisService.get<string>(key);
      const currentCount = currentCountStr ? parseInt(currentCountStr) : 0;

      if (currentCount >= config.max) {
        const ttl = await this.redisService.ttl(key);
        const retryAfter = ttl > 0 ? ttl : config.windowMs / 1000;
        
        throw new AppError({
          code: ErrorCode.RATE_LIMIT_EXCEEDED,
          message: `Too many requests. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
          errorType: 'RATE_LIMIT_EXCEEDED',
          details: {
            retryAfter: retryAfter,
            maxAttempts: config.max,
            remainingAttempts: 0
          }
        });
      }

      // Increment counter
      if (currentCount === 0) {
        await this.redisService.set(key, '1', config.windowMs / 1000);
      } else {
        await this.redisService.incr(key);
      }

      // Proceed with the request
      const result = next.handle();

      // If configured to skip successful requests, decrement counter on success
      if (config.skipSuccessfulRequests) {
        result.subscribe({
          next: () => {
            // Request was successful, decrement counter
            this.redisService.decr(key).catch(() => {
              // Ignore errors in decrementing
            });
          },
          error: () => {
            // Request failed, keep the counter as is
          }
        });
      }

      return result;
    }
  }

  return mixin(RateLimitInterceptorHost);
}

export function RateLimitInterceptor(type: string): Type<NestInterceptor> {
  return createRateLimitInterceptor(type);
}
