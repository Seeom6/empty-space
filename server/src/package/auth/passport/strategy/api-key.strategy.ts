import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { StrategyConstant } from "./strategy.constant";
import { RedisService } from "@Infrastructure/cache";
import { JwtService } from "@nestjs/jwt";
import { EnvironmentService } from "@Infrastructure/config";
import { CustomHeaders } from "@Package/auth/types";


export class APIKeyStrategy extends PassportStrategy(
    Strategy,
    StrategyConstant.apiKey,
) {
    constructor(
        private readonly redisService: RedisService,
        private readonly jwtService: JwtService,
        private readonly environmentService: EnvironmentService,
    ) {
        const secretKey = environmentService.get('jwt.jwtAccessSecret');
        super({
            jwtFromRequest: ExtractJwt.fromHeader(CustomHeaders.AppAPIKey),
            ignoreExpiration: true,
            secretOrKey: secretKey,
            passReqToCallback: true,
        })
    }
    validate(...args: any[]): unknown {
        throw new Error("Method not implemented.");
    }

}