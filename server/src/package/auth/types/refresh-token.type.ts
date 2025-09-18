export interface IRefreshToken {
  userId: string;
  iat?: number,
  exp?: number,
  jti: string, // Made required for new token rotation system
}