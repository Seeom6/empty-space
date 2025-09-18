import { IError } from '@Package/error/error.interface';

export class AppError extends Error implements IError {
  public readonly code: number;
  public readonly errorType: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(error: IError & { details?: any }, statusCode: number = 400) {
    super(error.message as string);
    this.code = error.code;
    this.errorType = error.errorType || 'APPLICATION_ERROR';
    this.statusCode = statusCode;
    this.details = error.details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
