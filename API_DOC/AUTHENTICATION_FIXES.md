# Authentication API Documentation Fixes

## Summary of Issues Found and Fixed

After re-analyzing the authentication system implementation, several discrepancies were identified between the documentation and the actual backend code. This document outlines all the fixes applied.

## 🐛 Critical Issues Fixed

### 1. **Login Endpoint Response Bug**
**Issue**: The login endpoint (`POST /auth/log-in`) has a bug in the controller where it returns the refresh token instead of the access token in the response body.

**Location**: `server/src/modules/auth/api/controllers/auth.controller.ts:50`
```typescript
// BUG: Returns refresh token instead of access token
return {
   accessToken: tokens.refreshToken  // Should be tokens.accessToken
}
```

**Documentation Fix**: Added warning about this bug in the API documentation.

### 2. **OTP Verification Request Body Structure**
**Issue**: All OTP-related endpoints require `access_token` in the request body, not just the OTP code.

**Affected Endpoints**:
- `POST /auth/verify-otp`
- `POST /auth/verify-reset-otp` 
- `POST /auth/reset-password`

**Correct Request Body Structure**:
```json
{
  "access_token": "string",
  "otp": "string"
}
```

**For Reset Password**:
```json
{
  "access_token": "string", 
  "otp": "string",
  "newPassword": "string"
}
```

### 3. **Authentication Method for OTP Endpoints**
**Issue**: OTP endpoints don't use Bearer token authentication in headers. Instead, they require the access token in the request body.

**Fix**: Updated documentation and Postman collection to remove Authorization headers and include access_token in request bodies.

## 📝 Documentation Updates

### Authentication API Documentation (`authentication-api.md`)

1. **Updated OTP Endpoint Request Bodies**:
   - Added `access_token` field to all OTP-related endpoints
   - Updated validation rules to reflect required fields
   - Changed authentication method description

2. **Added Bug Warnings**:
   - Login endpoint response bug warning
   - Clear indication of the access token vs refresh token issue

3. **Updated Account Role Values**:
   - Corrected account role enum values: `user`, `seller`, `admin`, `operator`, `super_admin`, `employee`

### Postman Collection (`auth-api-postman-collection.json`)

1. **Fixed Request Bodies**:
   - Updated all OTP-related requests to include `access_token` field
   - Removed Authorization headers from OTP endpoints
   - Updated error testing scenarios

2. **Maintained Test Scripts**:
   - Kept automatic token extraction and validation
   - Updated test descriptions to reflect correct behavior

## 🔍 Validation Rules Confirmed

### User Registration (`POST /auth/sign-in`)
```typescript
{
  phoneNumber: string,     // Required
  password: string,        // Required  
  firstName: string,       // Required
  lastName: string,        // Required
  accountRole: string      // Required (user, seller, admin, operator, super_admin, employee)
}
```

### Employee Registration (`POST /admin/auth/register`)
```typescript
{
  firstName: string,       // Required
  lastName: string,        // Required
  phoneNumber?: string,    // Optional
  email: string,          // Required
  password: string,       // Required
  inviteCode: string,     // Required
  image?: string,         // Optional
  birthday?: Date         // Optional
}
```

### Login (`POST /auth/log-in`)
```typescript
{
  email: string,          // Required
  password: string        // Required
}
```

## 🚨 Known Issues Still Present

### 1. Login Response Bug
**Status**: Documented but not fixed in backend
**Impact**: Frontend receives refresh token instead of access token
**Workaround**: Frontend should be aware of this issue

### 2. Password Validation Disabled
**Status**: Password validation is commented out in both user and admin login
**Impact**: Any password will be accepted during login
**Location**: 
- `auth.service.ts:93-95`
- `auth.admin.service.ts:47-53`

## 🔧 Backend Files Analyzed

### Controllers
- `server/src/modules/auth/api/controllers/auth.controller.ts`
- `server/src/modules/auth/api/controllers/auth.admin.controller.ts`

### DTOs and Validation
- `server/src/modules/auth/api/dto/request/singIn.dto.ts`
- `server/src/modules/auth/api/dto/request/logIn.dto.ts`
- `server/src/modules/auth/api/dto/request/register-employee.dto.ts`
- `server/src/modules/auth/api/dto/request/verify-otp.dto.ts`

### Services
- `server/src/modules/auth/services/auth.service.ts`
- `server/src/modules/auth/services/auth.admin.service.ts`

### Schemas
- `server/src/modules/account/account/data/schemas/account.schema.ts`
- `server/src/modules/account/account/types/role.enum.ts`

## 📋 Testing Recommendations

### 1. Test OTP Endpoints
- Verify that `access_token` is required in request body
- Test missing access_token scenarios
- Validate OTP verification flow

### 2. Test Login Bug
- Confirm that login returns refresh token instead of access token
- Test if this affects authentication flow

### 3. Test Registration
- Verify all required fields for user registration
- Test employee registration with invite codes
- Validate account role assignments

## 🎯 Next Steps

1. **Fix Backend Bug**: Update login controller to return correct access token
2. **Enable Password Validation**: Uncomment password validation in login endpoints
3. **Test Integration**: Verify frontend works with corrected API documentation
4. **Update Frontend**: Ensure frontend handles the login response correctly

## 📚 Reference Files Updated

- `API_DOC/authentication-api.md` - Complete API documentation
- `API_DOC/auth-api-postman-collection.json` - Postman test collection
- `API_DOC/AUTHENTICATION_FIXES.md` - This summary document

All documentation now accurately reflects the actual backend implementation, including known bugs and workarounds.
