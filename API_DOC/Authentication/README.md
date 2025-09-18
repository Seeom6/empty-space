# Empty Space Authentication API Documentation

## 📋 Overview

This directory contains comprehensive documentation for the Empty Space authentication system API. The system implements a secure, multi-step registration flow with enterprise-grade security features.

## 📁 Files in this Directory

### 📖 Documentation Files

- **`AUTHENTICATION_API_DOCUMENTATION.md`** - Complete API documentation with all endpoints, request/response schemas, error codes, and frontend integration examples
- **`README.md`** - This file, providing an overview and quick start guide

### 🔧 Testing Files

- **`authentication-api-postman-collection.json`** - Postman collection with all authentication endpoints
- **`authentication-api-environment.json`** - Postman environment with pre-configured variables

## 🚀 Quick Start

### 1. Import Postman Collection

1. Open Postman
2. Click "Import" button
3. Select `authentication-api-postman-collection.json`
4. Import `authentication-api-environment.json`
5. Set the environment to "Empty Space Authentication API Environment"

### 2. Configure Environment Variables

Update these variables in your Postman environment:

```json
{
  "inviteCode": "$INV-2024-ABC123",  // Valid invite code
  "testEmail": "your-test@example.com",
  "loginEmail": "existing-user@example.com",
  "adminEmail": "admin@example.com"
}
```

### 3. Test Registration Flow

1. **Validate Invite Code** - Validates invite code and creates session
2. **Register Email** - Registers email and sends OTP
3. **Check Email** - Get OTP from email and update `otp` variable
4. **Verify OTP** - Verifies OTP and creates registration token
5. **Complete Registration** - Sets password and completes registration

## 🔐 Authentication System Features

### Multi-Step Registration
- ✅ Invite code validation
- ✅ Email registration with OTP verification
- ✅ Password setup with strong validation
- ✅ Optional phone number registration

### Security Features
- ✅ Progressive rate limiting
- ✅ CSRF protection
- ✅ JWT-based authentication
- ✅ HTTP-only secure cookies
- ✅ Token blacklisting
- ✅ Security event logging
- ✅ Account lockout protection

### Password Management
- ✅ Secure password reset flow
- ✅ OTP-based verification
- ✅ Strong password requirements
- ✅ Password history prevention

### Admin Operations
- ✅ Admin authentication
- ✅ Employee registration
- ✅ OTP verification for sensitive operations
- ✅ Comprehensive audit logging

## 📊 API Endpoints Summary

### Registration Flow (4 steps)
```
POST /auth/validate-invite-code     → sessionToken
POST /auth/register-email           → otpToken  
POST /auth/verify-registration-otp  → registrationToken
POST /auth/complete-registration    → accessToken + refreshToken
```

### Authentication
```
POST /auth/login                    → accessToken + refreshToken
POST /auth/refresh                  → new accessToken
POST /auth/logout                   → clears tokens
```

### Password Reset (3 steps)
```
POST /auth/request-password-reset        → otpToken
POST /auth/verify-password-reset-otp     → resetToken
POST /auth/complete-password-reset       → success
```

### Admin Operations
```
POST /admin/auth/login              → adminAccessToken
POST /admin/auth/send-otp           → sends OTP
POST /admin/auth/verify-otp         → verifies OTP
POST /admin/auth/register           → creates employee
```

## 🔒 Security Configuration

### Rate Limits
- **Invite Code Validation**: 5 attempts per 15 minutes
- **Email Registration**: 3 attempts per 15 minutes
- **OTP Verification**: 3 attempts per 10 minutes
- **Login**: 5 attempts per 15 minutes
- **Password Reset**: 3 requests per hour

### Token Expiration
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days
- **OTP Token**: 10 minutes
- **Session Token**: 15 minutes
- **Registration Token**: 15 minutes
- **Reset Token**: 15 minutes

### Cookie Security
- **HTTP-Only**: Yes (prevents XSS)
- **Secure**: Yes in production (HTTPS only)
- **SameSite**: Strict in production
- **Domain**: Configurable per environment

## 🧪 Testing Scenarios

### Happy Path Testing
1. Complete registration flow with valid data
2. Login with registered credentials
3. Refresh token before expiration
4. Password reset with valid email
5. Admin operations with proper permissions

### Error Handling Testing
1. Invalid invite codes
2. Expired OTP codes
3. Rate limit exceeded scenarios
4. Invalid credentials
5. Token expiration handling

### Security Testing
1. CSRF token validation
2. Rate limiting enforcement
3. Token blacklisting
4. Session management
5. Input validation

## 🔧 Environment Setup

### Development
```bash
NODE_ENV=development
BASE_URL=http://localhost:12001
JWT_ACCESS_SECRET=dev-jwt-secret
COOKIE_SECRET=dev-cookie-secret
```

### Production
```bash
NODE_ENV=production
BASE_URL=https://api.yourdomain.com
JWT_ACCESS_SECRET=your-super-secure-jwt-secret-32-chars-min
COOKIE_SECRET=your-super-secure-cookie-secret-32-chars-min
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
```

## 📈 Monitoring and Metrics

### Key Metrics to Track
- Registration completion rate
- Login success/failure rates
- OTP delivery and verification rates
- Token refresh patterns
- Rate limit violations
- Security event frequencies

### Alerts to Configure
- High authentication failure rates
- Unusual OTP request patterns
- Token blacklisting events
- Rate limit threshold breaches
- Admin operation anomalies

## 🐛 Troubleshooting

### Common Issues

**OTP Not Received**
- Check spam/junk folders
- Verify email service configuration
- Check rate limits
- Validate email template rendering

**Token Expired Errors**
- Implement automatic token refresh
- Check system clock synchronization
- Verify token expiration settings

**Rate Limit Exceeded**
- Implement exponential backoff
- Check rate limit configuration
- Monitor for abuse patterns

**CORS Errors**
- Verify allowed origins configuration
- Check credentials flag in requests
- Validate header configuration

## 📞 Support

For technical support or questions about the authentication API:

1. Check the comprehensive documentation in `AUTHENTICATION_API_DOCUMENTATION.md`
2. Review error codes and troubleshooting guides
3. Test with the provided Postman collection
4. Enable debug logging for detailed error information

## 🔄 API Versioning

- **Current Version**: v1
- **Deprecation Policy**: 6 months notice for breaking changes
- **Backward Compatibility**: Maintained within major versions
- **Migration Guides**: Provided for major version updates

## 📝 Contributing

When updating the authentication API:

1. Update the main documentation file
2. Add new endpoints to the Postman collection
3. Update environment variables as needed
4. Add test scenarios for new features
5. Update error code documentation
6. Review security implications

## 🔐 Security Best Practices

1. **Never log sensitive data** (passwords, tokens, OTPs)
2. **Use HTTPS in production** for all communications
3. **Implement proper CORS** configuration
4. **Monitor authentication patterns** for anomalies
5. **Regularly rotate secrets** and tokens
6. **Keep dependencies updated** for security patches
7. **Implement proper error handling** without information leakage
8. **Use strong password policies** and validation
9. **Implement account lockout** mechanisms
10. **Audit and log security events** comprehensively
