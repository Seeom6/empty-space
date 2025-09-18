import { ErrorCode } from '@Common/error';
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalFilter implements ExceptionFilter{
  private readonly logger = new Logger(GlobalFilter.name);

  catch(exception: any, host: ArgumentsHost): any {
    const response: Response = host.switchToHttp().getResponse();
    const request: Request = host.switchToHttp().getRequest();

    // Log error with context
    this.logger.error(`Global Error on ${request.method} ${request.path}`, {
      error: exception?.message,
      stack: exception?.stack,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      timestamp: new Date().toISOString()
    });

    let error = {
      path: request.path,
      time: new Date(),
      message: exception?.message,
      code: ErrorCode.SERVER_ERROR,
    }
    return response.status(500).json({
      error: error,
    });
  }
}
