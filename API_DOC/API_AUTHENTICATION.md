# Authentication API Documentation

## Overview

This document provides comprehensive API documentation for the authentication system. The API supports user registration (sign-in), login, token refresh, OTP verification, password reset, and admin authentication.

## Base URL Structure

```
Authentication Endpoints: /auth/*
Admin Authentication: /admin/auth/*
```

## Authentication Flow

1. **Sign-in/Registration**: Create new account with phone number
2. **OTP Verification**: Verify phone number with OTP
3. **Login**: Authenticate with email/password
4. **Token Usage**: Use access token for authenticated requests
5. **Token Refresh**: Refresh expired access tokens
6. **Logout**: Invalidate tokens

## Token Management

- **Access Token**: Short-lived JWT token for API requests
- **Refresh Token**: Long-lived token stored in HTTP-only cookie
- **Token Header**: `Authorization: Bearer <access_token>`

---

## Authentication Endpoints

### 1. Sign-in (Registration)

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
- `accountRole`: Required string (user, seller, employee, etc.)

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- **400 Bad Request** - User already exists:
```json
{
  "error": {
    "path": "/auth/sign-in",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "User already exists",
    "code": 2002,
    "errorType": "AUTH_ERROR"
  }
}
```

- **400 Bad Request** - Validation error:
```json
{
  "error": {
    "path": "/auth/sign-in", 
    "time": "2024-01-15T10:30:00.000Z",
    "message": "phoneNumber Required",
    "code": 70000,
    "errorType": "VALIDATION_ERROR"
  }
}
```

**Notes**:
- Refresh token is automatically set as HTTP-only cookie
- OTP is generated and stored for phone verification
- Password is automatically hashed

---

### 2. Seller Sign-in

**Endpoint**: `POST /auth/seller-sign-in`

**Description**: Create a new seller account (same as sign-in but for sellers).

**Request/Response**: Same as regular sign-in endpoint above.

---

### 3. Login

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
- Refresh token is set as HTTP-only cookie
- Manages token count per user (max limit enforced)
- Password validation is currently commented out in code

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
- New refresh token is set as HTTP-only cookie
- Old refresh token is invalidated

---

### 5. Logout

**Endpoint**: `POST /auth/log-out`

**Description**: Logout user and invalidate refresh token.

**Authentication**: Requires valid refresh token in cookie

**Request Body**: None

**Success Response** (200): Empty response

**Notes**:
- Refresh token cookie is cleared
- Token is removed from Redis

---

## Authenticated Endpoints (Require Access Token)

### 6. Verify OTP

**Endpoint**: `POST /auth/verify-otp`

**Description**: Verify OTP for phone number verification.

**Authentication**: Required - Bearer token

**Request Body**:
```json
{
  "otp": "string"
}
```

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

---

### 7. Verify Reset OTP

**Endpoint**: `POST /auth/verify-reset-otp`

**Description**: Verify OTP for password reset process.

**Authentication**: Required - Bearer token

**Request Body**:
```json
{
  "otp": "string"
}
```

**Success Response** (200):
```json
{
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**: Same as verify-otp endpoint

---

### 8. Reset Password

**Endpoint**: `POST /auth/reset-password`

**Description**: Reset user password after OTP verification.

**Authentication**: Required - Bearer token

**Request Body**:
```json
{
  "otp": "string",
  "newPassword": "string"
}
```

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

---

## Admin Authentication

### 9. Admin Login

**Endpoint**: `POST /admin/auth/login`

**Description**: Authenticate admin users (SUPER_ADMIN only).

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

**Error Responses**:
- **400 Bad Request** - Invalid credentials or not SUPER_ADMIN:
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
- Only users with `SUPER_ADMIN` role can login
- Token is stored in Redis for validation
- Password validation is currently commented out

---

## Error Codes Reference

| Code | Message | Description |
|------|---------|-------------|
| 2002 | User already exists | Phone number already registered |
| 4001 | OTP expired or not found | OTP has expired or doesn't exist |
| 4002 | Invalid OTP | OTP code is incorrect |
| 4003 | Invalid credentials | Email/password combination invalid |
| 4005 | Failed to verify OTP | OTP verification process failed |
| 4006 | Session expired | Access token has expired |
| 4007 | Session expired you should log in again | Refresh token expired |
| 4009 | Invalid token | Token is malformed or invalid |
| 4010 | refresh token not in redis | Refresh token not found in storage |
| 4013 | Access token not exist | No access token provided |
| 4014 | OTP token not exist | No OTP token provided |
| 70000 | Validation error | Request data validation failed |

## Authentication Guards

The system uses several guards for different authentication levels:

1. **JwtAuthGuard**: Validates access tokens for protected routes
2. **RefreshTokenGuard**: Validates refresh tokens for token refresh
3. **JwtAuthOptionalGuard**: Optional authentication (allows both authenticated and unauthenticated access)
4. **OtpGuard**: Validates OTP tokens for OTP-protected routes

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
