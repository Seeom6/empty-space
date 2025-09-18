import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const OTPToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['otpToken'];
  },
);

export const OTPPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['otpPayload'];
  },
);
