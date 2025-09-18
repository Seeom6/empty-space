import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { AccountRepository } from '@Modules/account/account/data/repository/account.repository';
import { ErrorCode } from '@Common/error';
import { StandardizedError, ErrorType, AccountLockErrorDetails, SecurityEventDetails } from '@Common/error/error-response.interface';

export interface AccountSecurityConfig {
  maxFailedAttempts: number;
  lockDuration: number; // in seconds
  permanentLockThreshold: number;
  suspiciousActivityThreshold: number;
  lockEscalationMultiplier: number;
}

export interface AccountLockInfo {
  isLocked: boolean;
  lockType: 'temporary' | 'permanent' | 'none';
  lockedUntil?: Date;
  failedAttempts: number;
  lockReason?: string;
  lockHistory: LockEvent[];
}

export interface LockEvent {
  timestamp: Date;
  reason: string;
  duration: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface SecurityEvent {
  accountId: string;
  eventType: SecurityEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
}

export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MULTIPLE_FAILED_ATTEMPTS = 'multiple_failed_attempts',
  BRUTE_FORCE_DETECTED = 'brute_force_detected',
  UNUSUAL_LOGIN_PATTERN = 'unusual_login_pattern'
}

@Injectable()
export class AccountSecurityService {
  private readonly config: AccountSecurityConfig = {
    maxFailedAttempts: 5,
    lockDuration: 30 * 60, // 30 minutes
    permanentLockThreshold: 10,
    suspiciousActivityThreshold: 3,
    lockEscalationMultiplier: 2
  };

  constructor(
    private readonly redisService: RedisService,
    private readonly accountRepository: AccountRepository
  ) {}

  async checkAccountSecurity(
    accountId: string,
    ipAddress: string,
    userAgent: string,
    requestId?: string
  ): Promise<AccountLockInfo> {
    // Check if account is currently locked
    const lockInfo = await this.getAccountLockInfo(accountId);
    
    if (lockInfo.isLocked) {
      // Check if temporary lock has expired
      if (lockInfo.lockType === 'temporary' && lockInfo.lockedUntil && new Date() > lockInfo.lockedUntil) {
        await this.unlockAccount(accountId, 'lock_expired', ipAddress, userAgent);
        return await this.getAccountLockInfo(accountId);
      }
      
      return lockInfo;
    }

    return lockInfo;
  }

  async recordFailedLoginAttempt(
    accountId: string,
    ipAddress: string,
    userAgent: string,
    reason: string = 'invalid_credentials',
    requestId?: string
  ): Promise<AccountLockInfo> {
    // Increment failed attempts counter
    const failedAttempts = await this.incrementFailedAttempts(accountId);
    
    // Log security event
    await this.logSecurityEvent({
      accountId,
      eventType: SecurityEventType.FAILED_LOGIN,
      severity: failedAttempts >= this.config.suspiciousActivityThreshold ? 'HIGH' : 'MEDIUM',
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details: { reason, attemptNumber: failedAttempts }
    });

    // Check if account should be locked
    if (failedAttempts >= this.config.maxFailedAttempts) {
      return await this.lockAccount(accountId, 'failed_login_attempts', ipAddress, userAgent, requestId);
    }

    // Check for suspicious activity patterns
    if (await this.detectSuspiciousActivity(accountId, ipAddress, userAgent)) {
      await this.logSecurityEvent({
        accountId,
        eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: 'CRITICAL',
        ipAddress,
        userAgent,
        timestamp: new Date(),
        details: { reason: 'suspicious_pattern_detected' }
      });
    }

    return await this.getAccountLockInfo(accountId);
  }

  async recordSuccessfulLogin(
    accountId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    // Reset failed attempts on successful login
    await this.resetFailedAttempts(accountId);
    
    // Update last login information in database
    await this.accountRepository.findByIdAndUpdate({
      id: accountId,
      update: { 
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    });
  }

  async lockAccount(
    accountId: string,
    reason: string,
    ipAddress: string,
    userAgent: string,
    requestId?: string
  ): Promise<AccountLockInfo> {
    const lockHistory = await this.getLockHistory(accountId);
    const lockCount = lockHistory.length;
    
    // Determine lock type and duration
    let lockType: 'temporary' | 'permanent' = 'temporary';
    let lockDuration = this.config.lockDuration;
    
    if (lockCount >= this.config.permanentLockThreshold) {
      lockType = 'permanent';
      lockDuration = 0; // Permanent lock
    } else if (lockCount > 0) {
      // Escalate lock duration for repeat offenders
      lockDuration = this.config.lockDuration * Math.pow(this.config.lockEscalationMultiplier, lockCount);
      lockDuration = Math.min(lockDuration, 24 * 60 * 60); // Max 24 hours
    }

    const lockedUntil = lockType === 'temporary' ? new Date(Date.now() + lockDuration * 1000) : null;
    
    // Update database
    await this.accountRepository.findByIdAndUpdate({
      id: accountId,
      update: {
        isActive: lockType === 'permanent' ? false : true,
        lockedUntil: lockedUntil,
        failedLoginAttempts: await this.getFailedAttempts(accountId)
      }
    });

    // Store lock information in Redis
    const lockInfo = {
      lockType,
      lockedUntil: lockedUntil?.toISOString(),
      reason,
      timestamp: new Date().toISOString(),
      ipAddress,
      userAgent,
      duration: lockDuration
    };

    await this.redisService.set(
      `account_lock:${accountId}`,
      JSON.stringify(lockInfo),
      lockType === 'temporary' ? lockDuration : 0
    );

    // Add to lock history
    const lockEvent: LockEvent = {
      timestamp: new Date(),
      reason,
      duration: lockDuration,
      ipAddress,
      userAgent
    };

    await this.addToLockHistory(accountId, lockEvent);

    // Log security event
    await this.logSecurityEvent({
      accountId,
      eventType: SecurityEventType.ACCOUNT_LOCKED,
      severity: lockType === 'permanent' ? 'CRITICAL' : 'HIGH',
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details: { lockType, reason, duration: lockDuration, lockedUntil }
    });

    return await this.getAccountLockInfo(accountId);
  }

  async unlockAccount(
    accountId: string,
    reason: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    // Update database
    await this.accountRepository.findByIdAndUpdate({
      id: accountId,
      update: {
        isActive: true,
        lockedUntil: null,
        failedLoginAttempts: 0
      }
    });

    // Remove lock from Redis
    await this.redisService.del([`account_lock:${accountId}`]);
    await this.resetFailedAttempts(accountId);

    // Log security event
    await this.logSecurityEvent({
      accountId,
      eventType: SecurityEventType.ACCOUNT_UNLOCKED,
      severity: 'MEDIUM',
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details: { reason }
    });
  }

  async isAccountLocked(accountId: string): Promise<boolean> {
    const lockInfo = await this.getAccountLockInfo(accountId);
    return lockInfo.isLocked;
  }

  private async getAccountLockInfo(accountId: string): Promise<AccountLockInfo> {
    const lockData = await this.redisService.get<string>(`account_lock:${accountId}`);
    const failedAttempts = await this.getFailedAttempts(accountId);
    const lockHistory = await this.getLockHistory(accountId);

    if (!lockData) {
      return {
        isLocked: false,
        lockType: 'none',
        failedAttempts,
        lockHistory
      };
    }

    const lock = JSON.parse(lockData);
    const lockedUntil = lock.lockedUntil ? new Date(lock.lockedUntil) : null;
    
    return {
      isLocked: true,
      lockType: lock.lockType,
      lockedUntil,
      failedAttempts,
      lockReason: lock.reason,
      lockHistory
    };
  }

  private async incrementFailedAttempts(accountId: string): Promise<number> {
    const key = `failed_attempts:${accountId}`;
    const current = await this.redisService.get<number>(key) || 0;
    const newCount = current + 1;
    
    await this.redisService.set(key, newCount, 60 * 60); // 1 hour TTL
    return newCount;
  }

  private async getFailedAttempts(accountId: string): Promise<number> {
    return await this.redisService.get<number>(`failed_attempts:${accountId}`) || 0;
  }

  private async resetFailedAttempts(accountId: string): Promise<void> {
    await this.redisService.del([`failed_attempts:${accountId}`]);
  }

  private async getLockHistory(accountId: string): Promise<LockEvent[]> {
    const history = await this.redisService.get<string>(`lock_history:${accountId}`);
    return history ? JSON.parse(history) : [];
  }

  private async addToLockHistory(accountId: string, event: LockEvent): Promise<void> {
    const history = await this.getLockHistory(accountId);
    history.push(event);
    
    // Keep only last 10 events
    const trimmedHistory = history.slice(-10);
    
    await this.redisService.set(
      `lock_history:${accountId}`,
      JSON.stringify(trimmedHistory),
      30 * 24 * 60 * 60 // 30 days
    );
  }

  private async detectSuspiciousActivity(
    accountId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<boolean> {
    // Check for rapid successive attempts from different IPs
    const recentAttempts = await this.redisService.get<string[]>(`recent_attempts:${accountId}`) || [];
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Filter recent attempts (last 5 minutes)
    const recentValidAttempts = recentAttempts.filter(attempt => {
      const attemptData = JSON.parse(attempt);
      return attemptData.timestamp > fiveMinutesAgo;
    });

    // Add current attempt
    recentValidAttempts.push(JSON.stringify({
      timestamp: now,
      ipAddress,
      userAgent
    }));

    // Store updated attempts
    await this.redisService.set(
      `recent_attempts:${accountId}`,
      recentValidAttempts,
      5 * 60 // 5 minutes
    );

    // Check for suspicious patterns
    const uniqueIPs = new Set(recentValidAttempts.map(attempt => JSON.parse(attempt).ipAddress));
    const uniqueUserAgents = new Set(recentValidAttempts.map(attempt => JSON.parse(attempt).userAgent));

    // Suspicious if multiple IPs or user agents in short time
    return uniqueIPs.size > 2 || uniqueUserAgents.size > 2 || recentValidAttempts.length > 10;
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const key = `security_events:${event.accountId}:${Date.now()}`;
    await this.redisService.set(key, JSON.stringify(event), 30 * 24 * 60 * 60); // 30 days
    
    // Also store in a general security events list for monitoring
    const generalKey = `security_events:all:${Date.now()}`;
    await this.redisService.set(generalKey, JSON.stringify(event), 7 * 24 * 60 * 60); // 7 days
  }

  createAccountLockError(
    lockInfo: AccountLockInfo,
    requestId?: string
  ): StandardizedError {
    const details: AccountLockErrorDetails = {
      lockDuration: 0,
      lockedUntil: lockInfo.lockedUntil?.toISOString() || '',
      reason: lockInfo.lockReason || 'security_violation',
      failedAttempts: lockInfo.failedAttempts
    };

    if (lockInfo.lockType === 'temporary' && lockInfo.lockedUntil) {
      details.lockDuration = Math.ceil((lockInfo.lockedUntil.getTime() - Date.now()) / 1000);
    }

    const errorCode = lockInfo.lockType === 'permanent' 
      ? ErrorCode.ACCOUNT_PERMANENTLY_LOCKED 
      : ErrorCode.ACCOUNT_TEMPORARILY_LOCKED;

    const message = lockInfo.lockType === 'permanent'
      ? 'Account has been permanently locked due to security violations'
      : `Account is temporarily locked. Please try again after ${Math.ceil(details.lockDuration / 60)} minutes.`;

    return new StandardizedError(
      errorCode,
      message,
      ErrorType.ACCOUNT_SECURITY_ERROR,
      details,
      requestId
    );
  }
}
