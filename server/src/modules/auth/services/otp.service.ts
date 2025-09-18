import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueuesNames } from '@Infrastructure/queue';
import { generateOTP } from '@Package/utilities';
import { RedisKeys, RedisTTL } from './session.service';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';

export interface OTPData {
  otp: string;
  email: string;
  type: 'registration' | 'password_reset';
  attempts: number;
  createdAt: number;
  expiresAt: number;
}

export interface RateLimitResult {
  limited: boolean;
  retryAfter?: number;
  remainingAttempts?: number;
  resetTime?: number;
}

@Injectable()
export class OtpService {
  private readonly MAX_OTP_ATTEMPTS = 3;
  private readonly OTP_RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_OTP_REQUESTS = 3; // 3 OTP requests per window

  constructor(
    private readonly redisService: RedisService,
    @InjectQueue(QueuesNames.MAIL) private readonly emailQueue: Queue
  ) {}

  async generateAndSendOTP(
    email: string,
    type: 'registration' | 'password_reset',
    userData?: { firstName?: string; lastName?: string }
  ): Promise<void> {
    // Check rate limiting for OTP generation
    const rateLimitResult = await this.checkOTPGenerationRateLimit(email);
    if (rateLimitResult.limited) {
      throw new AppError({
        code: ErrorCode.OTP_ATTEMPTS_EXCEEDED,
        message: `Too many OTP requests. Please try again in ${Math.ceil(rateLimitResult.retryAfter! / 60)} minutes.`,
        errorType: 'RATE_LIMIT_EXCEEDED'
      });
    }

    const otp = generateOTP(6);
    const now = Date.now();
    
    const otpData: OTPData = {
      otp,
      email,
      type,
      attempts: 0,
      createdAt: now,
      expiresAt: now + (RedisTTL.OTP * 1000)
    };

    // Store OTP in Redis
    console.log(`[OTP_SERVICE] Storing OTP in Redis`);
    console.log(`[OTP_SERVICE] Redis key: ${RedisKeys.OTP(email, type)}`);
    console.log(`[OTP_SERVICE] OTP data to store:`, otpData);
    console.log(`[OTP_SERVICE] Stringified OTP data:`, JSON.stringify(otpData));
    console.log(`[OTP_SERVICE] TTL: ${RedisTTL.OTP} seconds`);

    await this.redisService.set(
      RedisKeys.OTP(email, type),
      JSON.stringify(otpData),
      RedisTTL.OTP
    );

    console.log(`[OTP_SERVICE] OTP stored successfully`);

    // Update rate limiting counter
    await this.incrementOTPGenerationCounter(email);

    // Queue email for delivery
    await this.emailQueue.add(
      QueuesNames.MAIL,
      {
        email,
        otp,
        type,
        firstName: userData?.firstName,
        lastName: userData?.lastName
      },
      {
        priority: 10, // High priority for OTP emails
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );
  }

  async verifyOTP(
    email: string,
    otp: string,
    type: 'registration' | 'password_reset'
  ): Promise<boolean> {
    // Check rate limiting for OTP verification
    const rateLimitResult = await this.checkOTPVerificationRateLimit(email);
    if (rateLimitResult.limited) {
      throw new AppError({
        code: ErrorCode.OTP_ATTEMPTS_EXCEEDED,
        message: `Too many OTP verification attempts. Please try again in ${Math.ceil(rateLimitResult.retryAfter! / 60)} minutes.`,
        errorType: 'RATE_LIMIT_EXCEEDED'
      });
    }

    console.log(`[OTP_SERVICE] Verifying OTP for email: ${email}, type: ${type}`);
    console.log(`[OTP_SERVICE] Redis key: ${RedisKeys.OTP(email, type)}`);

    const otpDataFromRedis = await this.redisService.get<OTPData>(RedisKeys.OTP(email, type));

    console.log(`[OTP_SERVICE] Raw OTP data from Redis:`, otpDataFromRedis);
    console.log(`[OTP_SERVICE] OTP data type:`, typeof otpDataFromRedis);

    if (!otpDataFromRedis) {
      console.log(`[OTP_SERVICE] No OTP data found in Redis`);
      await this.incrementOTPVerificationCounter(email);
      throw new AppError({
        code: ErrorCode.OTP_EXPIRED,
        message: 'OTP has expired or does not exist',
        errorType: 'OTP_EXPIRED'
      });
    }

    let otpData: OTPData;
    try {
      // Redis service already parses JSON, so we can use the data directly
      // But we need to handle both cases: when it's already parsed and when it's still a string
      if (typeof otpDataFromRedis === 'string') {
        console.log(`[OTP_SERVICE] Data is string, parsing JSON:`, otpDataFromRedis);
        otpData = JSON.parse(otpDataFromRedis);
      } else {
        console.log(`[OTP_SERVICE] Data is already parsed object:`, otpDataFromRedis);
        otpData = otpDataFromRedis;
      }
      console.log(`[OTP_SERVICE] Final OTP data:`, otpData);
    } catch (error) {
      console.log(`[OTP_SERVICE] JSON parse error:`, error);
      console.log(`[OTP_SERVICE] Failed to parse OTP data:`, otpDataFromRedis);
      await this.incrementOTPVerificationCounter(email);
      throw new AppError({
        code: ErrorCode.INVALID_OTP,
        message: 'Invalid OTP data',
        errorType: 'INVALID_OTP'
      });
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      await this.deleteOTP(email, type);
      await this.incrementOTPVerificationCounter(email);
      throw new AppError({
        code: ErrorCode.OTP_EXPIRED,
        message: 'OTP has expired',
        errorType: 'OTP_EXPIRED'
      });
    }

    // Check if too many attempts
    if (otpData.attempts >= this.MAX_OTP_ATTEMPTS) {
      await this.deleteOTP(email, type);
      await this.incrementOTPVerificationCounter(email);
      throw new AppError({
        code: ErrorCode.OTP_ATTEMPTS_EXCEEDED,
        message: 'Too many OTP verification attempts',
        errorType: 'OTP_ATTEMPTS_EXCEEDED'
      });
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      // Increment attempt counter
      otpData.attempts++;
      await this.redisService.set(
        RedisKeys.OTP(email, type),
        JSON.stringify(otpData),
        RedisTTL.OTP
      );
      
      await this.incrementOTPVerificationCounter(email);
      throw new AppError({
        code: ErrorCode.INVALID_OTP,
        message: `Invalid OTP. ${this.MAX_OTP_ATTEMPTS - otpData.attempts} attempts remaining.`,
        errorType: 'INVALID_OTP'
      });
    }

    // OTP is valid, delete it
    await this.deleteOTP(email, type);
    await this.resetOTPVerificationCounter(email);
    
    return true;
  }

  async deleteOTP(email: string, type: 'registration' | 'password_reset'): Promise<void> {
    await this.redisService.del([RedisKeys.OTP(email, type)]);
  }

  private async checkOTPGenerationRateLimit(email: string): Promise<RateLimitResult> {
    const key = RedisKeys.RATE_LIMIT('otp_generation', email);
    const countStr = await this.redisService.get<string>(key);
    const count = countStr ? parseInt(countStr) : 0;

    if (count >= this.MAX_OTP_REQUESTS) {
      const ttl = await this.redisService.ttl(key);
      return {
        limited: true,
        retryAfter: ttl > 0 ? ttl : this.OTP_RATE_LIMIT_WINDOW / 1000,
        remainingAttempts: 0,
        resetTime: Date.now() + (ttl > 0 ? ttl * 1000 : this.OTP_RATE_LIMIT_WINDOW)
      };
    }

    return {
      limited: false,
      remainingAttempts: this.MAX_OTP_REQUESTS - count
    };
  }

  private async incrementOTPGenerationCounter(email: string): Promise<void> {
    const key = RedisKeys.RATE_LIMIT('otp_generation', email);
    const current = await this.redisService.get<string>(key);
    
    if (current) {
      await this.redisService.incr(key);
    } else {
      await this.redisService.set(key, '1', this.OTP_RATE_LIMIT_WINDOW / 1000);
    }
  }

  private async checkOTPVerificationRateLimit(email: string): Promise<RateLimitResult> {
    const key = RedisKeys.RATE_LIMIT('otp_verification', email);
    const countStr = await this.redisService.get<string>(key);
    const count = countStr ? parseInt(countStr) : 0;

    if (count >= this.MAX_OTP_ATTEMPTS) {
      const ttl = await this.redisService.ttl(key);
      return {
        limited: true,
        retryAfter: ttl > 0 ? ttl : RedisTTL.RATE_LIMIT,
        remainingAttempts: 0,
        resetTime: Date.now() + (ttl > 0 ? ttl * 1000 : RedisTTL.RATE_LIMIT * 1000)
      };
    }

    return {
      limited: false,
      remainingAttempts: this.MAX_OTP_ATTEMPTS - count
    };
  }

  private async incrementOTPVerificationCounter(email: string): Promise<void> {
    const key = RedisKeys.RATE_LIMIT('otp_verification', email);
    const current = await this.redisService.get<string>(key);
    
    if (current) {
      await this.redisService.incr(key);
    } else {
      await this.redisService.set(key, '1', RedisTTL.RATE_LIMIT);
    }
  }

  private async resetOTPVerificationCounter(email: string): Promise<void> {
    const key = RedisKeys.RATE_LIMIT('otp_verification', email);
    await this.redisService.del([key]);
  }
}
