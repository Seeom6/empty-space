import { Injectable } from '@nestjs/common';
import { IServiceError } from '@Package/error/service.error.interface';
import { ErrorCode } from '@Common/error/error-code';

const AuthErrorMessages = {
  [ErrorCode.USER_ALREADY_EXISTS]: 'Account already exists',
  [ErrorCode.OTP_EXPIRED]: 'OTP expired or not found',
  [ErrorCode.INVALID_OTP]: 'Invalid OTP',
  [ErrorCode.OTP_VERIFICATION_FAILED]: 'Failed to verify OTP',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
  [ErrorCode.INVALID_RESET_TOKEN]: 'Invalid or expired password reset token',
  [ErrorCode.REFRESH_TOKEN_NOT_IN_REDIS]: 'refresh token not in redis',
  [ErrorCode.INVITE_CODE_USED]: 'invite code ealready used '
};

@Injectable()
export class AuthError extends IServiceError {

    constructor() {
    super(AuthErrorMessages, 'AUTH_ERROR');
  }

}