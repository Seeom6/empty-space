import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';

export interface RedisKeyPattern {
  pattern: string;
  description: string;
  ttl: number;
  category: KeyCategory;
  priority: KeyPriority;
}

export enum KeyCategory {
  AUTHENTICATION = 'auth',
  SESSION = 'session',
  RATE_LIMIT = 'rate_limit',
  SECURITY = 'security',
  CACHE = 'cache',
  TEMPORARY = 'temp'
}

export enum KeyPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4
}

export interface KeyMetrics {
  totalKeys: number;
  keysByCategory: Record<KeyCategory, number>;
  memoryUsage: number;
  expiredKeys: number;
  keyDistribution: Array<{ pattern: string; count: number; memoryMB: number }>;
}

@Injectable()
export class RedisKeyOptimizationService {
  private readonly keyPatterns: Map<string, RedisKeyPattern> = new Map();

  constructor(private readonly redisService: RedisService) {
    this.initializeKeyPatterns();
  }

  private initializeKeyPatterns(): void {
    const patterns: RedisKeyPattern[] = [
      // Authentication Keys
      {
        pattern: 'auth:session:*',
        description: 'User session data',
        ttl: 15 * 60, // 15 minutes
        category: KeyCategory.SESSION,
        priority: KeyPriority.CRITICAL
      },
      {
        pattern: 'auth:otp:*:*',
        description: 'OTP verification codes',
        ttl: 10 * 60, // 10 minutes
        category: KeyCategory.AUTHENTICATION,
        priority: KeyPriority.HIGH
      },
      {
        pattern: 'auth:refresh:*:*',
        description: 'Refresh tokens',
        ttl: 7 * 24 * 60 * 60, // 7 days
        category: KeyCategory.AUTHENTICATION,
        priority: KeyPriority.CRITICAL
      },
      {
        pattern: 'auth:blacklist:*',
        description: 'Blacklisted tokens',
        ttl: 30 * 24 * 60 * 60, // 30 days
        category: KeyCategory.SECURITY,
        priority: KeyPriority.HIGH
      },

      // Rate Limiting Keys
      {
        pattern: 'auth:rate_limit:*:*',
        description: 'Rate limiting counters',
        ttl: 15 * 60, // 15 minutes
        category: KeyCategory.RATE_LIMIT,
        priority: KeyPriority.HIGH
      },
      {
        pattern: 'progressive_rate_limit:*:*',
        description: 'Progressive rate limiting data',
        ttl: 15 * 60, // 15 minutes
        category: KeyCategory.RATE_LIMIT,
        priority: KeyPriority.HIGH
      },

      // Security Keys
      {
        pattern: 'auth:failed_attempts:*',
        description: 'Failed login attempts',
        ttl: 60 * 60, // 1 hour
        category: KeyCategory.SECURITY,
        priority: KeyPriority.HIGH
      },
      {
        pattern: 'auth:account_lock:*',
        description: 'Account lock information',
        ttl: 24 * 60 * 60, // 24 hours
        category: KeyCategory.SECURITY,
        priority: KeyPriority.CRITICAL
      },
      {
        pattern: 'csrf:*',
        description: 'CSRF tokens',
        ttl: 15 * 60, // 15 minutes
        category: KeyCategory.SECURITY,
        priority: KeyPriority.MEDIUM
      },

      // Security Events
      {
        pattern: 'security_event:*',
        description: 'Security event logs',
        ttl: 90 * 24 * 60 * 60, // 90 days
        category: KeyCategory.SECURITY,
        priority: KeyPriority.MEDIUM
      },
      {
        pattern: 'security_events:*:*',
        description: 'Security event indexes',
        ttl: 90 * 24 * 60 * 60, // 90 days
        category: KeyCategory.SECURITY,
        priority: KeyPriority.MEDIUM
      },

      // Token Management
      {
        pattern: 'token_blacklist:*',
        description: 'Token blacklist entries',
        ttl: 30 * 24 * 60 * 60, // 30 days
        category: KeyCategory.SECURITY,
        priority: KeyPriority.HIGH
      },
      {
        pattern: 'token_family:*',
        description: 'Token family tracking',
        ttl: 90 * 24 * 60 * 60, // 90 days
        category: KeyCategory.AUTHENTICATION,
        priority: KeyPriority.MEDIUM
      },
      {
        pattern: 'used_refresh_token:*',
        description: 'Used refresh token tracking',
        ttl: 30 * 24 * 60 * 60, // 30 days
        category: KeyCategory.SECURITY,
        priority: KeyPriority.HIGH
      }
    ];

    patterns.forEach(pattern => {
      this.keyPatterns.set(pattern.pattern, pattern);
    });
  }

  async optimizeKeys(): Promise<{
    optimized: number;
    errors: string[];
    recommendations: string[];
  }> {
    const result = {
      optimized: 0,
      errors: [],
      recommendations: []
    };

    try {
      // Get all keys
      const allKeys = await this.redisService.keys('*');
      
      // Group keys by pattern
      const keyGroups = this.groupKeysByPattern(allKeys);
      
      // Optimize each group
      for (const [pattern, keys] of keyGroups.entries()) {
        const patternConfig = this.keyPatterns.get(pattern);
        if (patternConfig) {
          const optimizedCount = await this.optimizeKeyGroup(keys, patternConfig);
          result.optimized += optimizedCount;
        }
      }

      // Generate recommendations
      result.recommendations = await this.generateOptimizationRecommendations(keyGroups);

    } catch (error) {
      result.errors.push(`Optimization failed: ${error.message}`);
    }

    return result;
  }

  async getKeyMetrics(): Promise<KeyMetrics> {
    const allKeys = await this.redisService.keys('*');
    const keyGroups = this.groupKeysByPattern(allKeys);
    
    const metrics: KeyMetrics = {
      totalKeys: allKeys.length,
      keysByCategory: {} as Record<KeyCategory, number>,
      memoryUsage: 0,
      expiredKeys: 0,
      keyDistribution: []
    };

    // Initialize category counts
    Object.values(KeyCategory).forEach(category => {
      metrics.keysByCategory[category] = 0;
    });

    // Calculate metrics for each pattern
    for (const [pattern, keys] of keyGroups.entries()) {
      const patternConfig = this.keyPatterns.get(pattern);
      if (patternConfig) {
        metrics.keysByCategory[patternConfig.category] += keys.length;
        
        // Estimate memory usage (simplified)
        const avgKeySize = await this.estimateKeySize(keys.slice(0, 10));
        const totalMemoryMB = (keys.length * avgKeySize) / (1024 * 1024);
        
        metrics.keyDistribution.push({
          pattern,
          count: keys.length,
          memoryMB: totalMemoryMB
        });
        
        metrics.memoryUsage += totalMemoryMB;
      }
    }

    // Count expired keys
    metrics.expiredKeys = await this.countExpiredKeys(allKeys);

    return metrics;
  }

  async cleanupExpiredKeys(): Promise<number> {
    let cleanedCount = 0;
    
    for (const [pattern, config] of this.keyPatterns.entries()) {
      const keys = await this.redisService.keys(pattern);
      
      for (const key of keys) {
        const ttl = await this.redisService.ttl(key);
        
        // If TTL is -1 (no expiration) but should have one, set it
        if (ttl === -1 && config.ttl > 0) {
          await this.redisService.expire(key, config.ttl);
          cleanedCount++;
        }
        
        // If TTL is 0 or negative (expired), delete the key
        if (ttl === 0 || (ttl > 0 && ttl < -1)) {
          await this.redisService.del([key]);
          cleanedCount++;
        }
      }
    }
    
    return cleanedCount;
  }

  async setOptimalTTLs(): Promise<number> {
    let updatedCount = 0;
    
    for (const [pattern, config] of this.keyPatterns.entries()) {
      const keys = await this.redisService.keys(pattern);
      
      for (const key of keys) {
        const currentTTL = await this.redisService.ttl(key);
        
        // Set TTL if not set or if current TTL is significantly different
        if (currentTTL === -1 || Math.abs(currentTTL - config.ttl) > config.ttl * 0.1) {
          await this.redisService.expire(key, config.ttl);
          updatedCount++;
        }
      }
    }
    
    return updatedCount;
  }

  async compactKeys(): Promise<number> {
    // This would implement key compaction strategies
    // For now, we'll focus on removing empty or invalid keys
    let compactedCount = 0;
    
    const allKeys = await this.redisService.keys('*');
    
    for (const key of allKeys) {
      try {
        const value = await this.redisService.get(key);
        
        // Remove empty string values
        if (value === '' || value === null) {
          await this.redisService.del([key]);
          compactedCount++;
          continue;
        }
        
        // Remove invalid JSON objects
        if (typeof value === 'string' && value.startsWith('{')) {
          try {
            JSON.parse(value);
          } catch {
            await this.redisService.del([key]);
            compactedCount++;
          }
        }
      } catch (error) {
        // If we can't read the key, it might be corrupted
        await this.redisService.del([key]);
        compactedCount++;
      }
    }
    
    return compactedCount;
  }

  async getKeyHealth(): Promise<{
    healthy: number;
    expiring: number;
    expired: number;
    noTTL: number;
    issues: string[];
  }> {
    const allKeys = await this.redisService.keys('*');
    const health = {
      healthy: 0,
      expiring: 0,
      expired: 0,
      noTTL: 0,
      issues: []
    };

    for (const key of allKeys) {
      const ttl = await this.redisService.ttl(key);
      
      if (ttl === -1) {
        health.noTTL++;
        
        // Check if this key should have a TTL
        const shouldHaveTTL = Array.from(this.keyPatterns.keys()).some(pattern => 
          this.matchesPattern(key, pattern)
        );
        
        if (shouldHaveTTL) {
          health.issues.push(`Key ${key} should have TTL but doesn't`);
        }
      } else if (ttl === 0 || ttl < -1) {
        health.expired++;
      } else if (ttl < 60) { // Expiring within 1 minute
        health.expiring++;
      } else {
        health.healthy++;
      }
    }

    return health;
  }

  private groupKeysByPattern(keys: string[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();
    
    for (const key of keys) {
      let matched = false;
      
      for (const pattern of this.keyPatterns.keys()) {
        if (this.matchesPattern(key, pattern)) {
          if (!groups.has(pattern)) {
            groups.set(pattern, []);
          }
          groups.get(pattern)!.push(key);
          matched = true;
          break;
        }
      }
      
      // Group unmatched keys
      if (!matched) {
        const unknownPattern = 'unknown:*';
        if (!groups.has(unknownPattern)) {
          groups.set(unknownPattern, []);
        }
        groups.get(unknownPattern)!.push(key);
      }
    }
    
    return groups;
  }

  private matchesPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    return new RegExp(`^${regexPattern}$`).test(key);
  }

  private async optimizeKeyGroup(keys: string[], config: RedisKeyPattern): Promise<number> {
    let optimizedCount = 0;
    
    for (const key of keys) {
      const ttl = await this.redisService.ttl(key);
      
      // Set appropriate TTL if missing or incorrect
      if (ttl === -1 || Math.abs(ttl - config.ttl) > config.ttl * 0.2) {
        await this.redisService.expire(key, config.ttl);
        optimizedCount++;
      }
    }
    
    return optimizedCount;
  }

  private async generateOptimizationRecommendations(
    keyGroups: Map<string, string[]>
  ): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Check for patterns with too many keys
    for (const [pattern, keys] of keyGroups.entries()) {
      if (keys.length > 10000) {
        recommendations.push(`Pattern ${pattern} has ${keys.length} keys - consider implementing cleanup`);
      }
    }
    
    // Check for unknown patterns
    const unknownKeys = keyGroups.get('unknown:*');
    if (unknownKeys && unknownKeys.length > 0) {
      recommendations.push(`Found ${unknownKeys.length} keys with unknown patterns - review and categorize`);
    }
    
    return recommendations;
  }

  private async estimateKeySize(sampleKeys: string[]): Promise<number> {
    if (sampleKeys.length === 0) return 0;
    
    let totalSize = 0;
    
    for (const key of sampleKeys) {
      try {
        const value = await this.redisService.get(key);
        const keySize = Buffer.byteLength(key, 'utf8');
        const valueSize = value ? Buffer.byteLength(JSON.stringify(value), 'utf8') : 0;
        totalSize += keySize + valueSize;
      } catch {
        // Skip keys that can't be read
      }
    }
    
    return sampleKeys.length > 0 ? totalSize / sampleKeys.length : 0;
  }

  private async countExpiredKeys(keys: string[]): Promise<number> {
    let expiredCount = 0;
    
    for (const key of keys.slice(0, 1000)) { // Sample first 1000 keys
      const ttl = await this.redisService.ttl(key);
      if (ttl === 0 || ttl < -1) {
        expiredCount++;
      }
    }
    
    // Extrapolate for all keys
    return Math.round((expiredCount / Math.min(1000, keys.length)) * keys.length);
  }
}
