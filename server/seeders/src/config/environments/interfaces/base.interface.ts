import { IAppEnv } from './app.interface';
import { IDatabaseEnv } from './database.inteface';
import { MailConfig } from './email.interface';
import { IJWTEnv } from './jwt.interface';
import { IRedisEnv } from './redis.interface';
export interface IBaseEnv {
  app: IAppEnv,
  database?: IDatabaseEnv
  jwt: IJWTEnv
  mail: MailConfig
  redis: IRedisEnv
}