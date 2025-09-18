import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth.module';
import { RedisService } from '@Infrastructure/cache';
import { EnvironmentService } from '@Infrastructure/config';
import { AccountModule } from '@Modules/account/account.module';
import { InviteCodeModule } from '@Modules/invite-code/invite-code.module';

describe('Authentication Integration Tests', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let environmentService: EnvironmentService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(process.env.TEST_DATABASE_URI || 'mongodb://localhost:27017/test'),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '15m' },
        }),
        AuthModule,
        AccountModule,
        InviteCodeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisService = moduleFixture.get<RedisService>(RedisService);
    environmentService = moduleFixture.get<EnvironmentService>(EnvironmentService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear Redis cache before each test
    await redisService.flushall();
  });

  describe('Multi-Step Registration Flow', () => {
    const testInviteCode = '$INV-2024-TEST01';
    const testEmail = 'test@example.com';
    const testFirstName = 'John';
    const testLastName = 'Doe';
    const testPassword = 'SecurePassword123!';
    const testPhoneNumber = '+1234567890';

    let sessionToken: string;
    let otpToken: string;
    let registrationToken: string;

    beforeEach(async () => {
      // Create a test invite code in the database
      // This would typically be done through a setup script or fixture
    });

    it('should complete the full registration flow', async () => {
      // Step 1: Validate invite code
      const step1Response = await request(app.getHttpServer())
        .post('/auth/validate-invite-code')
        .send({ inviteCode: testInviteCode })
        .expect(200);

      expect(step1Response.body.data).toHaveProperty('position');
      expect(step1Response.body.data).toHaveProperty('privileges');

      // Extract session token from cookie
      const sessionCookie = step1Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('sessionToken='));
      expect(sessionCookie).toBeDefined();

      // Step 2: Register email
      const step2Response = await request(app.getHttpServer())
        .post('/auth/register-email')
        .set('Cookie', sessionCookie)
        .send({
          email: testEmail,
          firstName: testFirstName,
          lastName: testLastName,
        })
        .expect(200);

      expect(step2Response.body.message).toContain('verification code');

      // Extract OTP token from cookie
      const otpCookie = step2Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('otpToken='));
      expect(otpCookie).toBeDefined();

      // Step 3: Verify OTP (we'll mock the OTP for testing)
      const mockOtp = '123456';
      await redisService.set(`otp:registration:${testEmail}`, JSON.stringify({
        otp: mockOtp,
        email: testEmail,
        type: 'registration',
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + (10 * 60 * 1000)
      }), 600);

      const step3Response = await request(app.getHttpServer())
        .post('/auth/verify-registration-otp')
        .set('Cookie', otpCookie)
        .send({ otp: mockOtp })
        .expect(200);

      expect(step3Response.body.message).toContain('verified successfully');

      // Extract registration token from cookie
      const registrationCookie = step3Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('registrationToken='));
      expect(registrationCookie).toBeDefined();

      // Step 4: Complete registration
      const step4Response = await request(app.getHttpServer())
        .post('/auth/complete-registration')
        .set('Cookie', registrationCookie)
        .send({
          password: testPassword,
          phoneNumber: testPhoneNumber,
        })
        .expect(200);

      expect(step4Response.body.data).toHaveProperty('accessToken');
      expect(step4Response.body.data.user).toHaveProperty('email', testEmail);
      expect(step4Response.body.data.user).toHaveProperty('firstName', testFirstName);
      expect(step4Response.body.data.user).toHaveProperty('lastName', testLastName);

      // Extract access token from cookie
      const accessCookie = step4Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('accessToken='));
      expect(accessCookie).toBeDefined();
    });

    it('should fail with invalid invite code', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/validate-invite-code')
        .send({ inviteCode: 'INVALID-CODE' })
        .expect(400);

      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error.message).toContain('Invalid invite code');
    });

    it('should fail with already registered email', async () => {
      // First, complete a registration
      // Then try to register the same email again
      
      const step1Response = await request(app.getHttpServer())
        .post('/auth/validate-invite-code')
        .send({ inviteCode: testInviteCode })
        .expect(200);

      const sessionCookie = step1Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('sessionToken='));

      const response = await request(app.getHttpServer())
        .post('/auth/register-email')
        .set('Cookie', sessionCookie)
        .send({
          email: 'existing@example.com', // Assume this email already exists
          firstName: testFirstName,
          lastName: testLastName,
        })
        .expect(400);

      expect(response.body.error.message).toContain('already registered');
    });

    it('should fail with invalid OTP', async () => {
      // Complete steps 1 and 2
      const step1Response = await request(app.getHttpServer())
        .post('/auth/validate-invite-code')
        .send({ inviteCode: testInviteCode })
        .expect(200);

      const sessionCookie = step1Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('sessionToken='));

      const step2Response = await request(app.getHttpServer())
        .post('/auth/register-email')
        .set('Cookie', sessionCookie)
        .send({
          email: testEmail,
          firstName: testFirstName,
          lastName: testLastName,
        })
        .expect(200);

      const otpCookie = step2Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('otpToken='));

      // Try with invalid OTP
      const response = await request(app.getHttpServer())
        .post('/auth/verify-registration-otp')
        .set('Cookie', otpCookie)
        .send({ otp: '000000' })
        .expect(400);

      expect(response.body.error.message).toContain('Invalid OTP');
    });
  });

  describe('Password Reset Flow', () => {
    const testEmail = 'reset@example.com';
    const newPassword = 'NewSecurePassword123!';

    beforeEach(async () => {
      // Create a test account for password reset
      // This would typically be done through a setup script or fixture
    });

    it('should complete the password reset flow', async () => {
      // Step 1: Request password reset
      const step1Response = await request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({ email: testEmail })
        .expect(200);

      expect(step1Response.body.data.message).toContain('password reset email');

      // Extract OTP token from cookie
      const otpCookie = step1Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('otpToken='));
      expect(otpCookie).toBeDefined();

      // Step 2: Verify OTP (mock the OTP)
      const mockOtp = '123456';
      await redisService.set(`otp:password_reset:${testEmail}`, JSON.stringify({
        otp: mockOtp,
        email: testEmail,
        type: 'password_reset',
        attempts: 0,
        createdAt: Date.now(),
        expiresAt: Date.now() + (10 * 60 * 1000)
      }), 600);

      const step2Response = await request(app.getHttpServer())
        .post('/auth/verify-password-reset-otp')
        .set('Cookie', otpCookie)
        .send({ otp: mockOtp })
        .expect(200);

      expect(step2Response.body.data.message).toContain('verified successfully');

      // Extract reset token from cookie
      const resetCookie = step2Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('resetToken='));
      expect(resetCookie).toBeDefined();

      // Step 3: Complete password reset
      const step3Response = await request(app.getHttpServer())
        .post('/auth/complete-password-reset')
        .set('Cookie', resetCookie)
        .send({ newPassword })
        .expect(200);

      expect(step3Response.body.data.message).toContain('reset successfully');
      expect(step3Response.body.data.user).toHaveProperty('email', testEmail);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/request-password-reset')
        .send({ email: 'nonexistent@example.com' })
        .expect(200); // Should still return 200 for security

      expect(response.body.data.message).toContain('password reset email');
      
      // Should not set OTP token cookie for non-existent email
      const otpCookie = response.headers['set-cookie']
        ?.find(cookie => cookie.startsWith('otpToken='));
      expect(otpCookie).toBeUndefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on invite code validation', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/validate-invite-code')
            .send({ inviteCode: 'INVALID-CODE' })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should enforce rate limits on OTP verification', async () => {
      // Setup: Get to OTP verification step
      const step1Response = await request(app.getHttpServer())
        .post('/auth/validate-invite-code')
        .send({ inviteCode: '$INV-2024-TEST01' })
        .expect(200);

      const sessionCookie = step1Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('sessionToken='));

      const step2Response = await request(app.getHttpServer())
        .post('/auth/register-email')
        .set('Cookie', sessionCookie)
        .send({
          email: 'ratelimit@example.com',
          firstName: 'Rate',
          lastName: 'Limit',
        })
        .expect(200);

      const otpCookie = step2Response.headers['set-cookie']
        .find(cookie => cookie.startsWith('otpToken='));

      // Make multiple OTP verification attempts
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app.getHttpServer())
            .post('/auth/verify-registration-otp')
            .set('Cookie', otpCookie)
            .send({ otp: '000000' })
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security Features', () => {
    it('should validate CSRF tokens', async () => {
      // This test would verify CSRF protection is working
      // Implementation depends on your CSRF setup
    });

    it('should enforce secure cookie settings in production', async () => {
      // Mock production environment
      jest.spyOn(environmentService, 'get').mockImplementation((key: string) => {
        if (key === 'app.env') return 'production';
        return process.env[key];
      });

      const response = await request(app.getHttpServer())
        .post('/auth/validate-invite-code')
        .send({ inviteCode: '$INV-2024-TEST01' })
        .expect(200);

      const sessionCookie = response.headers['set-cookie']
        .find(cookie => cookie.startsWith('sessionToken='));
      
      expect(sessionCookie).toContain('Secure');
      expect(sessionCookie).toContain('HttpOnly');
      expect(sessionCookie).toContain('SameSite=Strict');
    });

    it('should blacklist tokens on password change', async () => {
      // This test would verify that changing password blacklists existing tokens
      // Implementation depends on your token blacklisting setup
    });
  });
});
