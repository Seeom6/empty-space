import {applyDecorators, Controller, UseGuards, UseInterceptors} from '@nestjs/common';
import { JwtAuthGuard } from 'src/package/auth';
import { ResponseInterceptor } from "src/package/api";
import { PathPrefixEnum } from '../enum';
import { APIKeyGuard } from '@Package/auth/guards/app-api.key.guard';

export function AuthWebController(options: { prefix: string }){
  return applyDecorators(
    Controller({path: `${PathPrefixEnum.WEB}/${options.prefix}`}),
    UseGuards(JwtAuthGuard),
    UseInterceptors(ResponseInterceptor)
  )
}

export function WebController(options: { prefix: string }){
  return applyDecorators(
    Controller({path: `${PathPrefixEnum.WEB}/${options.prefix}`}),
    // UseGuards(APIKeyGuard),
    UseInterceptors(ResponseInterceptor)
  )
}

export function AdminController(options: { prefix: string }){
  return applyDecorators(
    Controller({path: `${PathPrefixEnum.ADMIN}/${options.prefix}`}),
    UseGuards(JwtAuthGuard),
    UseInterceptors(ResponseInterceptor)
  )
}
