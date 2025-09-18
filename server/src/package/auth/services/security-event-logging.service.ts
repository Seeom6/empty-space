import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueuesNames } from '@Infrastructure/queue';

export interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  accountId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  details: Record<string, any>;
  riskScore: number;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
}

export enum SecurityEventType {
  // Authentication Events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',

  // Registration Events
  REGISTRATION_STARTED = 'registration_started',
  REGISTRATION_COMPLETED = 'registration_completed',
  REGISTRATION_FAILED = 'registration_failed',
  INVITE_CODE_VALIDATED = 'invite_code_validated',
  INVITE_CODE_FAILED = 'invite_code_failed',

  // OTP Events
  OTP_GENERATED = 'otp_generated',
  OTP_VERIFIED = 'otp_verified',
  OTP_FAILED = 'otp_failed',
  OTP_EXPIRED = 'otp_expired',

  // Token Events
  TOKEN_ISSUED = 'token_issued',
  TOKEN_REFRESHED = 'token_refreshed',
  TOKEN_REVOKED = 'token_revoked',
  TOKEN_BLACKLISTED = 'token_blacklisted',
  TOKEN_EXPIRED = 'token_expired',

  // Security Events
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_DETECTED = 'brute_force_detected',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_VIOLATION = 'csrf_violation',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',

  // Session Events
  SESSION_CREATED = 'session_created',
  SESSION_EXPIRED = 'session_expired',
  SESSION_HIJACK_DETECTED = 'session_hijack_detected',
  CONCURRENT_SESSION_DETECTED = 'concurrent_session_detected',

  // Administrative Events
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  ADMIN_ACTION = 'admin_action',
  CONFIGURATION_CHANGED = 'configuration_changed',
  SECURITY_POLICY_VIOLATION = 'security_policy_violation'
}

export enum SecurityEventSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface SecurityEventFilter {
  eventTypes?: SecurityEventType[];
  severities?: SecurityEventSeverity[];
  accountId?: string;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  minRiskScore?: number;
  maxRiskScore?: number;
}

export interface SecurityEventStats {
  totalEvents: number;
  eventsByType: Record<SecurityEventType, number>;
  eventsBySeverity: Record<SecurityEventSeverity, number>;
  topRiskAccounts: Array<{ accountId: string; riskScore: number; eventCount: number }>;
  topRiskIPs: Array<{ ipAddress: string; riskScore: number; eventCount: number }>;
  timelineData: Array<{ timestamp: Date; count: number; avgRiskScore: number }>;
}

@Injectable()
export class SecurityEventLoggingService {
  private readonly eventRetentionDays = 90;
  private readonly highRiskThreshold = 7;
  private readonly criticalRiskThreshold = 9;

  constructor(
    private readonly redisService: RedisService,
    @InjectQueue(QueuesNames.SECURITY_EVENTS) private readonly securityQueue: Queue
  ) {}

  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'riskScore'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
      riskScore: this.calculateRiskScore(event)
    };

    // Store event in Redis for real-time access
    await this.storeEventInRedis(securityEvent);

    // Queue event for persistent storage and analysis
    await this.queueEventForProcessing(securityEvent);

    // Check for immediate security threats
    await this.checkForImmediateThreats(securityEvent);

    // Update real-time security metrics
    await this.updateSecurityMetrics(securityEvent);
  }

  /**
   * Alias for logSecurityEvent for backward compatibility
   */
  async logEvent(event: Partial<SecurityEvent>): Promise<void> {
    // Ensure required fields are present with defaults
    const eventWithDefaults = {
      eventType: event.eventType || 'AUTHENTICATION_ATTEMPT',
      severity: event.severity || 'MEDIUM',
      accountId: event.accountId,
      ipAddress: event.ipAddress || 'unknown',
      userAgent: event.userAgent || 'unknown',
      details: event.details || {},
      ...event
    } as Omit<SecurityEvent, 'id' | 'timestamp' | 'riskScore'>;

    return this.logSecurityEvent(eventWithDefaults);
  }

  async getSecurityEvents(
    filter: SecurityEventFilter,
    limit: number = 100,
    offset: number = 0
  ): Promise<SecurityEvent[]> {
    const events: SecurityEvent[] = [];
    const keys = await this.getEventKeys(filter);
    
    const sortedKeys = keys
      .sort((a, b) => b.localeCompare(a)) // Sort by timestamp (newest first)
      .slice(offset, offset + limit);

    for (const key of sortedKeys) {
      const eventData = await this.redisService.get<string>(key);
      if (eventData) {
        const event = JSON.parse(eventData);
        if (this.matchesFilter(event, filter)) {
          events.push(event);
        }
      }
    }

    return events;
  }

  async getSecurityEventStats(
    filter: SecurityEventFilter,
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<SecurityEventStats> {
    const events = await this.getSecurityEvents(filter, 10000); // Get more events for stats
    
    const stats: SecurityEventStats = {
      totalEvents: events.length,
      eventsByType: {} as Record<SecurityEventType, number>,
      eventsBySeverity: {} as Record<SecurityEventSeverity, number>,
      topRiskAccounts: [],
      topRiskIPs: [],
      timelineData: []
    };

    // Calculate event type distribution
    for (const event of events) {
      stats.eventsByType[event.eventType] = (stats.eventsByType[event.eventType] || 0) + 1;
      stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1;
    }

    // Calculate top risk accounts
    const accountRisks = new Map<string, { riskScore: number; eventCount: number }>();
    for (const event of events) {
      if (event.accountId) {
        const current = accountRisks.get(event.accountId) || { riskScore: 0, eventCount: 0 };
        accountRisks.set(event.accountId, {
          riskScore: Math.max(current.riskScore, event.riskScore),
          eventCount: current.eventCount + 1
        });
      }
    }

    stats.topRiskAccounts = Array.from(accountRisks.entries())
      .map(([accountId, data]) => ({ accountId, ...data }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    // Calculate top risk IPs
    const ipRisks = new Map<string, { riskScore: number; eventCount: number }>();
    for (const event of events) {
      const current = ipRisks.get(event.ipAddress) || { riskScore: 0, eventCount: 0 };
      ipRisks.set(event.ipAddress, {
        riskScore: Math.max(current.riskScore, event.riskScore),
        eventCount: current.eventCount + 1
      });
    }

    stats.topRiskIPs = Array.from(ipRisks.entries())
      .map(([ipAddress, data]) => ({ ipAddress, ...data }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    // Generate timeline data
    stats.timelineData = this.generateTimelineData(events, timeRange);

    return stats;
  }

  async getHighRiskEvents(limit: number = 50): Promise<SecurityEvent[]> {
    return this.getSecurityEvents(
      { minRiskScore: this.highRiskThreshold },
      limit
    );
  }

  async getCriticalEvents(limit: number = 20): Promise<SecurityEvent[]> {
    return this.getSecurityEvents(
      { 
        minRiskScore: this.criticalRiskThreshold,
        severities: [SecurityEventSeverity.CRITICAL]
      },
      limit
    );
  }

  async getAccountSecurityTimeline(accountId: string, days: number = 30): Promise<SecurityEvent[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getSecurityEvents(
      { 
        accountId,
        startDate,
        endDate: new Date()
      },
      1000
    );
  }

  async cleanupOldEvents(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.eventRetentionDays);
    
    const keys = await this.redisService.keys('security_event:*');
    let deletedCount = 0;

    for (const key of keys) {
      const eventData = await this.redisService.get<string>(key);
      if (eventData) {
        const event = JSON.parse(eventData);
        if (new Date(event.timestamp) < cutoffDate) {
          await this.redisService.del([key]);
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  private async storeEventInRedis(event: SecurityEvent): Promise<void> {
    const key = `security_event:${event.timestamp.getTime()}:${event.id}`;
    const ttl = this.eventRetentionDays * 24 * 60 * 60; // Convert days to seconds
    
    await this.redisService.set(key, JSON.stringify(event), ttl);

    // Also store in account-specific index for faster queries
    if (event.accountId) {
      const accountKey = `security_events:account:${event.accountId}:${event.timestamp.getTime()}`;
      await this.redisService.set(accountKey, event.id, ttl);
    }

    // Store in IP-specific index
    const ipKey = `security_events:ip:${event.ipAddress}:${event.timestamp.getTime()}`;
    await this.redisService.set(ipKey, event.id, ttl);
  }

  private async queueEventForProcessing(event: SecurityEvent): Promise<void> {
    await this.securityQueue.add(
      'process_security_event',
      event,
      {
        priority: this.getEventPriority(event),
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );
  }

  private async checkForImmediateThreats(event: SecurityEvent): Promise<void> {
    if (event.riskScore >= this.criticalRiskThreshold) {
      // Queue immediate threat response
      await this.securityQueue.add(
        'immediate_threat_response',
        event,
        {
          priority: 1, // Highest priority
          attempts: 5
        }
      );
    }
  }

  private async updateSecurityMetrics(event: SecurityEvent): Promise<void> {
    const now = new Date();
    const hourKey = `security_metrics:hour:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    const dayKey = `security_metrics:day:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

    // Update hourly metrics
    await this.redisService.incr(`${hourKey}:total`);
    await this.redisService.incr(`${hourKey}:${event.eventType}`);
    await this.redisService.incr(`${hourKey}:${event.severity}`);

    // Update daily metrics
    await this.redisService.incr(`${dayKey}:total`);
    await this.redisService.incr(`${dayKey}:${event.eventType}`);
    await this.redisService.incr(`${dayKey}:${event.severity}`);

    // Set TTL for metrics (30 days)
    await this.redisService.expire(hourKey, 30 * 24 * 60 * 60);
    await this.redisService.expire(dayKey, 30 * 24 * 60 * 60);
  }

  private calculateRiskScore(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'riskScore'>): number {
    let score = 0;

    // Base score by event type
    const eventTypeScores = {
      [SecurityEventType.LOGIN_FAILED]: 2,
      [SecurityEventType.BRUTE_FORCE_DETECTED]: 8,
      [SecurityEventType.ACCOUNT_LOCKED]: 6,
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: 7,
      [SecurityEventType.CSRF_VIOLATION]: 5,
      [SecurityEventType.UNAUTHORIZED_ACCESS]: 8,
      [SecurityEventType.SESSION_HIJACK_DETECTED]: 9,
      [SecurityEventType.PRIVILEGE_ESCALATION]: 10,
      [SecurityEventType.TOKEN_BLACKLISTED]: 4,
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: 3
    };

    score += eventTypeScores[event.eventType] || 1;

    // Severity multiplier
    const severityMultipliers = {
      [SecurityEventSeverity.LOW]: 1,
      [SecurityEventSeverity.MEDIUM]: 1.5,
      [SecurityEventSeverity.HIGH]: 2,
      [SecurityEventSeverity.CRITICAL]: 3
    };

    score *= severityMultipliers[event.severity];

    // Additional factors
    if (event.details.failedAttempts > 3) score += 2;
    if (event.details.fromUnknownLocation) score += 1;
    if (event.details.unusualTime) score += 1;

    return Math.min(Math.round(score), 10); // Cap at 10
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEventPriority(event: SecurityEvent): number {
    if (event.severity === SecurityEventSeverity.CRITICAL) return 1;
    if (event.severity === SecurityEventSeverity.HIGH) return 2;
    if (event.severity === SecurityEventSeverity.MEDIUM) return 3;
    return 4;
  }

  private async getEventKeys(filter: SecurityEventFilter): Promise<string[]> {
    if (filter.accountId) {
      return this.redisService.keys(`security_events:account:${filter.accountId}:*`);
    }
    
    if (filter.ipAddress) {
      return this.redisService.keys(`security_events:ip:${filter.ipAddress}:*`);
    }

    return this.redisService.keys('security_event:*');
  }

  private matchesFilter(event: SecurityEvent, filter: SecurityEventFilter): boolean {
    if (filter.eventTypes && !filter.eventTypes.includes(event.eventType)) return false;
    if (filter.severities && !filter.severities.includes(event.severity)) return false;
    if (filter.accountId && event.accountId !== filter.accountId) return false;
    if (filter.ipAddress && event.ipAddress !== filter.ipAddress) return false;
    if (filter.startDate && new Date(event.timestamp) < filter.startDate) return false;
    if (filter.endDate && new Date(event.timestamp) > filter.endDate) return false;
    if (filter.minRiskScore && event.riskScore < filter.minRiskScore) return false;
    if (filter.maxRiskScore && event.riskScore > filter.maxRiskScore) return false;
    
    return true;
  }

  private generateTimelineData(events: SecurityEvent[], timeRange: string): Array<{ timestamp: Date; count: number; avgRiskScore: number }> {
    const buckets = new Map<string, { count: number; totalRiskScore: number }>();
    
    for (const event of events) {
      const bucketKey = this.getBucketKey(new Date(event.timestamp), timeRange);
      const current = buckets.get(bucketKey) || { count: 0, totalRiskScore: 0 };
      buckets.set(bucketKey, {
        count: current.count + 1,
        totalRiskScore: current.totalRiskScore + event.riskScore
      });
    }

    return Array.from(buckets.entries()).map(([key, data]) => ({
      timestamp: this.parseTimestampFromBucketKey(key, timeRange),
      count: data.count,
      avgRiskScore: data.totalRiskScore / data.count
    }));
  }

  private getBucketKey(timestamp: Date, timeRange: string): string {
    switch (timeRange) {
      case 'hour':
        return `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}-${timestamp.getHours()}`;
      case 'day':
        return `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`;
      case 'week':
        const weekStart = new Date(timestamp);
        weekStart.setDate(timestamp.getDate() - timestamp.getDay());
        return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
      case 'month':
        return `${timestamp.getFullYear()}-${timestamp.getMonth()}`;
      default:
        return `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`;
    }
  }

  private parseTimestampFromBucketKey(key: string, timeRange: string): Date {
    const parts = key.split('-').map(Number);
    switch (timeRange) {
      case 'hour':
        return new Date(parts[0], parts[1], parts[2], parts[3]);
      case 'day':
        return new Date(parts[0], parts[1], parts[2]);
      case 'week':
      case 'month':
        return new Date(parts[0], parts[1], parts[2] || 1);
      default:
        return new Date(parts[0], parts[1], parts[2]);
    }
  }
}
