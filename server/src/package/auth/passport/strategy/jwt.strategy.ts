import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";

import { Request } from "express";
import { JwtService } from "@nestjs/jwt";
import { StrategyConstant } from "./strategy.constant";
import { RedisService } from "@Infrastructure/cache";
import { EnvironmentService } from "@Infrastructure/config";
import { AppError } from "@Package/error";
import { ErrorCode } from "@Common/error";
@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  StrategyConstant.jwt,
) {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,

  ) {
    const secretKey = environmentService.get('jwt.jwtAccessSecret');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies["accessToken"]
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secretKey,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const [authToken, privileges] = await Promise.all([
      this.redisService.get(`${payload.accountId}`),
      this.redisService.get(`${payload.accountId}privileges`),
    ]);
    if(!payload){
           throw new AppError({
        code: ErrorCode.EXPIRED_ACCESS_TOKEN,
        message: "Expired access token",
        errorType: "JwtStrategy"
      });
    }
    // if (!authToken || !privileges)
    //   throw new AppError({
    //     code: ErrorCode.EXPIRED_ACCESS_TOKEN,
    //     message: "Expired access token",
    //     errorType: "JwtStrategy"
    //   });
    return { ...payload, privileges };
  }
}
