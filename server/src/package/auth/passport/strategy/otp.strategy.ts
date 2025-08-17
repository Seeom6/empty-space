import { RedisService } from "@Infrastructure/cache";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { AppError } from "@Package/error";
import { ErrorCode } from "../../../../common/error/error-code";
import { StrategyConstant } from "@Package/auth";
import { EnvironmentService } from "@Infrastructure/config";
@Injectable()
export class OtpStrategy extends PassportStrategy(
  Strategy,
  StrategyConstant.otp,
) {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    environmentService: EnvironmentService,
  ) {
    const secretKey = environmentService.get('jwt.jwtAccessSecret');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const [otpData] = await Promise.all([
      this.redisService.get(`${payload.email}otp`),
    ]);
    if (!otpData)
      throw new AppError({
        code: ErrorCode.EXPIRED_OTP_TOKEN,
        message: "Expired OTP token",
        errorType: "OtpStrategy"
      });
    const redisPayload: any = this.jwtService.decode(`${otpData as string}`);
    return redisPayload;
  }
}
