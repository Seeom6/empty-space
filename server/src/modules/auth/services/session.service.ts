import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { v4 as uuidv4 } from 'uuid';
import { InviteCodeAdminService } from '@Modules/invite-code/services/invite-code.admin.service';

export interface SessionData {
  sessionId: string;
  inviteCode: string;
  position: any;
  privileges: any[];
  email?: string;
  firstName?: string;
  lastName?: string;
  step: RegistrationStep;
  createdAt: number;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
}

export enum RegistrationStep {
  INVITE_VALIDATED = 'invite_validated',
  EMAIL_REGISTERED = 'email_registered',
  OTP_VERIFIED = 'otp_verified'
}

// Redis Key Patterns
export const RedisKeys = {
  SESSION: (sessionId: string) => `auth:session:${sessionId}`,
  USER_SESSIONS: (userId: string) => `auth:user_sessions:${userId}`,
  OTP: (email: string, type: string) => `auth:otp:${type}:${email}`,
  OTP_ATTEMPTS: (identifier: string) => `auth:otp_attempts:${identifier}`,
  REFRESH_TOKEN: (userId: string, jti: string) => `auth:refresh:${userId}:${jti}`,
  TOKEN_BLACKLIST: (jti: string) => `auth:blacklist:${jti}`,
  RATE_LIMIT: (type: string, identifier: string) => `auth:rate_limit:${type}:${identifier}`,
  FAILED_ATTEMPTS: (identifier: string) => `auth:failed_attempts:${identifier}`,
  ACCOUNT_LOCK: (userId: string) => `auth:account_lock:${userId}`
} as const;

// TTL Constants
export const RedisTTL = {
  SESSION: 15 * 60, // 15 minutes
  OTP: 10 * 60, // 10 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  RATE_LIMIT: 15 * 60, // 15 minutes
  FAILED_ATTEMPTS: 60 * 60, // 1 hour
  ACCOUNT_LOCK: 24 * 60 * 60 // 24 hours
} as const;

@Injectable()
export class SessionService {
  constructor(
    private readonly redisService: RedisService,
    private readonly inviteCodeService: InviteCodeAdminService
  ) {}

  async createSession(
    inviteCode: string,
    inviteCodeDetails: any,
    ipAddress: string,
    userAgent: string
  ): Promise<{ sessionId: string; sessionData: SessionData }> {
    console.log(`[SESSION_SERVICE] Creating session for inviteCode: ${inviteCode}, IP: ${ipAddress}`);
    console.log(`[SESSION_SERVICE] Stack trace:`, new Error().stack);

    // Check if a session already exists for this invite code and IP address
    const existingSessions = await this.redisService.keys(`auth:session:*`);
    for (const sessionKey of existingSessions) {
      const sessionData = await this.redisService.get<SessionData>(sessionKey);
      if (sessionData &&
          sessionData.inviteCode === inviteCode &&
          sessionData.ipAddress === ipAddress &&
          sessionData.step === RegistrationStep.INVITE_VALIDATED) {
        console.log(`[SESSION_SERVICE] Found existing session: ${sessionData.sessionId} for inviteCode: ${inviteCode}`);
        return { sessionId: sessionData.sessionId, sessionData };
      }
    }

    const sessionId = uuidv4();
    const now = Date.now();

    console.log(`[SESSION_SERVICE] Creating new session with ID: ${sessionId} for inviteCode: ${inviteCode}`);

    const sessionData: SessionData = {
      sessionId,
      inviteCode,
      position: inviteCodeDetails.position,
      privileges: inviteCodeDetails.privilege || [],
      step: RegistrationStep.INVITE_VALIDATED,
      createdAt: now,
      expiresAt: now + (RedisTTL.SESSION * 1000),
      ipAddress,
      userAgent
    };

    console.log(`[SESSION_SERVICE] About to store session in Redis`);
    console.log(`[SESSION_SERVICE] Redis key: ${RedisKeys.SESSION(sessionId)}`);
    console.log(`[SESSION_SERVICE] Session data:`, JSON.stringify(sessionData, null, 2));
    console.log(`[SESSION_SERVICE] TTL: ${RedisTTL.SESSION} seconds`);

    await this.redisService.set(
      RedisKeys.SESSION(sessionId),
      sessionData,
      RedisTTL.SESSION
    );

    console.log(`[SESSION_SERVICE] Session stored in Redis successfully with key: ${RedisKeys.SESSION(sessionId)}`);

    // Verify the session was stored
    const verifySession = await this.redisService.get(RedisKeys.SESSION(sessionId));
    console.log(`[SESSION_SERVICE] Verification - session exists in Redis:`, !!verifySession);
    if (verifySession) {
      console.log(`[SESSION_SERVICE] Verification - stored session data:`, JSON.stringify(verifySession, null, 2));
    }

    return { sessionId, sessionData };
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    console.log(`[SESSION_SERVICE] Getting session with ID: ${sessionId}`);
    console.log(`[SESSION_SERVICE] Redis key: ${RedisKeys.SESSION(sessionId)}`);

    const sessionData = await this.redisService.get<SessionData>(RedisKeys.SESSION(sessionId));

    console.log(`[SESSION_SERVICE] Raw session data from Redis:`, sessionData);
    console.log(`[SESSION_SERVICE] Session exists:`, !!sessionData);

    if (!sessionData) {
      console.log(`[SESSION_SERVICE] No session found in Redis for ID: ${sessionId}`);
      return null;
    }

    try {
      console.log(`[SESSION_SERVICE] Session found, checking expiration`);
      console.log(`[SESSION_SERVICE] Current time: ${Date.now()}`);
      console.log(`[SESSION_SERVICE] Session expires at: ${sessionData.expiresAt}`);
      console.log(`[SESSION_SERVICE] Session expired: ${Date.now() > sessionData.expiresAt}`);

      // Check if session has expired
      if (Date.now() > sessionData.expiresAt) {
        console.log(`[SESSION_SERVICE] Session expired, deleting`);
        await this.deleteSession(sessionId);
        return null;
      }

      console.log(`[SESSION_SERVICE] Session is valid, returning data`);
      return sessionData;
    } catch (error) {
      console.log(`[SESSION_SERVICE] Error processing session data:`, error);
      // Invalid session data, delete it
      await this.deleteSession(sessionId);
      return null;
    }
  }

  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    const existingSession = await this.getSession(sessionId);
    
    if (!existingSession) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...existingSession,
      ...updates,
      sessionId: existingSession.sessionId, // Prevent sessionId from being changed
      createdAt: existingSession.createdAt, // Prevent createdAt from being changed
    };

    await this.redisService.set(
      RedisKeys.SESSION(sessionId),
      updatedSession,
      RedisTTL.SESSION
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redisService.del([RedisKeys.SESSION(sessionId)]);
  }

  async validateSession(sessionId: string, requiredStep?: RegistrationStep): Promise<boolean> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return false;
    }

    if (requiredStep && session.step !== requiredStep) {
      return false;
    }

    return true;
  }

  async cleanupExpiredSessions(): Promise<void> {
    // This would typically be called by a scheduled job
    // For now, we rely on Redis TTL for automatic cleanup
  }

  async deleteUserSessions(userId: string): Promise<void> {
    const userSessionsKey = RedisKeys.USER_SESSIONS(userId);
    const sessionIds = await this.redisService.get<string[]>(userSessionsKey);
    
    if (sessionIds && sessionIds.length > 0) {
      const sessionKeys = sessionIds.map(id => RedisKeys.SESSION(id));
      await this.redisService.del(sessionKeys);
      await this.redisService.del([userSessionsKey]);
    }
  }

  async extendSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    
    if (session) {
      const now = Date.now();
      session.expiresAt = now + (RedisTTL.SESSION * 1000);
      
      await this.redisService.set(
        RedisKeys.SESSION(sessionId),
        session,
        RedisTTL.SESSION
      );
    }
  }
}
