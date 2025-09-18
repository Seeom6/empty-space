import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const RegistrationToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['registrationToken'];
  },
);

export const RegistrationPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['registrationPayload'];
  },
);
