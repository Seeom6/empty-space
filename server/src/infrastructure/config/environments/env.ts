import * as process from 'node:process';
import { Logger } from '@nestjs/common';
import { IDatabaseEnv } from './interfaces/database.inteface';
import { IAppEnv } from './interfaces/app.interface';
import { IBaseEnv } from './interfaces/base.interface';
import { IJWTEnv } from '@Infrastructure/config/environments/interfaces/jwt.interface';
import { MailConfig } from './interfaces/email.interface';
import { IRedisEnv } from './interfaces/redis.interface';
import { IFileEnv } from './interfaces/file.interface';
import { SwaggerEnv } from './interfaces/swagger.interface';
import { ICookieEnv } from './interfaces/cookie.interface';

// Production environment validation
const validateProductionSecrets = () => {
  const logger = new Logger('EnvironmentValidation');

  if (process.env.NODE_ENV === 'production') {
    const requiredSecrets = [
      { key: 'JWT_ACCESS_SECRET', name: 'JWT access secret' },
      { key: 'JWT_REFRESH_SECRET', name: 'JWT refresh secret' },
      { key: 'COOKIE_SECRET', name: 'Cookie secret' },
      { key: 'CSRF_SECRET_KEY', name: 'CSRF secret' }
    ];

    const errors: string[] = [];

    requiredSecrets.forEach(({ key, name }) => {
      const value = process.env[key];
      if (!value) {
        errors.push(`${name} (${key}) must be set in production environment`);
      } else if (value.length < 32) {
        errors.push(`${name} (${key}) must be at least 32 characters long in production`);
      } else if (value.includes('default') || value.includes('change-in-production')) {
        errors.push(`${name} (${key}) cannot use default values in production`);
      }
    });

    if (errors.length > 0) {
      logger.error('❌ Production Environment Validation Failed:');
      errors.forEach(error => logger.error(`   - ${error}`));
      throw new Error(`Production environment validation failed: ${errors.length} critical security issues found`);
    }

    logger.log('✅ Production environment secrets validation passed');
  }
};

export interface IEnv extends IBaseEnv {
  app: IAppEnv,
  mongodb: IDatabaseEnv;
  jwt: IJWTEnv;
  mail: MailConfig
  redis: IRedisEnv
  file: IFileEnv;
  swagger: SwaggerEnv;
  cookie: ICookieEnv;
}

// Validate secrets before exporting configuration
validateProductionSecrets();

export const GetEnv = (): IEnv => ({
  app: {
    host: process.env.HOST,
    name: process.env.NAME,
    port: +process.env.PORT,
    baseUrl: process.env.BASE_URL,
    version: +process.env.VERSION,
    defaultLanguage: process.env.DEFAULT_LANGUAGE,
    globalPrefix: process.env.GLOBAL_PREFIX,
    appApiKey: process.env.APP_API_KEY,
    env: process.env.NODE_ENV || 'development'
  },
  mongodb: {
    host: process.env.MONGODB_HOST,
    port: +process.env.MONGODB_PORT,
    password: process.env.MONGODB_PASSWORD,
    username: process.env.MONGODB_USERNAME,
    name: process.env.MONGODB_NAME,
  },
  jwt: {
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtExpiredRefresh: process.env.JWT_EXPIRED_REFRESH,
    jwtExpiredAccess: process.env.JWT_EXPIRED_ACCESS,
    ttlRefreshToken: +process.env.REFRESH_TOKEN_REDIS_EXPIERD,
    issuer: process.env.JWT_ISSUER || 'employee-management-system',
    audience: process.env.JWT_AUDIENCE || 'employee-management-client'
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: +process.env.MAIL_PORT,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    databaseIndex: +process.env.REDIS_DATABASE_INDEX,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    name: process.env.REDIS_NAME,
    accessTokenTTL: +process.env.REDIS_ACCESS_TOKEN_TTL,
  },
  file: {
    maxFileSize: +process.env.MAX_FILE_SIZE,
    baseUrl: process.env.BASE_URL,
  },
  swagger: {
    password: process.env.SWAGGER_PASSWORD,
    userName: process.env.SWAGGER_USERNAME
  },
  cookie: {
    secret: (() => {
      if (process.env.NODE_ENV === 'production' && !process.env.COOKIE_SECRET) {
        throw new Error('COOKIE_SECRET must be set in production');
      }
      return process.env.COOKIE_SECRET || 'dev-only-cookie-secret';
    })(),
    domain: process.env.COOKIE_DOMAIN
  }
})


