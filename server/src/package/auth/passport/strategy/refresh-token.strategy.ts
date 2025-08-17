import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { StrategyConstant} from "./strategy.constant";
import { IRefreshToken } from "../../../../package/auth/types/refresh-token.type";
import { EnvironmentService } from "@Infrastructure/config";
import { Injectable } from "@nestjs/common";
import { Request } from "express";
import { RedisKeys } from "../../../../common/cache/redis-key.constant";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, StrategyConstant.refresh_Token) {

  constructor(
    private readonly environmentService: EnvironmentService,
  ) {
    const secretKey = environmentService.get('jwt.jwtRefreshSecret');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors<Request>([
        (req: Request) => {
          return req?.cookies[RedisKeys.REFRESH_TOKEN]
        },
      ]) ,
      ignoreExpiration: false,
      secretOrKey: secretKey,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: IRefreshToken) {
    req[RedisKeys.REFRESH_TOKEN] = payload;
    return payload;
  }
}
