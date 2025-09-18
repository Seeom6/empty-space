import { Body, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegistrationService } from '../../services/registration.service';
import { WebController } from '@Package/api';
import { 
  InviteCodeDto, 
  InviteCodeValidation,
  EmailRegistrationDto,
  EmailRegistrationValidation,
  OTPVerificationDto,
  OTPVerificationValidation,
  RegistrationCompletionDto,
  RegistrationCompletionValidation
} from '../dto/validation/registration.schemas';
import { RateLimitInterceptor } from '../interceptors/rate-limit.interceptor';
import { SessionTokenGuard } from '@Package/auth/guards/session-token.guard';
import { OTPTokenGuard } from '@Package/auth/guards/otp-token.guard';
import { RegistrationTokenGuard } from '@Package/auth/guards/registration-token.guard';
import { SessionToken } from '@Package/auth/decorators/session-token.decorator';
import { OTPToken } from '@Package/auth/decorators/otp-token.decorator';
import { RegistrationToken } from '@Package/auth/decorators/registration-token.decorator';
import { ProgressiveRateLimitService } from '@Package/auth/services/progressive-rate-limit.service';
import { AccountSecurityService } from '@Package/auth/services/account-security.service';
import { SecureCookieService } from '@Package/auth/services/secure-cookie.service';
import { v4 as uuidv4 } from 'uuid';

@WebController({
  prefix: 'auth'
})
export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly rateLimitService: ProgressiveRateLimitService,
    private readonly accountSecurityService: AccountSecurityService,
    private readonly secureCookieService: SecureCookieService
  ) {}

  @Post('validate-invite-code')
  // @UseInterceptors(RateLimitInterceptor('invite_code_validation'))
  async validateInviteCode(
    @Body(InviteCodeValidation) body: InviteCodeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const requestId = uuidv4();
    console.log(`[CONTROLLER-${requestId}] validateInviteCode called with inviteCode: ${body.inviteCode}`);
    console.log(`[CONTROLLER-${requestId}] Request headers:`, JSON.stringify(req.headers, null, 2));
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    console.log(`[CONTROLLER-${requestId}] Calling registrationService.validateInviteCode`);
    const result = await this.registrationService.validateInviteCode(
      body.inviteCode,
      ipAddress,
      userAgent
    );

    console.log(`[CONTROLLER-${requestId}] Session token received: ${result.sessionToken}`);
    console.log(`[CONTROLLER-${requestId}] Session token length: ${result.sessionToken.length}`);
    console.log(`[CONTROLLER-${requestId}] About to set session token as cookie`);

    // Set session token as HTTP-only cookie
    res.cookie('sessionToken', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    console.log(`[CONTROLLER-${requestId}] Session token set as cookie successfully`);
    console.log(`[CONTROLLER-${requestId}] Cookie options:`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    return {
      data: {
        position: result.position,
        privileges: result.privileges
      },
      message: 'Invite code validated successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }

  @Post('register-email')
  @UseGuards(SessionTokenGuard)
  @UseInterceptors(RateLimitInterceptor('email_registration'))
  async registerEmail(
    @Body(EmailRegistrationValidation) body: EmailRegistrationDto,
    @SessionToken() sessionToken: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request
  ) {
    const requestId = uuidv4();
    console.log(`[REGISTER-EMAIL-${requestId}] Starting email registration`);
    console.log(`[REGISTER-EMAIL-${requestId}] Session token received: ${sessionToken}`);
    console.log(`[REGISTER-EMAIL-${requestId}] Session token length: ${sessionToken?.length || 'undefined'}`);
    console.log(`[REGISTER-EMAIL-${requestId}] Request cookies:`, req.cookies);
    console.log(`[REGISTER-EMAIL-${requestId}] Email: ${body.email}`);

    const result = await this.registrationService.registerEmail(
      sessionToken,
      body.email,
      body.firstName,
      body.lastName
    );

    console.log(`[REGISTER-EMAIL-${requestId}] Registration service completed successfully`);

    // Set OTP token as HTTP-only cookie
    res.cookie('otpToken', result.otpToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/'
    });

    // Clear session token
    res.clearCookie('sessionToken');

    return {
      data: {},
      message: 'OTP sent to email address',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }

  @Post('verify-registration-otp')
  @UseGuards(OTPTokenGuard)
  @UseInterceptors(RateLimitInterceptor('otp_verification'))
  async verifyRegistrationOTP(
    @Body(OTPVerificationValidation) body: OTPVerificationDto,
    @OTPToken() otpToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.registrationService.verifyRegistrationOTP(
      otpToken,
      body.otp
    );

    // Set registration token as HTTP-only cookie
    res.cookie('registrationToken', result.registrationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    // Clear OTP token
    res.clearCookie('otpToken');

    return {
      data: {},
      message: 'OTP verified successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }

  @Post('complete-registration')
  @UseGuards(RegistrationTokenGuard)
  @UseInterceptors(RateLimitInterceptor('registration_completion'))
  async completeRegistration(
    @Body(RegistrationCompletionValidation) body: RegistrationCompletionDto,
    @RegistrationToken() registrationToken: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.registrationService.completeRegistration(
      registrationToken,
      body.password,
      body.phoneNumber
    );

    // Set access token as HTTP-only cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes (access token)
      path: '/'
    });

    // Clear registration token
    res.clearCookie('registrationToken');

    return {
      data: {
        user: result.user
      },
      message: 'Registration completed successfully',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: uuidv4()
      }
    };
  }
}


