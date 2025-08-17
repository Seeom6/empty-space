export interface IRedisEnv {
  name: string;
  host: string;
  port: number;
  username: string;
  databaseIndex: number;
  password: string;
  accessTokenTTL: number
}