import { ErrorCode } from "@Common/error/error-code";
import { Injectable } from "@nestjs/common";
import { IServiceError } from "@Package/error";

const AccountErrorMessages = {
  [ErrorCode.ACCOUNT_NOT_FOUND]: 'Account not found',
  [ErrorCode.ACCOUNT_ALREADY_EXISTS]: 'Account already exists',
  [ErrorCode.ACCOUNT_NOT_ACTIVE]: 'Account not active',
  [ErrorCode.ACCOUNT_NOT_CONFIRMED]: 'Account not confirmed',
  [ErrorCode.NOT_SUPER_ADMIN]: 'To add or update super admin  you need to be super admin',
  [ErrorCode.OLD_PASSWORD_NOT_CORRECT]: 'Old password is not correct',
  [ErrorCode.CAN_NOT_DELETE_YOUR_SELF]: 'You can not delete yourself',
  [ErrorCode.USERNAME_OR_PASSWORD_NOT_CORRECT]: 'Email or password not correct',
  [ErrorCode.HAVE_FORGET_REQUEST_BEFORE]: 'You have forget request before',
  [ErrorCode.CHANGE_PASSWORD_MUST_BE_FALSE]: 'You must login before',
  [ErrorCode.DUPLICATED_EMAIL]: 'email is exist Before',
  [ErrorCode.DUPLICATED_PHONE_NUMBER]: 'phoneNumber is exist Before',
  [ErrorCode.PHONE_NUMBER_EXIST_BEFORE]: 'Phone number is exist before',
  [ErrorCode.LOG_IN_FAILED]: 'Log in failed',
};

@Injectable()
export class AccountError extends IServiceError {
  
  constructor() {
    super(AccountErrorMessages, 'ACCOUNT_ERROR');
  }

}
