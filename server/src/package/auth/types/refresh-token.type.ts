export interface IRefreshToken {
  userId: string;
  iat?: number,
  exp?: number,
  jti?: string,
}