import {AuthGuard} from "@nestjs/passport";
import {StrategyConstant} from "../passport/strategy/strategy.constant";
import {ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {RedisService} from "@Infrastructure/cache";
import {Observable} from "rxjs";
import {TokenExpiredError} from "@nestjs/jwt";
import {ErrorFactory} from "@Package/error";
import {ErrorCode} from "../../../common/error/error-code";
import {AuthErrorMessage} from "@Package/auth/error/message.error";


@Injectable()
export class RefreshTokenGuard extends AuthGuard(StrategyConstant.refresh_Token) {
  constructor(
    private readonly redisService: RedisService
  ) {
    super();
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if(info instanceof TokenExpiredError) {
      throw ErrorFactory.createError({
        code: ErrorCode.EXPIRED_ACCESS_TOKEN,
        message: AuthErrorMessage[ErrorCode.EXPIRED_ACCESS_TOKEN],
        errorType: "Auth Error",
      })
    }
    if (err || !user) {
      throw ErrorFactory.createError({
        code: ErrorCode.INVALID_RESET_TOKEN,
        message: AuthErrorMessage[ErrorCode.INVALID_TOKEN],
        errorType: "Auth Error",
      })
    }
    return user;
  }
}