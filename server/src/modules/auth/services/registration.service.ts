import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'mongoose';
import { SessionService, RegistrationStep } from './session.service';
import { OtpService } from './otp.service';
import { AccountService } from '@Modules/account/account/services';
import { InviteCodeAdminService } from '@Modules/invite-code/services/invite-code.admin.service';
import { HashService } from '@Package/auth';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';
import { EnvironmentService } from '@Infrastructure/config';
import { RedisService } from '@Infrastructure/cache/redis/redis.service';
import { AccountRole } from '@Modules/account/account/types/role.enum';
import { InviteCodeStatus } from '@Modules/invite-code/types';
import { PhoneValidationService } from '@Package/utilities/phone-validation.service';


export interface InviteCodeValidationResult {
  sessionToken: string;
  position: any;
  privileges: any[];
}

export interface EmailRegistrationResult {
  otpToken: string;
}

export interface OTPVerificationResult {
  registrationToken: string;
}

export interface RegistrationCompletionResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    accountRole: string;
    isVerified: boolean;
    employee: {
      position: any;
      department: any;
      privileges: any[];
      hireDate: Date;
    };
  };
}

@Injectable()
export class RegistrationService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly otpService: OtpService,
    private readonly accountService: AccountService,
    private readonly inviteCodeService: InviteCodeAdminService,
    private readonly jwtService: JwtService,
    private readonly environmentService: EnvironmentService,
    private readonly phoneValidationService: PhoneValidationService,
    private readonly redisService: RedisService,

    @InjectConnection() private readonly connection: Connection
  ) {}

  async validateInviteCode(
    inviteCode: string,
    ipAddress: string,
    userAgent: string
  ): Promise<InviteCodeValidationResult> {
    console.log(`[SERVICE] validateInviteCode called with inviteCode: ${inviteCode}`);

    // Validate invite code format
    const inviteCodeRegex = /^\$INV-\d{4}-[A-Za-z0-9]{6}$/;
    if (!inviteCodeRegex.test(inviteCode)) {
      throw new AppError({
        code: ErrorCode.INVITE_CODE_NOT_FOUND,
        message: 'Invalid invite code format',
        errorType: 'VALIDATION_ERROR'
      });
    }

    // Check if invite code exists and is valid
    const inviteCodeDetails = await this.inviteCodeService.checkInviteCodeForRegister(inviteCode);

    if (!inviteCodeDetails) {
      throw new AppError({
        code: ErrorCode.INVITE_CODE_NOT_FOUND,
        message: 'Invite code not found',
        errorType: 'INVITE_CODE_NOT_FOUND'
      });
    }

    if (inviteCodeDetails.status !== InviteCodeStatus.Active) {
      if (inviteCodeDetails.status === InviteCodeStatus.USED) {
        throw new AppError({
          code: ErrorCode.INVITE_CODE_USED,
          message: 'Invite code has already been used',
          errorType: 'INVITE_CODE_USED'
        });
      } else {
        throw new AppError({
          code: ErrorCode.INVITE_CODE_NOT_FOUND,
          message: 'Invite code is not active',
          errorType: 'INVITE_CODE_NOT_FOUND'
        });
      }
    }

    console.log(`[SERVICE] Creating session for inviteCode: ${inviteCode}`);

    // Create session
    const { sessionId } = await this.sessionService.createSession(
      inviteCode,
      inviteCodeDetails,
      ipAddress,
      userAgent
    );
    console.log(`[SERVICE] Session created with ID: ${sessionId}`);

    // Generate session token
    const sessionToken = this.jwtService.sign(
      {
        sessionId,
        inviteCode,
        step: RegistrationStep.INVITE_VALIDATED,
        type: 'session'
      },
      {
        secret: this.environmentService.get('jwt.jwtAccessSecret'),
        expiresIn: '15m'
      }
    );

    return {
      sessionToken,
      position: inviteCodeDetails.position,
      privileges: inviteCodeDetails.privilege || []
    };
  }

  async registerEmail(
    sessionToken: string,
    email: string,
    firstName: string,
    lastName: string
  ): Promise<EmailRegistrationResult> {
    // Validate and decode session token
    let tokenPayload: any;
    try {
      tokenPayload = this.jwtService.verify(sessionToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });
    } catch (error) {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid or expired session token',
        errorType: 'INVALID_SESSION_TOKEN'
      });
    }

    if (tokenPayload.type !== 'session' || tokenPayload.step !== RegistrationStep.INVITE_VALIDATED) {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid session token step',
        errorType: 'INVALID_SESSION_TOKEN'
      });
    }

    // Validate session exists
    const session = await this.sessionService.getSession(tokenPayload.sessionId);
    if (!session) {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Session not found or expired',
        errorType: 'INVALID_SESSION_TOKEN'
      });
    }

    // Check email uniqueness
    const existingAccount = await this.accountService.findByEmail(email, false);
    if (existingAccount) {
      throw new AppError({
        code: ErrorCode.DUPLICATED_EMAIL,
        message: 'Email address already registered',
        errorType: 'DUPLICATED_EMAIL'
      });
    }

    // Update session with email data
    await this.sessionService.updateSession(tokenPayload.sessionId, {
      email,
      firstName,
      lastName,
      step: RegistrationStep.EMAIL_REGISTERED
    });

    // Generate and send OTP
    await this.otpService.generateAndSendOTP(email, 'registration', { firstName, lastName });

    // Generate OTP token
    const otpToken = this.jwtService.sign(
      {
        sessionId: tokenPayload.sessionId,
        email,
        type: 'otp'
      },
      {
        secret: this.environmentService.get('jwt.jwtAccessSecret'),
        expiresIn: '10m'
      }
    );

    return { otpToken };
  }

  async verifyRegistrationOTP(
    otpToken: string,
    otp: string
  ): Promise<OTPVerificationResult> {
    // Validate and decode OTP token
    let tokenPayload: any;
    try {
      tokenPayload = this.jwtService.verify(otpToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });
    } catch (error) {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid or expired OTP token',
        errorType: 'INVALID_TOKEN'
      });
    }

    if (tokenPayload.type !== 'otp') {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid OTP token type',
        errorType: 'INVALID_TOKEN'
      });
    }

    // Validate session exists
    const session = await this.sessionService.getSession(tokenPayload.sessionId);
    if (!session || session.step !== RegistrationStep.EMAIL_REGISTERED) {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid session state for OTP verification',
        errorType: 'INVALID_SESSION_TOKEN'
      });
    }

    // Verify OTP
    await this.otpService.verifyOTP(tokenPayload.email, otp, 'registration');

    // Update session step
    await this.sessionService.updateSession(tokenPayload.sessionId, {
      step: RegistrationStep.OTP_VERIFIED
    });

    // Generate registration completion token
    const registrationToken = this.jwtService.sign(
      {
        sessionId: tokenPayload.sessionId,
        email: tokenPayload.email,
        type: 'registration'
      },
      {
        secret: this.environmentService.get('jwt.jwtAccessSecret'),
        expiresIn: '15m'
      }
    );

    return { registrationToken };
  }

  async completeRegistration(
    registrationToken: string,
    password: string,
    phoneNumber?: string
  ): Promise<RegistrationCompletionResult> {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[REGISTRATION_SERVICE] [${requestId}] === STARTING REGISTRATION COMPLETION ===`);
    console.log(`[REGISTRATION_SERVICE] [${requestId}] Registration token: ${registrationToken.substring(0, 50)}...`);
    console.log(`[REGISTRATION_SERVICE] [${requestId}] Phone number: ${phoneNumber}`);

    // Validate and decode registration token
    let tokenPayload: any;

    try {
      tokenPayload = this.jwtService.verify(registrationToken, {
        secret: this.environmentService.get('jwt.jwtAccessSecret')
      });
    } catch (error) {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid or expired registration token',
        errorType: 'INVALID_TOKEN'
      });
    }

    if (tokenPayload.type !== 'registration') {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid registration token type',
        errorType: 'INVALID_TOKEN'
      });
    }

    // Validate session exists and is in correct step
    const session = await this.sessionService.getSession(tokenPayload.sessionId);
    if (!session || session.step !== RegistrationStep.OTP_VERIFIED) {
      throw new AppError({
        code: ErrorCode.INVALID_TOKEN,
        message: 'Invalid session state for registration completion',
        errorType: 'INVALID_SESSION_TOKEN'
      });
    }

    // Validate and format phone number (if provided) BEFORE transaction
    let validatedPhoneNumber: string | undefined;
    if (phoneNumber) {
      console.log(`[REGISTRATION_SERVICE] [${requestId}] Validating phone number: ${phoneNumber}`);

      // Validate phone number format
      const phoneValidation = this.phoneValidationService.validatePhoneNumber(phoneNumber);
      if (!phoneValidation.isValid) {
        console.log(`[REGISTRATION_SERVICE] [${requestId}] Phone validation failed: ${phoneValidation.error}`);
        throw new AppError({
          code: ErrorCode.VALIDATION_ERROR,
          message: phoneValidation.error || 'Invalid phone number format',
          errorType: 'VALIDATION_ERROR'
        });
      }

      validatedPhoneNumber = phoneValidation.formatted;
      console.log(`[REGISTRATION_SERVICE] [${requestId}] Phone number validated and formatted: ${validatedPhoneNumber}`);
    }

    // REDIS LOCK: Prevent concurrent registration for same email
    const lockKey = `registration_lock:${session.email}`;
    const lockValue = requestId;
    const lockTTL = 30; // 30 seconds

    console.log(`[REGISTRATION_SERVICE] [${requestId}] LOCK: Attempting to acquire lock for ${session.email}`);

    // Try to acquire lock
    const lockAcquired = await this.redisService.setNX(lockKey, lockValue, lockTTL);
    if (!lockAcquired) {
      console.log(`[REGISTRATION_SERVICE] [${requestId}] LOCK: Failed to acquire lock - another request is processing`);

      // Wait a bit and check if account was created by other request
      await new Promise(resolve => setTimeout(resolve, 1000));

      const existingAccount = await this.accountService.findByEmail(session.email!, false);
      if (existingAccount) {
        console.log(`[REGISTRATION_SERVICE] [${requestId}] LOCK: Account was created by another request - checking data match`);

        const firstNameMatch = existingAccount.firstName === session.firstName;
        const lastNameMatch = existingAccount.lastName === session.lastName;
        const phoneMatch = !validatedPhoneNumber || existingAccount.phoneNumber === validatedPhoneNumber;

        if (firstNameMatch && lastNameMatch && phoneMatch) {
          console.log(`[REGISTRATION_SERVICE] [${requestId}] LOCK: Same data found - returning existing account as success`);

          // Generate access token for existing account
          const accessToken = this.jwtService.sign({
            sub: existingAccount._id.toString(),
            email: existingAccount.email,
            role: existingAccount.accountRole,
            isVerified: true,
            iat: Math.floor(Date.now() / 1000),
            iss: this.environmentService.get('jwt.issuer'),
            aud: this.environmentService.get('jwt.audience')
          });

          // Clean up session
          await this.sessionService.deleteSession(tokenPayload.sessionId);

          return {
            accessToken,
            user: {
              id: existingAccount._id.toString(),
              email: session.email!,
              firstName: session.firstName!,
              lastName: session.lastName!,
              accountRole: existingAccount.accountRole,
              isVerified: true,
              employee: {
                position: session.position,
                department: session.position?.department,
                privileges: session.privileges,
                hireDate: new Date()
              }
            }
          };
        }
      }

      // If we can't find matching account, throw error
      throw new AppError({
        code: ErrorCode.DUPLICATED_EMAIL,
        message: 'Email address already registered',
        errorType: 'DUPLICATED_EMAIL'
      });
    }

    console.log(`[REGISTRATION_SERVICE] [${requestId}] LOCK: Lock acquired successfully`);

    try {
      // IDEMPOTENCY CHECK: Check if account already exists with same data
      console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: Checking if account already exists`);
      const existingAccount = await this.accountService.findByEmail(session.email!, false);
      if (existingAccount) {
        console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: Account exists, checking data match`);
        console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: Existing: firstName="${existingAccount.firstName}", lastName="${existingAccount.lastName}", phone="${existingAccount.phoneNumber}"`);
        console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: Session: firstName="${session.firstName}", lastName="${session.lastName}", phone="${validatedPhoneNumber}"`);

        const firstNameMatch = existingAccount.firstName === session.firstName;
        const lastNameMatch = existingAccount.lastName === session.lastName;
        const phoneMatch = !validatedPhoneNumber || existingAccount.phoneNumber === validatedPhoneNumber;

        console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: firstName match: ${firstNameMatch}, lastName match: ${lastNameMatch}, phone match: ${phoneMatch}`);

        if (firstNameMatch && lastNameMatch && phoneMatch) {
          console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: Same data found - returning existing account as success`);

          // Generate access token for existing account
          const accessToken = this.jwtService.sign({
            sub: existingAccount._id.toString(),
            email: existingAccount.email,
            role: existingAccount.accountRole,
            isVerified: true,
            iat: Math.floor(Date.now() / 1000),
            iss: this.environmentService.get('jwt.issuer'),
            aud: this.environmentService.get('jwt.audience')
          });

          // Clean up session
          await this.sessionService.deleteSession(tokenPayload.sessionId);

          return {
            accessToken,
            user: {
              id: existingAccount._id.toString(),
              email: session.email!,
              firstName: session.firstName!,
              lastName: session.lastName!,
              accountRole: existingAccount.accountRole,
              isVerified: true,
              employee: {
                position: session.position,
                department: session.position?.department,
                privileges: session.privileges,
                hireDate: new Date()
              }
            }
          };
        } else {
          console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: Different data found - proceeding with error`);
          throw new AppError({
            code: ErrorCode.DUPLICATED_EMAIL,
            message: 'Email address already registered',
            errorType: 'DUPLICATED_EMAIL'
          });
        }
      } else {
        console.log(`[REGISTRATION_SERVICE] [${requestId}] IDEMPOTENCY: No existing account found - proceeding with creation`);
      }

    // Create idempotency key to prevent double registration
    const idempotencyKey = `registration:${session.email}:${session.sessionId}`;

    // Start database transaction
    const mongoSession = await this.connection.startSession();

    try {
      return await mongoSession.withTransaction(async () => {
        // Hash password
        const hashedPassword = await HashService.hashPassword(password);

        // Create basic account first
        console.log(`[REGISTRATION_SERVICE] STEP 2: Creating account with email: ${session.email}, phone: ${validatedPhoneNumber}`);
        let account;
        try {
          account = await this.accountService.createAccount({
            email: session.email!, // Required email field
            password: hashedPassword,
            phoneNumber: validatedPhoneNumber, // Validated and formatted phone number
            accountRole: AccountRole.EMPLOYEE,
            firstName: session.firstName!,
            lastName: session.lastName!
          } as any, { session: mongoSession });
          console.log(`[REGISTRATION_SERVICE] STEP 2: Account created successfully with ID: ${account._id}`);
        } catch (error: any) {
          // Handle MongoDB duplicate key errors as a fallback
          console.log(`[REGISTRATION_SERVICE] [${requestId}] Caught error in transaction:`, error);
          console.log(`[REGISTRATION_SERVICE] [${requestId}] Error code:`, error.code);
          console.log(`[REGISTRATION_SERVICE] [${requestId}] Error message:`, error.message);

          if (error.code === 11000) {
            console.log(`[REGISTRATION_SERVICE] [${requestId}] MongoDB duplicate key error caught: ${error.message}`);

            // This means the account was created by another concurrent request
            // Let's check if the account exists with the same data (idempotency check)
            const existingAccount = await this.accountService.findByEmail(session.email!, false);
            if (existingAccount) {
              console.log(`[REGISTRATION_SERVICE] [${requestId}] Account already exists, checking for idempotency`);

              // Check if this is the same registration (idempotency check)
              if (existingAccount.firstName === session.firstName &&
                  existingAccount.lastName === session.lastName &&
                  (!validatedPhoneNumber || existingAccount.phoneNumber === validatedPhoneNumber)) {
                console.log(`[REGISTRATION_SERVICE] [${requestId}] Found existing account with same data - treating as successful registration (idempotency)`);
                account = existingAccount;
              } else {
                console.log(`[REGISTRATION_SERVICE] [${requestId}] Found existing account with different data - throwing error`);
                throw new AppError({
                  code: ErrorCode.DUPLICATED_EMAIL,
                  message: 'Email address already registered',
                  errorType: 'DUPLICATED_EMAIL'
                });
              }
            } else {
              // If we can't find the account, throw the original error
              console.log(`[REGISTRATION_SERVICE] [${requestId}] Could not find existing account after duplicate key error`);
              if (error.message.includes('email')) {
                throw new AppError({
                  code: ErrorCode.DUPLICATED_EMAIL,
                  message: 'Email address already registered',
                  errorType: 'DUPLICATED_EMAIL'
                });
              } else if (error.message.includes('phoneNumber')) {
                throw new AppError({
                  code: ErrorCode.DUPLICATED_PHONE_NUMBER,
                  message: 'Phone number already registered',
                  errorType: 'DUPLICATED_PHONE_NUMBER'
                });
              } else {
                throw new AppError({
                  code: ErrorCode.DUPLICATED_EMAIL,
                  message: 'Account with this information already exists',
                  errorType: 'DUPLICATED_EMAIL'
                });
              }
            }
          } else {
            // Re-throw other errors
            throw error;
          }
        }

        // For now, we'll return the basic account and note that in a production system,
        // you would want to extend the AccountService to properly handle employee creation
        // with all the required fields including email, employee data, etc.

        // Mark invite code as used
        console.log(`[REGISTRATION_SERVICE] [${requestId}] STEP 3: Marking invite code as used: ${session.inviteCode}`);
        await this.inviteCodeService.updateInviteCode({
          code: session.inviteCode,
          status: InviteCodeStatus.USED
        });
        console.log(`[REGISTRATION_SERVICE] [${requestId}] STEP 3: Invite code marked as used successfully`);

        // Generate access token
        console.log(`[REGISTRATION_SERVICE] [${requestId}] STEP 4: Generating access token for account: ${account._id}`);
        const accessToken = this.jwtService.sign({
          sub: account._id.toString(),
          email: account.email,
          role: account.accountRole,
          isVerified: true,
          iat: Math.floor(Date.now() / 1000),
          iss: this.environmentService.get('jwt.issuer'),
          aud: this.environmentService.get('jwt.audience')
        });
        console.log(`[REGISTRATION_SERVICE] [${requestId}] STEP 4: Access token generated successfully`);

        // Clean up session
        console.log(`[REGISTRATION_SERVICE] [${requestId}] STEP 5: Cleaning up session: ${tokenPayload.sessionId}`);
        await this.sessionService.deleteSession(tokenPayload.sessionId);
        console.log(`[REGISTRATION_SERVICE] [${requestId}] STEP 5: Session cleaned up successfully`);

        console.log(`[REGISTRATION_SERVICE] [${requestId}] STEP 6: Registration completed successfully, returning result`);
        return {
          accessToken,
          user: {
            id: account._id.toString(),
            email: session.email!,
            firstName: session.firstName!,
            lastName: session.lastName!,
            accountRole: account.accountRole,
            isVerified: true,
            employee: {
              position: session.position,
              department: session.position?.department,
              privileges: session.privileges,
              hireDate: new Date()
            }
          }
        };
      });
    } finally {
      await mongoSession.endSession();
    }

    } catch (error) {
      // Release Redis lock on error
      console.log(`[REGISTRATION_SERVICE] [${requestId}] LOCK: Releasing lock due to error for ${session.email}`);
      await this.redisService.del([lockKey]);
      throw error;
    } finally {
      // Release Redis lock on success
      console.log(`[REGISTRATION_SERVICE] [${requestId}] LOCK: Releasing lock for ${session.email}`);
      await this.redisService.del([lockKey]);
    }
  }
}
