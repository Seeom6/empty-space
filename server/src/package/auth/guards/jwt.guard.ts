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
import { Request } from "express"
@Injectable()
export class JwtAuthGuard extends AuthGuard(StrategyConstant.jwt) {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.cookies["accessToken"] === "null")
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
