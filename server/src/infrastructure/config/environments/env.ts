import * as process from 'node:process';
import { IDatabaseEnv } from './interfaces/database.inteface';
import { IAppEnv } from './interfaces/app.interface';
import { IBaseEnv } from './interfaces/base.interface';
import { IJWTEnv } from '@Infrastructure/config/environments/interfaces/jwt.interface';
import { MailConfig } from './interfaces/email.interface';
import { IRedisEnv } from './interfaces/redis.interface';
import { IFileEnv } from './interfaces/file.interface';
import { SwaggerEnv } from './interfaces/swagger.interface';
export interface IEnv extends IBaseEnv {
  app: IAppEnv,
  mongodb: IDatabaseEnv;
  jwt: IJWTEnv;
  mail: MailConfig
  redis: IRedisEnv
  file: IFileEnv;
  swagger: SwaggerEnv
}

export const GetEnv = (): IEnv => ({
  app: {
    host: process.env.HOST,
    name: process.env.NAME,
    port: +process.env.PORT,
    baseUrl: process.env.BASE_URL,
    version: +process.env.VERSION,
    defaultLanguage: process.env.DEFAULT_LANGUAGE,
    globalPrefix: process.env.GLOBAL_PREFIX,
    appApiKey: process.env.APP_API_KEY
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
  }
})


