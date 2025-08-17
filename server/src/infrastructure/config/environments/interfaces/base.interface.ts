import { IAppEnv } from './app.interface';
import { IDatabaseEnv } from './database.inteface';
import { IJWTEnv } from '@Infrastructure/config/environments/interfaces/jwt.interface';
import { MailConfig } from './email.interface';
import { IRedisEnv } from './redis.interface';
export interface IBaseEnv {
  app: IAppEnv,
  database?: IDatabaseEnv
  jwt: IJWTEnv
  mail: MailConfig
  redis: IRedisEnv
}