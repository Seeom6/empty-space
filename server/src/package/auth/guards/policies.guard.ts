import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { CHECK_POLICIES_KEY } from "../decorators/policies-no-action.decorator";
import { AppError } from "@Package/error";
import { ErrorCode } from "../../../common/error/error-code";

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const policyHandlers = this.reflector.get<{
      keys: string[];
      values: string[];
    }>(CHECK_POLICIES_KEY, context.getHandler());

    const { user } = context.switchToHttp().getRequest();
    if (!user.privileges)
      throw new AppError({
        code: ErrorCode.NOT_ALLOWED_TO_ACCESS,
        message: "You are not allowed to access this resource",
        errorType: "Policies Guard"
      });

    //check privileges
    for (let index = 0; index < policyHandlers.keys.length; index++) {
      if (user.privileges[policyHandlers.keys[index]]) break;

      if (index === policyHandlers.keys.length - 1)
        throw new AppError({
          code: ErrorCode.NOT_ALLOWED_TO_ACCESS,
          message: "You are not allowed to access this resource",
          errorType: "Policies Guard"
        });
    }
    const privilegeKey = user.privileges[policyHandlers.keys[0]];
    if (!privilegeKey)
      throw new AppError({
        code: ErrorCode.NOT_ALLOWED_TO_ACCESS,
        message: "You are not allowed to access this resource",
        errorType: "Policies Guard"
      });
    for (let index = 0; index < policyHandlers.values.length; index++) {
      if (privilegeKey[policyHandlers.values[index]]) break;

      if (index === policyHandlers.values.length - 1)
        throw new AppError({
          code: ErrorCode.NOT_ALLOWED_TO_ACCESS,
          message: "You are not allowed to access this resource",
          errorType: "Policies Guard"
        });
    }

    return true;
  }
}
