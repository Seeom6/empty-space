import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { CHECK_TYPES_KEY } from "../decorators/userTypes.decorator";
import { AppError } from "@Package/error";
import { ErrorCode } from "../../../common/error/error-code";

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

    if (!typeHandlers.values.includes(user.type)){
      throw new AppError({
        code: ErrorCode.NOT_ALLOWED_TO_ACCESS,
        message: "You are not allowed to access this resource",
        errorType: "User Types Guard"
      });
    }


    return true;
  }
}
