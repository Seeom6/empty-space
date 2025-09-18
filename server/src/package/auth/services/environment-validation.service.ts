import { Injectable } from '@nestjs/common';
import { EnvironmentService } from '@Infrastructure/config';
import { z } from 'zod';

export interface EnvironmentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityScore: number;
  recommendations: string[];
}

@Injectable()
export class EnvironmentValidationService {
  private readonly requiredEnvVars = [
    'NODE_ENV',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'COOKIE_SECRET',
    'CSRF_SECRET_KEY'
  ];

  constructor(private readonly environmentService: EnvironmentService) {}

  private get envSchema() {
    return this.baseEnvSchema;
  }

  private readonly baseEnvSchema = z.object({
    // Core Application
    NODE_ENV: z.enum(['development', 'staging', 'production', 'test']),
    APP_PORT: z.string().transform(Number).pipe(z.number().min(1000).max(65535)).optional(),
    APP_NAME: z.string().min(1).optional(),

    // JWT Configuration
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'Invalid JWT access expiration format').optional(),
    JWT_REFRESH_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/, 'Invalid JWT refresh expiration format').optional(),
    JWT_ISSUER: z.string().min(1).optional(),
    JWT_AUDIENCE: z.string().min(1).optional(),

    // Cookie Configuration
    COOKIE_SECRET: z.string().min(32, 'Cookie secret must be at least 32 characters'),
    COOKIE_DOMAIN: z.string().optional(),

    // CSRF Protection
    CSRF_SECRET_KEY: z.string().min(32, 'CSRF secret must be at least 32 characters'),

    // Database
    DATABASE_URI: z.string().min(1).optional(),
    DATABASE_NAME: z.string().min(1).optional(),

    // Redis
    REDIS_HOST: z.string().min(1).optional(),
    REDIS_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).optional(),
    REDIS_PASSWORD: z.string().optional(),
    REDIS_DB: z.string().transform(Number).pipe(z.number().min(0).max(15)).optional(),

    // Email Configuration
    MAIL_HOST: z.string().min(1).optional(),
    MAIL_PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).optional(),
    MAIL_USER: z.string().email().optional(),
    MAIL_PASSWORD: z.string().min(1).optional(),
    MAIL_FROM: z.string().email().optional(),
    SUPPORT_EMAIL: z.string().email().optional(),

    // Company Information
    COMPANY_NAME: z.string().min(1).optional(),
    COMPANY_LOGO: z.string().url().optional(),
    WEBSITE_URL: z.string().url().optional(),
    DASHBOARD_URL: z.string().url().optional(),

    // Security Settings
    BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(4).max(15)).optional(),
    OTP_LENGTH: z.string().transform(Number).pipe(z.number().min(4).max(8)).optional(),
    OTP_EXPIRATION_MINUTES: z.string().transform(Number).pipe(z.number().min(1).max(60)).optional(),
    MAX_LOGIN_ATTEMPTS: z.string().transform(Number).pipe(z.number().min(1).max(20)).optional(),
    ACCOUNT_LOCK_DURATION_MINUTES: z.string().transform(Number).pipe(z.number().min(1).max(1440)).optional()
  });

  private readonly productionEnvSchema = this.baseEnvSchema.extend({
    // Required in production
    COOKIE_DOMAIN: z.string().min(1, 'Cookie domain is required in production'),
    DATABASE_URI: z.string().min(1, 'Database URI is required in production'),
    REDIS_HOST: z.string().min(1, 'Redis host is required in production'),
    MAIL_HOST: z.string().min(1, 'Mail host is required in production'),
    MAIL_USER: z.string().email('Valid mail user email is required in production'),
    MAIL_PASSWORD: z.string().min(1, 'Mail password is required in production'),
    COMPANY_NAME: z.string().min(1, 'Company name is required in production'),
    SUPPORT_EMAIL: z.string().email('Valid support email is required in production'),
    WEBSITE_URL: z.string().url('Valid website URL is required in production'),
    DASHBOARD_URL: z.string().url('Valid dashboard URL is required in production'),

    // Enhanced security requirements for production
    BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(12).max(15)),

    // SSL/TLS (optional but recommended)
    SSL_CERT_PATH: z.string().optional(),
    SSL_KEY_PATH: z.string().optional()
  });

  validateEnvironment(): EnvironmentValidationResult {
    const result: EnvironmentValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      securityScore: 0,
      recommendations: []
    };

    // Check required variables
    this.checkRequiredVariables(result);
    
    // Validate schema
    this.validateSchema(result);
    
    // Check production requirements
    if (process.env.NODE_ENV === 'production') {
      this.checkProductionRequirements(result);
    }
    
    // Calculate security score
    result.securityScore = this.calculateSecurityScore();
    
    // Generate recommendations
    this.generateRecommendations(result);
    
    return result;
  }

  validateSecrets(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    const secrets = {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      COOKIE_SECRET: process.env.COOKIE_SECRET,
      CSRF_SECRET_KEY: process.env.CSRF_SECRET_KEY
    };

    Object.entries(secrets).forEach(([name, value]) => {
      if (!value || value.length < 32) {
        issues.push(`${name} must be at least 32 characters long`);
      }
      if (value && this.isWeakSecret(value)) {
        issues.push(`${name} appears to use a weak or default value`);
      }
    });

    if (secrets.JWT_ACCESS_SECRET === secrets.JWT_REFRESH_SECRET) {
      issues.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
    }

    return { valid: issues.length === 0, issues };
  }

  generateSecureSecrets(): Record<string, string> {
    const crypto = require('crypto');
    return {
      JWT_ACCESS_SECRET: crypto.randomBytes(64).toString('hex'),
      JWT_REFRESH_SECRET: crypto.randomBytes(64).toString('hex'),
      COOKIE_SECRET: crypto.randomBytes(64).toString('hex'),
      CSRF_SECRET_KEY: crypto.randomBytes(64).toString('hex')
    };
  }

  private checkRequiredVariables(result: EnvironmentValidationResult): void {
    for (const varName of this.requiredEnvVars) {
      if (!process.env[varName]) {
        result.errors.push(`Missing required environment variable: ${varName}`);
        result.isValid = false;
      }
    }
  }

  private validateSchema(result: EnvironmentValidationResult): void {
    try {
      this.envSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        for (const issue of error.issues) {
          result.errors.push(`${issue.path.join('.')}: ${issue.message}`);
        }
        result.isValid = false;
      }
    }
  }

  private checkProductionRequirements(result: EnvironmentValidationResult): void {
    const productionVars = ['WEBSITE_URL', 'MAIL_HOST', 'SUPPORT_EMAIL'];
    
    for (const varName of productionVars) {
      if (!process.env[varName]) {
        result.warnings.push(`Production environment missing: ${varName}`);
      }
    }

    if (!process.env.WEBSITE_URL?.startsWith('https://')) {
      result.errors.push('WEBSITE_URL must use HTTPS in production');
      result.isValid = false;
    }
  }

  private calculateSecurityScore(): number {
    let score = 0;
    
    // Secret validation (40 points)
    const secretValidation = this.validateSecrets();
    if (secretValidation.valid) score += 40;
    else score += Math.max(0, 40 - secretValidation.issues.length * 10);
    
    // HTTPS in production (30 points)
    if (process.env.NODE_ENV === 'production' && process.env.WEBSITE_URL?.startsWith('https://')) {
      score += 30;
    } else if (process.env.NODE_ENV !== 'production') {
      score += 20;
    }
    
    // Environment completeness (30 points)
    const requiredCount = this.requiredEnvVars.filter(v => process.env[v]).length;
    score += (requiredCount / this.requiredEnvVars.length) * 30;
    
    return Math.min(score, 100);
  }

  private generateRecommendations(result: EnvironmentValidationResult): void {
    const secretValidation = this.validateSecrets();
    
    if (!secretValidation.valid) {
      result.recommendations.push('Generate strong, unique secrets for all authentication components');
    }
    
    if (process.env.NODE_ENV === 'production' && !process.env.WEBSITE_URL?.startsWith('https://')) {
      result.recommendations.push('Use HTTPS in production environment');
    }
    
    if (result.securityScore < 80) {
      result.recommendations.push('Improve environment configuration to enhance security');
    }
    
    if (!process.env.MAIL_HOST && process.env.NODE_ENV === 'production') {
      result.recommendations.push('Configure email service for production notifications');
    }
  }

  private isWeakSecret(secret: string): boolean {
    const weakPatterns = [
      'default',
      'secret',
      'password',
      'change-me',
      '123456',
      'test'
    ];
    
    return weakPatterns.some(pattern => 
      secret.toLowerCase().includes(pattern)
    );
  }
}
