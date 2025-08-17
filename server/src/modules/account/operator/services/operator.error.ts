import { Injectable } from "@nestjs/common";
import { IServiceError } from "@Package/error";
import { ErrorCode } from "@Common/error/error-code";

const OperatorErrorMessages = {
  [ErrorCode.OPERATOR_NOT_FOUND]: 'Operator not found',
  [ErrorCode.OPERATOR_ALREADY_EXISTS]: 'Operator already exists',
};

@Injectable()
export class OperatorError extends IServiceError {

  constructor() {
    super(OperatorErrorMessages, 'OPERATOR_ERROR');
  }

}
