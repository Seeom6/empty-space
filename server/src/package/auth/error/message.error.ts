import { IServiceError } from "@Package/error";
import {ErrorCode} from "../../../common/error/error-code";
import { Injectable } from "@nestjs/common";

export const AuthErrorMessage = {
  [ErrorCode.EXPIRED_ACCESS_TOKEN]: 'Session expired',
  [ErrorCode.EXPIRED_REFRESH_TOKEN]: 'Session expired you should log in again',
  [ErrorCode.INVALID_TOKEN]: 'Invalid token',
  [ErrorCode.ACCESS_TOKEN_NOT_EXIST]: 'Access token not exist',
  [ErrorCode.EXPIRED_OTP_TOKEN]: 'OTP expired',
};

@Injectable()
export class AuthError extends IServiceError {
  constructor(){
    super(AuthErrorMessage, AuthError.name)
  }
}