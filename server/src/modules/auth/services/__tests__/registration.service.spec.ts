import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Connection } from 'mongoose';
import { RegistrationService } from '../registration.service';
import { SessionService } from '../session.service';
import { OtpService } from '../otp.service';
import { AccountService } from '@Modules/account/account/services';
import { InviteCodeAdminService } from '@Modules/invite-code/services/invite-code.admin.service';
import { HashService } from '@Package/auth';
import { EnvironmentService } from '@Infrastructure/config';
import { AppError } from '@Package/error/app.error';
import { ErrorCode } from '@Common/error/error-code';
import { InviteCodeStatus } from '@Modules/invite-code/types';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let sessionService: jest.Mocked<SessionService>;
  let otpService: jest.Mocked<OtpService>;
  let accountService: jest.Mocked<AccountService>;
  let inviteCodeService: jest.Mocked<InviteCodeAdminService>;
  let jwtService: jest.Mocked<JwtService>;
  let environmentService: jest.Mocked<EnvironmentService>;
  let connection: jest.Mocked<Connection>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        {
          provide: SessionService,
          useValue: {
            createSession: jest.fn(),
            getSession: jest.fn(),
            updateSession: jest.fn(),
            deleteSession: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            generateAndSendOTP: jest.fn(),
            verifyOTP: jest.fn(),
          },
        },
        {
          provide: AccountService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: InviteCodeAdminService,
          useValue: {
            checkInviteCodeForRegister: jest.fn(),
            markInviteCodeAsUsed: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: 'DatabaseConnection',
          useValue: {
            startSession: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
    sessionService = module.get(SessionService);
    otpService = module.get(OtpService);
    accountService = module.get(AccountService);
    inviteCodeService = module.get(InviteCodeAdminService);
    jwtService = module.get(JwtService);
    environmentService = module.get(EnvironmentService);
    connection = module.get('DatabaseConnection');
  });

  describe('validateInviteCode', () => {
    const mockInviteCode = '$INV-2024-ABC123';
    const mockIpAddress = '192.168.1.1';
    const mockUserAgent = 'Mozilla/5.0';

    it('should successfully validate a valid invite code', async () => {
      // Arrange
      const mockInviteCodeDetails = {
        _id: 'invite-id',
        code: mockInviteCode,
        status: InviteCodeStatus.Active,
        position: { _id: 'position-id', name: 'Developer' },
        privilege: [{ _id: 'privilege-id', name: 'READ' }],
      };

      const mockSessionData = {
        sessionId: 'session-id',
        sessionData: {
          sessionId: 'session-id',
          inviteCode: mockInviteCode,
          position: mockInviteCodeDetails.position,
          privileges: mockInviteCodeDetails.privilege,
          step: 'invite_validated',
          createdAt: Date.now(),
          expiresAt: Date.now() + 900000,
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
        },
      };

      const mockSessionToken = 'mock-session-token';

      inviteCodeService.checkInviteCodeForRegister.mockResolvedValue(mockInviteCodeDetails);
      sessionService.createSession.mockResolvedValue(mockSessionData);
      jwtService.sign.mockReturnValue(mockSessionToken);

      // Act
      const result = await service.validateInviteCode(mockInviteCode, mockIpAddress, mockUserAgent);

      // Assert
      expect(result).toEqual({
        sessionToken: mockSessionToken,
        position: mockInviteCodeDetails.position,
        privileges: mockInviteCodeDetails.privilege,
      });

      expect(inviteCodeService.checkInviteCodeForRegister).toHaveBeenCalledWith(mockInviteCode);
      expect(sessionService.createSession).toHaveBeenCalledWith(mockInviteCode, mockIpAddress, mockUserAgent);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-id',
          type: 'session',
        }),
        expect.objectContaining({
          expiresIn: '15m',
        })
      );
    });

    it('should throw error for invalid invite code format', async () => {
      // Arrange
      const invalidInviteCode = 'INVALID-CODE';

      // Act & Assert
      await expect(
        service.validateInviteCode(invalidInviteCode, mockIpAddress, mockUserAgent)
      ).rejects.toThrow(AppError);

      expect(inviteCodeService.checkInviteCodeForRegister).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent invite code', async () => {
      // Arrange
      inviteCodeService.checkInviteCodeForRegister.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.validateInviteCode(mockInviteCode, mockIpAddress, mockUserAgent)
      ).rejects.toThrow(AppError);

      expect(inviteCodeService.checkInviteCodeForRegister).toHaveBeenCalledWith(mockInviteCode);
    });

    it('should throw error for used invite code', async () => {
      // Arrange
      const mockUsedInviteCode = {
        _id: 'invite-id',
        code: mockInviteCode,
        status: InviteCodeStatus.Used,
        position: { _id: 'position-id', name: 'Developer' },
        privilege: [],
      };

      inviteCodeService.checkInviteCodeForRegister.mockResolvedValue(mockUsedInviteCode);

      // Act & Assert
      await expect(
        service.validateInviteCode(mockInviteCode, mockIpAddress, mockUserAgent)
      ).rejects.toThrow(AppError);

      expect(inviteCodeService.checkInviteCodeForRegister).toHaveBeenCalledWith(mockInviteCode);
    });
  });

  describe('registerEmail', () => {
    const mockSessionToken = 'mock-session-token';
    const mockEmail = 'test@example.com';
    const mockFirstName = 'John';
    const mockLastName = 'Doe';

    it('should successfully register email and send OTP', async () => {
      // Arrange
      const mockSessionPayload = {
        sessionId: 'session-id',
        type: 'session',
      };

      const mockSessionData = {
        sessionId: 'session-id',
        inviteCode: '$INV-2024-ABC123',
        position: { _id: 'position-id', name: 'Developer' },
        privileges: [],
        step: 'invite_validated',
        createdAt: Date.now(),
        expiresAt: Date.now() + 900000,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockOtpToken = 'mock-otp-token';

      jwtService.verify.mockReturnValue(mockSessionPayload);
      sessionService.getSession.mockResolvedValue(mockSessionData);
      accountService.findByEmail.mockResolvedValue(null);
      otpService.generateAndSendOTP.mockResolvedValue(undefined);
      sessionService.updateSession.mockResolvedValue(undefined);
      jwtService.sign.mockReturnValue(mockOtpToken);

      // Act
      const result = await service.registerEmail(mockSessionToken, mockEmail, mockFirstName, mockLastName);

      // Assert
      expect(result).toEqual({
        otpToken: mockOtpToken,
      });

      expect(jwtService.verify).toHaveBeenCalledWith(mockSessionToken, expect.any(Object));
      expect(sessionService.getSession).toHaveBeenCalledWith('session-id');
      expect(accountService.findByEmail).toHaveBeenCalledWith(mockEmail, false);
      expect(otpService.generateAndSendOTP).toHaveBeenCalledWith(mockEmail, 'registration', {
        firstName: mockFirstName,
        lastName: mockLastName,
      });
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const mockSessionPayload = {
        sessionId: 'session-id',
        type: 'session',
      };

      const mockSessionData = {
        sessionId: 'session-id',
        inviteCode: '$INV-2024-ABC123',
        position: { _id: 'position-id', name: 'Developer' },
        privileges: [],
        step: 'invite_validated',
        createdAt: Date.now(),
        expiresAt: Date.now() + 900000,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockExistingAccount = {
        _id: 'account-id',
        email: mockEmail,
      };

      jwtService.verify.mockReturnValue(mockSessionPayload);
      sessionService.getSession.mockResolvedValue(mockSessionData);
      accountService.findByEmail.mockResolvedValue(mockExistingAccount);

      // Act & Assert
      await expect(
        service.registerEmail(mockSessionToken, mockEmail, mockFirstName, mockLastName)
      ).rejects.toThrow(AppError);

      expect(accountService.findByEmail).toHaveBeenCalledWith(mockEmail, false);
      expect(otpService.generateAndSendOTP).not.toHaveBeenCalled();
    });

    it('should throw error for invalid session token', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(
        service.registerEmail(mockSessionToken, mockEmail, mockFirstName, mockLastName)
      ).rejects.toThrow(AppError);

      expect(sessionService.getSession).not.toHaveBeenCalled();
    });
  });

  describe('verifyRegistrationOTP', () => {
    const mockOtpToken = 'mock-otp-token';
    const mockOtp = '123456';

    it('should successfully verify OTP and return registration token', async () => {
      // Arrange
      const mockOtpPayload = {
        email: 'test@example.com',
        sessionId: 'session-id',
        type: 'otp',
      };

      const mockSessionData = {
        sessionId: 'session-id',
        inviteCode: '$INV-2024-ABC123',
        position: { _id: 'position-id', name: 'Developer' },
        privileges: [],
        step: 'email_registered',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: Date.now(),
        expiresAt: Date.now() + 900000,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockRegistrationToken = 'mock-registration-token';

      jwtService.verify.mockReturnValue(mockOtpPayload);
      sessionService.getSession.mockResolvedValue(mockSessionData);
      otpService.verifyOTP.mockResolvedValue(undefined);
      sessionService.updateSession.mockResolvedValue(undefined);
      jwtService.sign.mockReturnValue(mockRegistrationToken);

      // Act
      const result = await service.verifyRegistrationOTP(mockOtpToken, mockOtp);

      // Assert
      expect(result).toEqual({
        registrationToken: mockRegistrationToken,
      });

      expect(jwtService.verify).toHaveBeenCalledWith(mockOtpToken, expect.any(Object));
      expect(sessionService.getSession).toHaveBeenCalledWith('session-id');
      expect(otpService.verifyOTP).toHaveBeenCalledWith('test@example.com', mockOtp, 'registration');
    });

    it('should throw error for invalid OTP', async () => {
      // Arrange
      const mockOtpPayload = {
        email: 'test@example.com',
        sessionId: 'session-id',
        type: 'otp',
      };

      const mockSessionData = {
        sessionId: 'session-id',
        inviteCode: '$INV-2024-ABC123',
        position: { _id: 'position-id', name: 'Developer' },
        privileges: [],
        step: 'email_registered',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: Date.now(),
        expiresAt: Date.now() + 900000,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      jwtService.verify.mockReturnValue(mockOtpPayload);
      sessionService.getSession.mockResolvedValue(mockSessionData);
      otpService.verifyOTP.mockRejectedValue(new AppError({
        code: ErrorCode.INVALID_OTP,
        message: 'Invalid OTP',
        errorType: 'INVALID_OTP'
      }));

      // Act & Assert
      await expect(
        service.verifyRegistrationOTP(mockOtpToken, mockOtp)
      ).rejects.toThrow(AppError);

      expect(otpService.verifyOTP).toHaveBeenCalledWith('test@example.com', mockOtp, 'registration');
    });
  });
});
