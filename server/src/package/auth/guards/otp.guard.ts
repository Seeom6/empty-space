import {
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { StrategyConstant } from "../passport/strategy/strategy.constant";
import { AppError } from "@Package/error";
import { ErrorCode } from "../../../common/error/error-code";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "@Infrastructure/cache";
@Injectable()
export class OtpGuard extends AuthGuard(StrategyConstant.otp) {
  constructor(private readonly redisService: RedisService) {
    super();
  }
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.headers["authorization"]?.split(" ")[1] === "null"){
      throw new AppError({
        code: ErrorCode.OTP_TOKEN_NOT_EXIST,
        message: "OTP token not exist",
        errorType: "Otp Guard"
      });
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    
    console.log("🚀 ~ OtpGuard ~ handleRequest ~ user:", user, err);
    if (err || !user) {
      throw (
        err ||
        new AppError({
          code: ErrorCode.OTP_TOKEN_NOT_EXIST,
          message: "OTP token not exist",
          errorType: "Otp Guard"
        })
      );
    }
    return user;
  }
}
