import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface StandardSuccessResponse<T = any> {
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class SuccessResponseInterceptor<T> implements NestInterceptor<T, StandardSuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request['requestId'] || uuidv4();

    return next.handle().pipe(
      map((data) => {
        // If the response is already in the standard format, return as is
        if (data && typeof data === 'object' && ('data' in data || 'message' in data)) {
          // Ensure meta information is present
          if (!data.meta) {
            data.meta = {
              timestamp: new Date().toISOString(),
              requestId
            };
          }
          return data;
        }

        // Transform raw data into standard format
        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        };
      }),
    );
  }
}
