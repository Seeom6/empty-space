import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController, AuthControllerWithToken, RefreshController } from './api/controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard, JWTModule } from '@Package/auth/jwt';
import { JwtStrategy } from '@Package/auth/passport/strategy/jwt.strategy';
import { AuthError } from "@Modules/auth/services/auth.error";
import { MailService } from "@Package/services";
import { AuthAdminService } from './services/auth.admin.service';
import { AuthAdminController } from './api/controllers/auth.admin.controller';
import { RefreshTokenGuard } from "@Package/auth/guards";
import { RefreshTokenStrategy } from "@Package/auth/passport/strategy/refresh-token.strategy";
import { StrategyConstant } from "@Package/auth";
import { RedisModule } from "@Infrastructure/cache";
import { AccountModule } from '@Modules/account/account/account.module';
import { RegisterEmployeeValidator } from './api/dto/request';
import { InviteCodeModule } from '@Modules/invite-code/invite-code.module';
import { QueueModule } from '@Infrastructure/queue';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: [StrategyConstant.refresh_Token, StrategyConstant.jwt, ] }),
    JWTModule,
    AccountModule,
    RedisModule ,
    InviteCodeModule,
    QueueModule
  ],
  controllers: [
    AuthController,
    AuthControllerWithToken,
    AuthAdminController,
    RefreshController
  ],
  providers: [
    AuthService,
    AuthAdminService,
    AuthError,
    JwtStrategy,
    MailService,
    JwtAuthGuard,
    RefreshTokenGuard,
    RefreshTokenStrategy,
    RegisterEmployeeValidator
  ],
  exports: [JwtStrategy, PassportModule]
})
export class AuthModule {}
