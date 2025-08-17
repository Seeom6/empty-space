import { Injectable } from "@nestjs/common";
import { ErrorCode } from "../../../common/error/error-code";
import { ErrorMessages, IServiceError } from "@Package/error";

const PrivilegeErrorMessages: ErrorMessages = {
  [ErrorCode.PRIVILEGE_NOT_FOUND]: 'Privilege not found',
  [ErrorCode.PRIVILEGE_ALREADY_EXISTS]: 'Privilege already exists',
};

@Injectable()
export class PrivilegeError extends IServiceError {
  constructor() {
    super(PrivilegeErrorMessages, 'PRIVILEGE_ERROR');
  }
}
