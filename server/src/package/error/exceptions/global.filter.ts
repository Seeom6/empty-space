import { ErrorCode } from '@Common/error';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class GlobalFilter implements ExceptionFilter{
  catch(exception: any, host: ArgumentsHost): any {
    const response: Response = host.switchToHttp().getResponse();
    const request: Request = host.switchToHttp().getRequest();
    console.log("Global Error: ",exception);
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
