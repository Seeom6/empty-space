import {
  ExecutionContext,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { AppError } from "@Package/error";
import { ErrorCode } from "../../../common/error/error-code";
import { StrategyConstant } from "../passport/strategy/strategy.constant";

@Injectable()
export class JwtAuthGuard extends AuthGuard(StrategyConstant.jwt) {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.headers["authorization"]?.split(" ")[1] === "null")
      throw new AppError({
        code: ErrorCode.ACCESS_TOKEN_NOT_EXIST,
        message: "Access token not exist",
        errorType: "JwtAuthGuard",
        statusCode: HttpStatus.FORBIDDEN
      });
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw (
        err ||
        new AppError({
          code: ErrorCode.ACCESS_TOKEN_NOT_EXIST,
          message: "Access token not exist",
          errorType: "JwtAuthGuard",
          statusCode: HttpStatus.FORBIDDEN
        })
      );
    }
    return user;
  }
}
