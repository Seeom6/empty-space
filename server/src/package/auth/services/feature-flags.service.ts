import { Injectable } from '@nestjs/common';
import { RedisService } from '@Infrastructure/cache';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions: FeatureFlagCondition[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface FeatureFlagCondition {
  type: 'user_id' | 'email' | 'role' | 'environment' | 'ip_address' | 'user_agent';
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in';
  value: string | string[];
}

export interface FeatureFlagContext {
  userId?: string;
  email?: string;
  role?: string;
  environment?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class FeatureFlagsService {
  private readonly flagsCache = new Map<string, FeatureFlag>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;

  constructor(private readonly redisService: RedisService) {
    this.initializeDefaultFlags();
  }

  async isEnabled(flagKey: string, context?: FeatureFlagContext): Promise<boolean> {
    const flag = await this.getFlag(flagKey);
    
    if (!flag) {
      return false; // Default to disabled for unknown flags
    }

    if (!flag.enabled) {
      return false;
    }

    // Check conditions
    if (flag.conditions.length > 0) {
      const conditionsMet = this.evaluateConditions(flag.conditions, context);
      if (!conditionsMet) {
        return false;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      return this.isInRollout(flagKey, context, flag.rolloutPercentage);
    }

    return true;
  }

  async getFlag(flagKey: string): Promise<FeatureFlag | null> {
    // Check cache first
    await this.refreshCacheIfNeeded();
    
    if (this.flagsCache.has(flagKey)) {
      return this.flagsCache.get(flagKey)!;
    }

    // Load from Redis
    const flagData = await this.redisService.get<string>(`feature_flag:${flagKey}`);
    if (flagData) {
      const flag = JSON.parse(flagData);
      flag.createdAt = new Date(flag.createdAt);
      flag.updatedAt = new Date(flag.updatedAt);
      this.flagsCache.set(flagKey, flag);
      return flag;
    }

    return null;
  }

  async setFlag(flag: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = new Date();
    const fullFlag: FeatureFlag = {
      ...flag,
      createdAt: now,
      updatedAt: now
    };

    // Save to Redis
    await this.redisService.set(
      `feature_flag:${flag.key}`,
      JSON.stringify(fullFlag),
      0 // No expiration
    );

    // Update cache
    this.flagsCache.set(flag.key, fullFlag);
    
    // Add to flags list
    await this.redisService.sadd('feature_flags:all', flag.key);
  }

  async updateFlag(flagKey: string, updates: Partial<FeatureFlag>): Promise<boolean> {
    const existingFlag = await this.getFlag(flagKey);
    if (!existingFlag) {
      return false;
    }

    const updatedFlag: FeatureFlag = {
      ...existingFlag,
      ...updates,
      updatedAt: new Date()
    };

    await this.setFlag(updatedFlag);
    return true;
  }

  async deleteFlag(flagKey: string): Promise<boolean> {
    const deleted = await this.redisService.del([`feature_flag:${flagKey}`]);
    await this.redisService.srem('feature_flags:all', flagKey);
    this.flagsCache.delete(flagKey);
    return deleted > 0;
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    const flagKeys = await this.redisService.smembers('feature_flags:all');
    const flags: FeatureFlag[] = [];

    for (const key of flagKeys) {
      const flag = await this.getFlag(key);
      if (flag) {
        flags.push(flag);
      }
    }

    return flags.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getFlagsForContext(context: FeatureFlagContext): Promise<Record<string, boolean>> {
    const allFlags = await this.getAllFlags();
    const result: Record<string, boolean> = {};

    for (const flag of allFlags) {
      result[flag.key] = await this.isEnabled(flag.key, context);
    }

    return result;
  }

  // Authentication-specific feature flags
  async isProgressiveRateLimitingEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('progressive_rate_limiting', context);
  }

  async isAccountLockingEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('account_locking', context);
  }

  async isCSRFProtectionEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('csrf_protection', context);
  }

  async isSecurityEventLoggingEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('security_event_logging', context);
  }

  async isTokenBlacklistingEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('token_blacklisting', context);
  }

  async isEmailTemplatesEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('email_templates', context);
  }

  async isAdvancedValidationEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('advanced_validation', context);
  }

  async isMetricsCollectionEnabled(context?: FeatureFlagContext): Promise<boolean> {
    return this.isEnabled('metrics_collection', context);
  }

  private async initializeDefaultFlags(): Promise<void> {
    const defaultFlags: Omit<FeatureFlag, 'createdAt' | 'updatedAt'>[] = [
      {
        key: 'progressive_rate_limiting',
        name: 'Progressive Rate Limiting',
        description: 'Enable progressive rate limiting with exponential backoff',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'account_locking',
        name: 'Account Locking',
        description: 'Enable automatic account locking after failed attempts',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'csrf_protection',
        name: 'CSRF Protection',
        description: 'Enable CSRF token validation',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'security_event_logging',
        name: 'Security Event Logging',
        description: 'Enable comprehensive security event logging',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'token_blacklisting',
        name: 'Token Blacklisting',
        description: 'Enable token blacklisting for enhanced security',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'email_templates',
        name: 'Email Templates',
        description: 'Enable advanced email template system',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'advanced_validation',
        name: 'Advanced Input Validation',
        description: 'Enable advanced input validation and sanitization',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'metrics_collection',
        name: 'Metrics Collection',
        description: 'Enable authentication and security metrics collection',
        enabled: true,
        rolloutPercentage: 100,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'enhanced_session_management',
        name: 'Enhanced Session Management',
        description: 'Enable enhanced session tracking and management',
        enabled: false,
        rolloutPercentage: 0,
        conditions: [],
        createdBy: 'system'
      },
      {
        key: 'biometric_authentication',
        name: 'Biometric Authentication',
        description: 'Enable biometric authentication support',
        enabled: false,
        rolloutPercentage: 0,
        conditions: [],
        createdBy: 'system'
      }
    ];

    // Only create flags that don't exist
    for (const flagData of defaultFlags) {
      const existingFlag = await this.getFlag(flagData.key);
      if (!existingFlag) {
        await this.setFlag(flagData);
      }
    }
  }

  private evaluateConditions(
    conditions: FeatureFlagCondition[],
    context?: FeatureFlagContext
  ): boolean {
    if (!context) {
      return false;
    }

    return conditions.every(condition => {
      const contextValue = context[condition.type];
      if (!contextValue) {
        return false;
      }

      switch (condition.operator) {
        case 'equals':
          return contextValue === condition.value;
        
        case 'contains':
          return typeof contextValue === 'string' && 
                 typeof condition.value === 'string' &&
                 contextValue.includes(condition.value);
        
        case 'starts_with':
          return typeof contextValue === 'string' && 
                 typeof condition.value === 'string' &&
                 contextValue.startsWith(condition.value);
        
        case 'ends_with':
          return typeof contextValue === 'string' && 
                 typeof condition.value === 'string' &&
                 contextValue.endsWith(condition.value);
        
        case 'in':
          return Array.isArray(condition.value) && 
                 condition.value.includes(contextValue);
        
        case 'not_in':
          return Array.isArray(condition.value) && 
                 !condition.value.includes(contextValue);
        
        default:
          return false;
      }
    });
  }

  private isInRollout(
    flagKey: string,
    context: FeatureFlagContext | undefined,
    percentage: number
  ): boolean {
    // Use consistent hashing based on flag key and user identifier
    const identifier = context?.userId || context?.email || 'anonymous';
    const hash = this.simpleHash(`${flagKey}:${identifier}`);
    const bucket = hash % 100;
    
    return bucket < percentage;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate > this.cacheTimeout) {
      this.flagsCache.clear();
      this.lastCacheUpdate = now;
    }
  }
}
