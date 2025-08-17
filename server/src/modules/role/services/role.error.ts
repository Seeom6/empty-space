import { Injectable } from "@nestjs/common";
import { ErrorMessages, IServiceError } from "@Package/error";
import { ErrorCode } from "../../../common/error/error-code";


const RoleErrorMessages: ErrorMessages = {
  [ErrorCode.ROLE_NOT_FOUND]: 'Role not found',
  [ErrorCode.ROLE_ALREADY_EXISTS]: 'Role already exists',
};

@Injectable()
export class RoleError extends IServiceError {
  constructor() {
    super(RoleErrorMessages, 'ROLE_ERROR');
  }
}
