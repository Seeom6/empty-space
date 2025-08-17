import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import {CHECK_TYPES_KEY} from "src/package/api";
import {AppError, ErrorFactory} from "@Package/error";
import {ErrorCode} from "../../../common/error/error-code";

@Injectable()
export class UserTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const typeHandlers = this.reflector.get<{
      values: string[];
    }>(CHECK_TYPES_KEY, context.getHandler());

    const { user } = context.switchToHttp().getRequest();
    if (!typeHandlers.values.includes(user.accountRole)){
      throw new AppError(
        {
          code: ErrorCode.USER_NOT_ALLOW,
          message: "you not allow to this action"
        },
      );
    }


    return true;
  }
}
