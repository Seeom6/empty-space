import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../auth.module';
import { RedisService } from '@Infrastructure/cache';
import { TokenBlacklistService } from '@Package/auth/services/token-blacklist.service';
import { ProgressiveRateLimitService } from '@Package/auth/services/progressive-rate-limit.service';
import { SecurityEventLoggingService } from '@Package/auth/services/security-event-logging.service';

describe('Authentication Security Tests', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let tokenBlacklistService: TokenBlacklistService;
  let rateLimitService: ProgressiveRateLimitService;
  let securityEventService: SecurityEventLoggingService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    redisService = moduleFixture.get<RedisService>(RedisService);
    tokenBlacklistService = moduleFixture.get<TokenBlacklistService>(TokenBlacklistService);
    rateLimitService = moduleFixture.get<ProgressiveRateLimitService>(ProgressiveRateLimitService);
    securityEventService = moduleFixture.get<SecurityEventLoggingService>(SecurityEventLoggingService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await redisService.flushall();
  });

  describe('Token Security', () => {
    it('should reject blacklisted tokens', async () => {
      // Create a valid token
      const mockToken = 'valid.jwt.token';
      
      // Blacklist the token
      await tokenBlacklistService.blacklistToken(
        mockToken,
        'SECURITY_BREACH',
        '192.168.1.1',
        'Test User Agent'
      );

      // Try to use the blacklisted token
      const response = await request(app.getHttpServer())
        .post('/auth/protected-endpoint')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(401);

      expect(response.body.error.message).toContain('blacklisted');
    });

    it('should detect token reuse attempts', async () => {
      // This test simulates refresh token reuse detection
      const mockRefreshToken = 'refresh.token.example';
      
      // First use should succeed
      // Second use should trigger security alert
      
      // Implementation would depend on your refresh token logic
    });

    it('should enforce token expiration', async () => {
      // Create an expired token
      const expiredToken = 'expired.jwt.token';
      
      const response = await request(app.getHttpServer())
        .post('/auth/protected-endpoint')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error.message).toContain('expired');
    });

    it('should validate token signatures', async () => {
      // Create a token with invalid signature
      const invalidToken = 'invalid.signature.token';
      
      const response = await request(app.getHttpServer())
        .post('/auth/protected-endpoint')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.error.message).toContain('invalid');
    });
  });

  describe('Rate Limiting Security', () => {
    it('should implement progressive rate limiting', async () => {
      const endpoint = '/auth/validate-invite-code';
      const payload = { inviteCode: 'INVALID-CODE' };
      
      // Make requests and track response times
      const responses = [];
      
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        const response = await request(app.getHttpServer())
          .post(endpoint)
          .send(payload);
        const duration = Date.now() - start;
        
        responses.push({ status: response.status, duration });
      }

      // Later requests should be rate limited (429) or take longer
      const rateLimited = responses.filter(r => r.status === 429);
      const increasingDelays = responses.slice(5).every((r, i) => 
        i === 0 || r.duration >= responses[i + 4].duration
      );

      expect(rateLimited.length > 0 || increasingDelays).toBe(true);
    });

    it('should reset rate limits after time window', async () => {
      const endpoint = '/auth/validate-invite-code';
      const payload = { inviteCode: 'INVALID-CODE' };
      
      // Trigger rate limit
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post(endpoint)
          .send(payload);
      }

      // Wait for rate limit window to reset (mock time passage)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Should be able to make requests again
      const response = await request(app.getHttpServer())
        .post(endpoint)
        .send(payload);

      expect(response.status).not.toBe(429);
    });

    it('should apply different rate limits per endpoint', async () => {
      // Test that different endpoints have different rate limits
      const endpoints = [
        { path: '/auth/validate-invite-code', payload: { inviteCode: 'TEST' } },
        { path: '/auth/request-password-reset', payload: { email: 'test@example.com' } },
      ];

      for (const endpoint of endpoints) {
        const responses = [];
        
        for (let i = 0; i < 15; i++) {
          const response = await request(app.getHttpServer())
            .post(endpoint.path)
            .send(endpoint.payload);
          responses.push(response.status);
        }

        const rateLimitedCount = responses.filter(status => status === 429).length;
        // Each endpoint should have different thresholds
        expect(rateLimitedCount).toBeGreaterThan(0);
      }
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent SQL injection attempts', async () => {
      const maliciousInputs = [
        "'; DROP TABLE accounts; --",
        "' OR '1'='1",
        "admin'/*",
        "' UNION SELECT * FROM accounts --"
      ];

      for (const input of maliciousInputs) {
        const response = await request(app.getHttpServer())
          .post('/auth/validate-invite-code')
          .send({ inviteCode: input })
          .expect(400);

        expect(response.body.error.message).toContain('Invalid');
      }
    });

    it('should prevent XSS attempts', async () => {
      const xssInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(1)">',
        '"><script>alert("xss")</script>'
      ];

      for (const input of xssInputs) {
        const response = await request(app.getHttpServer())
          .post('/auth/register-email')
          .send({
            email: input,
            firstName: 'Test',
            lastName: 'User'
          })
          .expect(400);

        expect(response.body.error.message).toContain('Invalid');
      }
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..double.dot@domain.com',
        'user@domain',
        'user@.domain.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app.getHttpServer())
          .post('/auth/register-email')
          .send({
            email,
            firstName: 'Test',
            lastName: 'User'
          })
          .expect(400);

        expect(response.body.error.message).toContain('Invalid email');
      }
    });

    it('should enforce password complexity', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'qwerty',
        'abc123',
        'Password', // Missing number and symbol
        'password123', // Missing uppercase and symbol
        'PASSWORD123!', // Missing lowercase
        'Password!', // Too short
      ];

      for (const password of weakPasswords) {
        const response = await request(app.getHttpServer())
          .post('/auth/complete-registration')
          .send({
            password,
            phoneNumber: '+1234567890'
          })
          .expect(400);

        expect(response.body.error.message).toContain('Password');
      }
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on suspicious activity', async () => {
      // Simulate suspicious activity detection
      const sessionId = 'test-session-id';
      
      // Log suspicious activity
      await securityEventService.logEvent({
        eventType: 'SUSPICIOUS_ACTIVITY',
        severity: 'HIGH',
        sessionId,
        ipAddress: '192.168.1.1',
        userAgent: 'Suspicious Agent',
        details: {
          reason: 'Multiple failed attempts from different locations'
        }
      });

      // Session should be invalidated
      const sessionData = await redisService.get(`auth:session:${sessionId}`);
      expect(sessionData).toBeNull();
    });

    it('should detect concurrent session violations', async () => {
      // Test concurrent session detection logic
      const userId = 'test-user-id';
      const maxSessions = 3;

      // Create multiple sessions for the same user
      for (let i = 0; i < maxSessions + 2; i++) {
        await redisService.sadd(`auth:user_sessions:${userId}`, `session-${i}`);
      }

      // Should trigger concurrent session violation
      const sessionCount = await redisService.scard(`auth:user_sessions:${userId}`);
      expect(sessionCount).toBeLessThanOrEqual(maxSessions);
    });

    it('should enforce session timeout', async () => {
      const sessionId = 'timeout-test-session';
      const sessionData = {
        sessionId,
        userId: 'test-user',
        createdAt: Date.now() - (16 * 60 * 1000), // 16 minutes ago
        expiresAt: Date.now() - (1 * 60 * 1000), // Expired 1 minute ago
      };

      await redisService.set(
        `auth:session:${sessionId}`,
        JSON.stringify(sessionData),
        1 // Very short TTL for testing
      );

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));

      const retrievedSession = await redisService.get(`auth:session:${sessionId}`);
      expect(retrievedSession).toBeNull();
    });
  });

  describe('CSRF Protection', () => {
    it('should require CSRF tokens for state-changing operations', async () => {
      // Test CSRF protection on registration
      const response = await request(app.getHttpServer())
        .post('/auth/complete-registration')
        .send({
          password: 'SecurePassword123!',
          phoneNumber: '+1234567890'
        })
        .expect(403);

      expect(response.body.error.message).toContain('CSRF');
    });

    it('should validate CSRF token authenticity', async () => {
      const invalidCsrfToken = 'invalid-csrf-token';
      
      const response = await request(app.getHttpServer())
        .post('/auth/complete-registration')
        .set('X-CSRF-Token', invalidCsrfToken)
        .send({
          password: 'SecurePassword123!',
          phoneNumber: '+1234567890'
        })
        .expect(403);

      expect(response.body.error.message).toContain('Invalid CSRF token');
    });
  });

  describe('Account Security', () => {
    it('should lock accounts after failed attempts', async () => {
      const email = 'locktest@example.com';
      const maxAttempts = 5;

      // Make multiple failed login attempts
      for (let i = 0; i < maxAttempts + 1; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email,
            password: 'wrong-password'
          });
      }

      // Account should be locked
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'correct-password'
        })
        .expect(423);

      expect(response.body.error.message).toContain('locked');
    });

    it('should detect password spraying attacks', async () => {
      const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
      const targetEmail = 'target@example.com';

      // Simulate password spraying
      for (const password of commonPasswords) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: targetEmail,
            password
          });
      }

      // Should trigger security alert
      const events = await securityEventService.getEvents({
        eventTypes: ['BRUTE_FORCE_DETECTED'],
        accountId: targetEmail
      });

      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling Security', () => {
    it('should not leak sensitive information in error messages', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'any-password'
        })
        .expect(401);

      // Should not reveal whether email exists or not
      expect(response.body.error.message).not.toContain('not found');
      expect(response.body.error.message).not.toContain('does not exist');
    });

    it('should use consistent response times to prevent timing attacks', async () => {
      const validEmail = 'valid@example.com';
      const invalidEmail = 'invalid@example.com';
      
      const times = [];

      // Test multiple requests to get average response times
      for (let i = 0; i < 10; i++) {
        const start = Date.now();
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: i % 2 === 0 ? validEmail : invalidEmail,
            password: 'test-password'
          });
        times.push(Date.now() - start);
      }

      // Response times should be relatively consistent
      const avgTime = times.reduce((a, b) => a + b) / times.length;
      const variance = times.reduce((acc, time) => acc + Math.pow(time - avgTime, 2), 0) / times.length;
      
      // Variance should be low (consistent timing)
      expect(variance).toBeLessThan(1000); // Adjust threshold as needed
    });
  });
});
