import {
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { StrategyConstant } from "@Package/auth";
import { AppError } from "@Package/error";
import { ErrorCode } from "../../../common/error/error-code";
@Injectable()
export class JwtAuthOptionalGuard extends AuthGuard(StrategyConstant.jwt) {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const hasAccessToken: boolean =
      !!request.headers["authorization"]?.split(" ")[1];

    if (!hasAccessToken) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw (
        err ||
          new AppError({
          code: ErrorCode.ACCESS_TOKEN_NOT_EXIST,
          message: "Access token not exist",
          errorType: "JwtAuthOptionalGuard"
        })
      );
    }
    return user;
  }
}
