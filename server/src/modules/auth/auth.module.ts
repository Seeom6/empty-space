import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController, AuthControllerWithToken, RefreshController } from './api/controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard, JWTModule } from '@Package/auth/jwt';
import { JwtStrategy } from '@Package/auth/passport/strategy/jwt.strategy';
import { AuthError } from "@Modules/auth/services/auth.error";
import { MailService } from "@Package/services";
import { AuthAdminService } from './services/auth.admin.service';
import { AuthAdminController, AuthAdminControllerWithToken } from './api/controllers/auth.admin.controller';
import { RefreshTokenGuard } from "@Package/auth/guards";
import { RefreshTokenStrategy } from "@Package/auth/passport/strategy/refresh-token.strategy";
import { StrategyConstant } from "@Package/auth";
import { RedisModule } from "@Infrastructure/cache";
import { AccountModule } from '@Modules/account/account/account.module';
import { RegisterEmployeeValidator, sendOtpValidation } from './api/dto/request';
import { InviteCodeModule } from '@Modules/invite-code/invite-code.module';
import { QueueModule } from '@Infrastructure/queue';
import { RegistrationController } from './api/controllers/registration.controller';
import { PasswordResetController } from './api/controllers/password-reset.controller';
import { RegistrationService } from './services/registration.service';
import { PasswordResetService } from './services/password-reset.service';
import { SessionService } from './services/session.service';
import { OtpService } from './services/otp.service';
import { SessionTokenGuard } from '@Package/auth/guards/session-token.guard';
import { OTPTokenGuard } from '@Package/auth/guards/otp-token.guard';
import { RegistrationTokenGuard } from '@Package/auth/guards/registration-token.guard';
import { EnhancedValidationGuard } from '@Package/auth/guards/enhanced-validation.guard';
import { ProgressiveRateLimitService } from '@Package/auth/services/progressive-rate-limit.service';
import { CSRFProtectionMiddleware } from '@Package/auth/middleware/csrf-protection.middleware';
import { SecureCookieService } from '@Package/auth/services/secure-cookie.service';
import { EmailTemplateService } from '@Package/auth/services/email-template.service';
import { EnvironmentValidationService } from '@Package/auth/services/environment-validation.service';
import { TokenBlacklistService } from '@Package/auth/services/token-blacklist.service';
import { SecurityEventLoggingService } from '@Package/auth/services/security-event-logging.service';
import { AuthenticationMetricsService } from '@Package/auth/services/authentication-metrics.service';
import { AccountSecurityService } from '@Package/auth/services/account-security.service';
import { PhoneValidationService } from '@Package/utilities/phone-validation.service';
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
    RefreshController,
    AuthAdminControllerWithToken,
    RegistrationController,
    PasswordResetController
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
    RegisterEmployeeValidator,
    sendOtpValidation,
    RegistrationService,
    PasswordResetService,
    SessionService,
    OtpService,
    SessionTokenGuard,
    OTPTokenGuard,
    RegistrationTokenGuard,
    EnhancedValidationGuard,
    ProgressiveRateLimitService,
    CSRFProtectionMiddleware,
    SecureCookieService,
    EmailTemplateService,
    EnvironmentValidationService,
    TokenBlacklistService,
    SecurityEventLoggingService,
    AuthenticationMetricsService,
    AccountSecurityService,
    PhoneValidationService
  ],
  exports: [
    JwtStrategy,
    PassportModule,
    AuthService,
    RegistrationService,
    PasswordResetService,
    SessionService,
    OtpService,
    ProgressiveRateLimitService,
    SecureCookieService,
    EmailTemplateService,
    EnvironmentValidationService,
    TokenBlacklistService,
    SecurityEventLoggingService,
    AuthenticationMetricsService,
    AccountSecurityService,
    PhoneValidationService
  ]
})
export class AuthModule {}
