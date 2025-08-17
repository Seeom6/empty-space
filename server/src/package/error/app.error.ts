import { IError } from '@Package/error/error.interface';

export class AppError extends Error implements IError {
  public readonly code: number;
  public readonly errorType: string;
  public readonly statusCode: number;

  constructor(error: IError, statusCode: number = 400) {
    super(error.message as string);
    this.code = error.code;
    this.errorType = error.errorType;
    this.statusCode = this.statusCode
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
