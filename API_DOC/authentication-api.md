# Authentication API Documentation

## Overview

This document provides comprehensive API documentation for the authentication system. The API supports user registration, login, token management, OTP verification, password reset, admin authentication, and employee registration through invite codes.

## Base URL Structure

```
Public Authentication: /auth/*
Admin Authentication: /admin/auth/*
```

## Authentication Flow

1. **User Registration (Sign-in)**: Create new account with phone number
2. **OTP Verification**: Verify phone number with OTP sent via email
3. **Login**: Authenticate with email/password to get access tokens
4. **Token Usage**: Use access token in Authorization header for protected endpoints
5. **Token Refresh**: Refresh expired access tokens using refresh token cookie
6. **Password Reset**: Request OTP and reset password
7. **Admin Login**: Authenticate admin users with elevated privileges
8. **Employee Registration**: Register employees using invite codes

## Token Management

- **Access Token**: Short-lived JWT token for API requests (stored in Redis)
- **Refresh Token**: Long-lived token stored in HTTP-only cookie
- **Token Header**: `Authorization: Bearer <access_token>` OR Cookie: `accessToken=<token>`
- **Cookie Authentication**: Access tokens can also be sent via `accessToken` cookie

---

## Public Authentication Endpoints

### 1. User Sign-in (Registration)

**Endpoint**: `POST /auth/sign-in`

**Description**: Create a new user account and receive authentication tokens.

**Request Body**:
```json
{
  "phoneNumber": "string",
  "password": "string", 
  "firstName": "string",
  "lastName": "string",
  "accountRole": "string"
}
```

**Validation Rules**:
- `phoneNumber`: Required string
- `password`: Required string
- `firstName`: Required string
- `lastName`: Required string
- `accountRole`: Required string (user, seller, admin, operator, super_admin, employee)

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set**:
- `refreshToken`: HTTP-only cookie with refresh token

**Error Responses**:
- **400 Bad Request** - User already exists:
```json
{
  "error": {
    "path": "/auth/sign-in",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Account already exists",
    "code": 2002,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- OTP is automatically generated and stored for phone verification
- Password is automatically hashed
- Refresh token is set as HTTP-only cookie

---

### 2. Seller Sign-in

**Endpoint**: `POST /auth/seller-sign-in`

**Description**: Create a new seller account (same functionality as user sign-in).

**Request/Response**: Same as regular sign-in endpoint above.

---

### 3. User Login

**Endpoint**: `POST /auth/log-in`

**Description**: Authenticate existing user with email and password.

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Validation Rules**:
- `email`: Required string
- `password`: Required string

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ Known Issue**: The current implementation has a bug where it returns the refresh token instead of the access token in the response body. This should be fixed in the backend.

**Cookies Set**:
- `refreshToken`: HTTP-only cookie with refresh token

**Error Responses**:
- **400 Bad Request** - Invalid credentials:
```json
{
  "error": {
    "path": "/auth/log-in",
    "time": "2024-01-15T10:30:00.000Z", 
    "message": "Invalid credentials",
    "code": 4003,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- Manages token count per user (enforces maximum limit)
- Access token is also stored in Redis for validation
- Password validation is currently disabled in code
- **⚠️ Bug**: Current implementation returns refresh token instead of access token in response body

---

### 4. Token Refresh

**Endpoint**: `POST /auth/refresh`

**Description**: Refresh expired access token using refresh token from cookie.

**Authentication**: Requires valid refresh token in cookie

**Request Body**: None (refresh token read from cookie)

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set**:
- `refreshToken`: New HTTP-only cookie with new refresh token

**Error Responses**:
- **400 Bad Request** - Refresh token not in Redis:
```json
{
  "error": {
    "path": "/auth/refresh",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "refresh token not in redis", 
    "code": 4010,
    "errorType": "AUTH_ERROR"
  }
}
```

- **400 Bad Request** - Invalid token:
```json
{
  "error": {
    "path": "/auth/refresh",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Invalid token",
    "code": 4009,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- Old refresh token is invalidated
- New tokens are generated and stored

---

### 5. Logout

**Endpoint**: `POST /auth/log-out`

**Description**: Logout user and invalidate refresh token.

**Authentication**: Requires valid refresh token in cookie

**Request Body**: None

**Success Response** (200): Empty response

**Cookies Cleared**:
- `refreshToken`: Cookie is set to null

**Notes**:
- Refresh token is removed from Redis
- User must login again to get new tokens

---

## Protected Endpoints (Require Access Token)

### 6. Verify OTP

**Endpoint**: `POST /auth/verify-otp`

**Description**: Verify OTP for phone number verification after registration.

**Authentication**: Required - Access token in request body (not in header)

**Request Body**:
```json
{
  "access_token": "string",
  "otp": "string"
}
```

**Validation Rules**:
- `access_token`: Required string - The access token received from registration
- `otp`: Required string - The OTP code received via email

**Success Response** (200):
```json
{
  "message": "OTP verified successfully"
}
```

**Error Responses**:
- **400 Bad Request** - OTP expired:
```json
{
  "error": {
    "path": "/auth/verify-otp",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "OTP expired or not found",
    "code": 4001,
    "errorType": "AUTH_ERROR"
  }
}
```

- **400 Bad Request** - Invalid OTP:
```json
{
  "error": {
    "path": "/auth/verify-otp",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Invalid OTP",
    "code": 4002,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- Requires both access token and OTP in request body
- Updates user's `isVerified` status to true
- OTP is deleted from Redis after successful verification

---

### 7. Verify Reset OTP

**Endpoint**: `POST /auth/verify-reset-otp`

**Description**: Verify OTP for password reset process.

**Authentication**: Required - Access token in request body (not in header)

**Request Body**:
```json
{
  "access_token": "string",
  "otp": "string"
}
```

**Validation Rules**:
- `access_token`: Required string - The access token for authentication
- `otp`: Required string - The OTP code for password reset

**Success Response** (200):
```json
{
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**: Same as verify-otp endpoint

**Notes**:
- Requires both access token and OTP in request body
- Returns a password reset token valid for 15 minutes
- OTP is deleted after successful verification

---

### 8. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Reset user password after OTP verification.

**Authentication**: Required - Access token in request body (not in header)

**Request Body**:
```json
{
  "access_token": "string",
  "otp": "string",
  "newPassword": "string"
}
```

**Validation Rules**:
- `access_token`: Required string - The access token for authentication
- `otp`: Required string - The OTP code for verification
- `newPassword`: Required string - The new password to set

**Success Response** (200):
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Responses**:
- **400 Bad Request** - OTP verification failed:
```json
{
  "error": {
    "path": "/auth/reset-password",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Failed to verify OTP",
    "code": 4005,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- Requires access token, OTP, and new password in request body
- Password is automatically hashed before storage
- User should login again after password reset

---

## Admin Authentication

### 9. Admin Login

**Endpoint**: `POST /admin/auth/login`

**Description**: Authenticate admin users (SUPER_ADMIN, ADMIN, EMPLOYEE, OPERATOR roles).

**Request Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookies Set**:
- `accessToken`: Access token cookie for admin session

**Error Responses**:
- **400 Bad Request** - Invalid credentials or insufficient role:
```json
{
  "error": {
    "path": "/admin/auth/login",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Invalid credentials",
    "code": 4003,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- Only users with admin roles can login
- Token is stored in Redis with privileges
- Password validation is currently disabled

---

### 10. Employee Registration

**Endpoint**: `POST /admin/auth/register`

**Description**: Register new employee using invite code.

**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "email": "string",
  "password": "string",
  "inviteCode": "string",
  "image": "string",
  "birthday": "2024-01-15T00:00:00.000Z"
}
```

**Validation Rules**:
- `firstName`: Required string
- `lastName`: Required string
- `phoneNumber`: Optional string
- `email`: Required string
- `password`: Required string
- `inviteCode`: Required string
- `image`: Optional string
- `birthday`: Optional date

**Success Response** (200):
```json
{
  "message": "Employee registered successfully"
}
```

**Error Responses**:
- **400 Bad Request** - Invalid invite code:
```json
{
  "error": {
    "path": "/admin/auth/register",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Invite code not found",
    "code": 8001,
    "errorType": "AUTH_ERROR"
  }
}
```

- **400 Bad Request** - User already exists:
```json
{
  "error": {
    "path": "/admin/auth/register",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Account already exists",
    "code": 2002,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- Validates invite code before registration
- Creates employee with associated department and position
- Sets account role to EMPLOYEE
- Account is created as unverified initially

---

## Error Codes Reference

| Code | Message | Description | HTTP Status |
|------|---------|-------------|-------------|
| 2002 | Account already exists | Phone number or email already registered | 400 |
| 4001 | OTP expired or not found | OTP has expired or doesn't exist | 400 |
| 4002 | Invalid OTP | OTP code is incorrect | 400 |
| 4003 | Invalid credentials | Email/password combination invalid | 400 |
| 4005 | Failed to verify OTP | OTP verification process failed | 400 |
| 4006 | Expired access token | Access token has expired | 403 |
| 4007 | Session expired you should log in again | Refresh token expired | 401 |
| 4009 | Invalid token | Token is malformed or invalid | 400 |
| 4010 | refresh token not in redis | Refresh token not found in storage | 400 |
| 4013 | Access token not exist | No access token provided | 403 |
| 4014 | OTP token not exist | No OTP token provided | 403 |
| 4015 | invalid api key | Invalid API key provided | 403 |
| 8001 | Invite code not found | Invalid or expired invite code | 400 |
| 70000 | Validation error | Request data validation failed | 400 |

## Authentication Guards

The system uses several guards for different authentication levels:

1. **JwtAuthGuard**: Validates access tokens for protected routes
2. **RefreshTokenGuard**: Validates refresh tokens for token refresh
3. **JwtAuthOptionalGuard**: Optional authentication
4. **OtpGuard**: Validates OTP tokens
5. **APIKeyGuard**: Validates API keys (currently disabled)

## Token Payload Structure

**Access Token Payload**:
```json
{
  "accountId": "string",
  "accountRole": "string", 
  "isActive": "boolean",
  "email": "string",
  "isVerified": "boolean",
  "iat": "number",
  "exp": "number"
}
```

**Refresh Token Payload**:
```json
{
  "userId": "string",
  "jti": "string",
  "iat": "number", 
  "exp": "number"
}
```

## Security Considerations

- Passwords are hashed using bcrypt
- Refresh tokens are stored in HTTP-only cookies
- Access tokens are stored in Redis for validation
- Token rotation on refresh
- Maximum token count per user enforced
- OTP expiration (configurable)
- Password reset token expiration (15 minutes)

## Rate Limiting

Currently no rate limiting is implemented in the authentication endpoints. Consider implementing rate limiting for:
- Login attempts
- OTP requests
- Password reset requests

## Environment Variables

Required environment variables:
- `JWT_ACCESS_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `JWT_EXPIRED_ACCESS`: Access token expiration time
- `JWT_EXPIRED_REFRESH`: Refresh token expiration time
- `TTL_REFRESH_TOKEN`: Refresh token TTL in Redis
- `MAIL_*`: Email service configuration
