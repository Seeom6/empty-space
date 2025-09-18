import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const SessionToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['sessionToken'];
  },
);

export const SessionPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['sessionPayload'];
  },
);
