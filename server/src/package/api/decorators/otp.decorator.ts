import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { OtpPayload } from '@Package/auth';

export const Otp = createParamDecorator((data: any, context: ExecutionContext): OtpPayload => {
    const req = context.switchToHttp().getRequest();
    return req?.user ?? null
})