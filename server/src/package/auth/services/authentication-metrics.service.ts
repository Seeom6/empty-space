import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';

export interface AuthMetrics {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  successRate: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  topFailureReasons: Array<{ reason: string; count: number }>;
  loginsByHour: Array<{ hour: number; count: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  geographicDistribution: Array<{ country: string; count: number }>;
}

export interface SecurityMetrics {
  accountsLocked: number;
  suspiciousActivities: number;
  rateLimitViolations: number;
  csrfViolations: number;
  tokenBlacklisted: number;
  otpFailures: number;
  bruteForceAttempts: number;
  securityScore: number;
}

export interface PerformanceMetrics {
  averageLoginTime: number;
  averageOTPGenerationTime: number;
  averageTokenValidationTime: number;
  redisResponseTime: number;
  databaseResponseTime: number;
  emailDeliveryTime: number;
}

export interface MetricsPeriod {
  start: Date;
  end: Date;
  period: 'hour' | 'day' | 'week' | 'month';
}

@Injectable()
export class AuthenticationMetricsService {
  private readonly metricsRetentionDays = 30;

  constructor(private readonly redisService: RedisService) {}

  async recordLoginAttempt(
    userId: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    failureReason?: string,
    responseTime?: number
  ): Promise<void> {
    const timestamp = Date.now();
    const hour = new Date().getHours();
    const date = new Date().toISOString().split('T')[0];

    // Record basic metrics
    await Promise.all([
      this.redisService.incr(`auth_metrics:${date}:total_attempts`),
      this.redisService.incr(`auth_metrics:${date}:hour:${hour}`),
      success 
        ? this.redisService.incr(`auth_metrics:${date}:successful_logins`)
        : this.redisService.incr(`auth_metrics:${date}:failed_logins`)
    ]);

    // Record user-specific metrics
    if (success) {
      await this.redisService.sadd(`auth_metrics:${date}:unique_users`, userId);
      await this.recordSessionStart(userId, timestamp);
    } else if (failureReason) {
      await this.redisService.incr(`auth_metrics:${date}:failure_reason:${failureReason}`);
    }

    // Record device and location metrics
    const deviceType = this.extractDeviceType(userAgent);
    await this.redisService.incr(`auth_metrics:${date}:device:${deviceType}`);

    // Record performance metrics
    if (responseTime) {
      await this.recordPerformanceMetric('login_time', responseTime, date);
    }

    // Set TTL for metrics
    const ttl = this.metricsRetentionDays * 24 * 60 * 60;
    await this.setMetricsTTL(date, ttl);
  }

  async recordSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const date = new Date().toISOString().split('T')[0];

    await Promise.all([
      this.redisService.incr(`security_metrics:${date}:${eventType}`),
      this.redisService.incr(`security_metrics:${date}:severity:${severity}`),
      this.redisService.incr(`security_metrics:${date}:total_events`)
    ]);

    // Record user-specific security events
    if (userId) {
      await this.redisService.incr(`security_metrics:${date}:user:${userId}:${eventType}`);
    }

    const ttl = this.metricsRetentionDays * 24 * 60 * 60;
    await this.setSecurityMetricsTTL(date, ttl);
  }

  async recordPerformanceMetric(
    metricType: string,
    value: number,
    date?: string
  ): Promise<void> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const key = `performance_metrics:${targetDate}:${metricType}`;

    // Store as a list to calculate averages later
    await this.redisService.lpush(key, value.toString());
    await this.redisService.ltrim(key, 0, 999); // Keep last 1000 measurements

    const ttl = this.metricsRetentionDays * 24 * 60 * 60;
    await this.redisService.expire(key, ttl);
  }

  async getAuthMetrics(period: MetricsPeriod): Promise<AuthMetrics> {
    const dates = this.getDateRange(period);
    const metrics: AuthMetrics = {
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      successRate: 0,
      uniqueUsers: 0,
      averageSessionDuration: 0,
      topFailureReasons: [],
      loginsByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
      deviceTypes: [],
      geographicDistribution: []
    };

    // Aggregate metrics across date range
    for (const date of dates) {
      const [total, successful, failed] = await Promise.all([
        this.redisService.get<number>(`auth_metrics:${date}:total_attempts`) || 0,
        this.redisService.get<number>(`auth_metrics:${date}:successful_logins`) || 0,
        this.redisService.get<number>(`auth_metrics:${date}:failed_logins`) || 0
      ]);

      metrics.totalLogins += total;
      metrics.successfulLogins += successful;
      metrics.failedLogins += failed;

      // Get unique users for this date
      const uniqueUsersCount = await this.redisService.scard(`auth_metrics:${date}:unique_users`);
      metrics.uniqueUsers += uniqueUsersCount;

      // Get hourly distribution
      for (let hour = 0; hour < 24; hour++) {
        const hourlyCount = await this.redisService.get<number>(`auth_metrics:${date}:hour:${hour}`) || 0;
        metrics.loginsByHour[hour].count += hourlyCount;
      }
    }

    // Calculate success rate
    metrics.successRate = metrics.totalLogins > 0 
      ? (metrics.successfulLogins / metrics.totalLogins) * 100 
      : 0;

    // Get failure reasons and device types for the period
    metrics.topFailureReasons = await this.getTopFailureReasons(dates);
    metrics.deviceTypes = await this.getDeviceTypeDistribution(dates);

    return metrics;
  }

  async getSecurityMetrics(period: MetricsPeriod): Promise<SecurityMetrics> {
    const dates = this.getDateRange(period);
    const metrics: SecurityMetrics = {
      accountsLocked: 0,
      suspiciousActivities: 0,
      rateLimitViolations: 0,
      csrfViolations: 0,
      tokenBlacklisted: 0,
      otpFailures: 0,
      bruteForceAttempts: 0,
      securityScore: 0
    };

    for (const date of dates) {
      const [
        accountsLocked,
        suspicious,
        rateLimit,
        csrf,
        tokenBlacklist,
        otpFail,
        bruteForce
      ] = await Promise.all([
        this.redisService.get<number>(`security_metrics:${date}:account_locked`) || 0,
        this.redisService.get<number>(`security_metrics:${date}:suspicious_activity`) || 0,
        this.redisService.get<number>(`security_metrics:${date}:rate_limit_exceeded`) || 0,
        this.redisService.get<number>(`security_metrics:${date}:csrf_violation`) || 0,
        this.redisService.get<number>(`security_metrics:${date}:token_blacklisted`) || 0,
        this.redisService.get<number>(`security_metrics:${date}:otp_failed`) || 0,
        this.redisService.get<number>(`security_metrics:${date}:brute_force_detected`) || 0
      ]);

      metrics.accountsLocked += accountsLocked;
      metrics.suspiciousActivities += suspicious;
      metrics.rateLimitViolations += rateLimit;
      metrics.csrfViolations += csrf;
      metrics.tokenBlacklisted += tokenBlacklist;
      metrics.otpFailures += otpFail;
      metrics.bruteForceAttempts += bruteForce;
    }

    // Calculate security score (0-100)
    metrics.securityScore = this.calculateSecurityScore(metrics);

    return metrics;
  }

  async getPerformanceMetrics(period: MetricsPeriod): Promise<PerformanceMetrics> {
    const dates = this.getDateRange(period);
    const metrics: PerformanceMetrics = {
      averageLoginTime: 0,
      averageOTPGenerationTime: 0,
      averageTokenValidationTime: 0,
      redisResponseTime: 0,
      databaseResponseTime: 0,
      emailDeliveryTime: 0
    };

    const metricTypes = [
      'login_time',
      'otp_generation_time',
      'token_validation_time',
      'redis_response_time',
      'database_response_time',
      'email_delivery_time'
    ];

    for (const metricType of metricTypes) {
      let totalValues: number[] = [];

      for (const date of dates) {
        const values = await this.redisService.lrange(`performance_metrics:${date}:${metricType}`, 0, -1);
        totalValues = totalValues.concat(values.map(v => parseFloat(v)));
      }

      const average = totalValues.length > 0 
        ? totalValues.reduce((sum, val) => sum + val, 0) / totalValues.length 
        : 0;

      switch (metricType) {
        case 'login_time':
          metrics.averageLoginTime = average;
          break;
        case 'otp_generation_time':
          metrics.averageOTPGenerationTime = average;
          break;
        case 'token_validation_time':
          metrics.averageTokenValidationTime = average;
          break;
        case 'redis_response_time':
          metrics.redisResponseTime = average;
          break;
        case 'database_response_time':
          metrics.databaseResponseTime = average;
          break;
        case 'email_delivery_time':
          metrics.emailDeliveryTime = average;
          break;
      }
    }

    return metrics;
  }

  async getDashboardMetrics(): Promise<{
    auth: AuthMetrics;
    security: SecurityMetrics;
    performance: PerformanceMetrics;
    alerts: string[];
  }> {
    const today: MetricsPeriod = {
      start: new Date(new Date().setHours(0, 0, 0, 0)),
      end: new Date(new Date().setHours(23, 59, 59, 999)),
      period: 'day'
    };

    const [auth, security, performance] = await Promise.all([
      this.getAuthMetrics(today),
      this.getSecurityMetrics(today),
      this.getPerformanceMetrics(today)
    ]);

    const alerts = this.generateAlerts(auth, security, performance);

    return { auth, security, performance, alerts };
  }

  private async recordSessionStart(userId: string, timestamp: number): Promise<void> {
    const key = `session_start:${userId}`;
    await this.redisService.set(key, timestamp.toString(), 24 * 60 * 60); // 24 hours TTL
  }

  private extractDeviceType(userAgent: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  private getDateRange(period: MetricsPeriod): string[] {
    const dates: string[] = [];
    const current = new Date(period.start);
    
    while (current <= period.end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  }

  private async getTopFailureReasons(dates: string[]): Promise<Array<{ reason: string; count: number }>> {
    const reasonCounts = new Map<string, number>();
    
    for (const date of dates) {
      const keys = await this.redisService.keys(`auth_metrics:${date}:failure_reason:*`);
      
      for (const key of keys) {
        const reason = key.split(':').pop() || 'unknown';
        const count = await this.redisService.get<number>(key) || 0;
        reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + count);
      }
    }
    
    return Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private async getDeviceTypeDistribution(dates: string[]): Promise<Array<{ type: string; count: number }>> {
    const deviceCounts = new Map<string, number>();
    
    for (const date of dates) {
      const keys = await this.redisService.keys(`auth_metrics:${date}:device:*`);
      
      for (const key of keys) {
        const device = key.split(':').pop() || 'unknown';
        const count = await this.redisService.get<number>(key) || 0;
        deviceCounts.set(device, (deviceCounts.get(device) || 0) + count);
      }
    }
    
    return Array.from(deviceCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateSecurityScore(metrics: SecurityMetrics): number {
    let score = 100;
    
    // Deduct points for security incidents
    score -= Math.min(metrics.bruteForceAttempts * 10, 30);
    score -= Math.min(metrics.accountsLocked * 5, 20);
    score -= Math.min(metrics.suspiciousActivities * 3, 15);
    score -= Math.min(metrics.rateLimitViolations * 2, 10);
    score -= Math.min(metrics.csrfViolations * 5, 15);
    score -= Math.min(metrics.otpFailures * 1, 10);
    
    return Math.max(score, 0);
  }

  private generateAlerts(
    auth: AuthMetrics,
    security: SecurityMetrics,
    performance: PerformanceMetrics
  ): string[] {
    const alerts: string[] = [];
    
    // Authentication alerts
    if (auth.successRate < 80) {
      alerts.push(`Low login success rate: ${auth.successRate.toFixed(1)}%`);
    }
    
    // Security alerts
    if (security.bruteForceAttempts > 0) {
      alerts.push(`${security.bruteForceAttempts} brute force attempts detected`);
    }
    
    if (security.securityScore < 70) {
      alerts.push(`Security score is low: ${security.securityScore}/100`);
    }
    
    // Performance alerts
    if (performance.averageLoginTime > 2000) {
      alerts.push(`Slow login performance: ${performance.averageLoginTime}ms average`);
    }
    
    return alerts;
  }

  private async setMetricsTTL(date: string, ttl: number): Promise<void> {
    const keys = await this.redisService.keys(`auth_metrics:${date}:*`);
    for (const key of keys) {
      await this.redisService.expire(key, ttl);
    }
  }

  private async setSecurityMetricsTTL(date: string, ttl: number): Promise<void> {
    const keys = await this.redisService.keys(`security_metrics:${date}:*`);
    for (const key of keys) {
      await this.redisService.expire(key, ttl);
    }
  }
}
