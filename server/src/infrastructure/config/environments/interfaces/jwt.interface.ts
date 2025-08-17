
export interface IJWTEnv {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtExpiredAccess: string;
  jwtExpiredRefresh: string;
  ttlRefreshToken: number;
}