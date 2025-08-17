import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Account = createParamDecorator((data: any, context:  ExecutionContext)=>{
  const req = context.switchToHttp().getRequest();
  return req?.user ?? null
})