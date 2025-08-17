import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from '@nestjs/common';
import { Response, Request } from 'express';
import { IResponseError } from '@Package/error';
import { MongoServerError } from 'mongodb';
import { Logger } from '@nestjs/common';

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(exception: MongoServerError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();
    console.log("MongoServerError :", exception);

    const statusCode = 400;
    const timestamp = new Date();

    const errorCode = (exception as any)?.code || (exception as any)?.errorResponse?.code || null;
    let message = exception.message || 'Database error';

    if (errorCode === 11000) {
      message = 'Duplicate key error. A document with the same value already exists.';
    } else if (errorCode === 121) {
      message = 'Validation failed for the document.';
    } else if (errorCode === 16755) {
      message = 'Index not found in the database.';
    } else if (errorCode === 2) {
      message = 'Connection to MongoDB failed.';
    }

    const error: IResponseError = {
      path: request.path,
      time: timestamp,
      message,
      code: errorCode,
    };

    this.logger.error(`[MongoServerError] ${message}`, {
      path: request.path,
      code: errorCode,
      exception: exception.stack || exception,
    });

    response.status(statusCode).json({ error });
  }
}

