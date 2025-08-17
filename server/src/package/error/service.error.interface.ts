import { ErrorCode } from "@Common/error/error-code";
import { AppError } from "./app.error";
import { ErrorFactory } from "./error.factory";
import { ErrorMessages } from "./error.interface";

export abstract class IServiceError {
  constructor(
    private readonly errorMessages: ErrorMessages,
    private readonly errorType: string,
  ) {
  }
  throw(code: ErrorCode,statusCode: number = 400, context?: any): never {
    const message = this.errorMessages[code] || 'Unknown role error';
    throw ErrorFactory.createError({
        code,
        message,
        statusCode,
        errorType: this.errorType,
    });
  }
  error(code: ErrorCode,statusCode: number = 400 ,context?: any): AppError {
    const message = this.errorMessages[code] || 'Unknown role error';
    return ErrorFactory.createError({
      code,
      message,
      errorType: this.errorType,
    });
  }
}
