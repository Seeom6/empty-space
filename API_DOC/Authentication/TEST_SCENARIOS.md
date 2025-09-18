# Authentication API Test Scenarios

## 📋 Overview

This document provides comprehensive test scenarios for the Empty Space authentication API. Each scenario includes setup requirements, execution steps, expected results, and validation criteria.

## 🧪 Test Categories

### 1. Registration Flow Tests
### 2. Authentication Tests  
### 3. Password Reset Tests
### 4. Admin Operation Tests
### 5. Security Tests
### 6. Error Handling Tests
### 7. Performance Tests

---

## 1. Registration Flow Tests

### Test 1.1: Complete Registration Flow (Happy Path)

**Objective**: Verify successful user registration through all steps

**Prerequisites**:
- Valid invite code available
- Email service configured
- Test email accessible

**Test Steps**:
1. POST `/auth/validate-invite-code` with valid invite code
2. Verify sessionToken cookie is set
3. POST `/auth/register-email` with valid email and names
4. Verify otpToken cookie is set
5. Check email for OTP code
6. POST `/auth/verify-registration-otp` with correct OTP
7. Verify registrationToken cookie is set
8. POST `/auth/complete-registration` with strong password
9. Verify accessToken and refreshToken cookies are set

**Expected Results**:
- All requests return 200 status
- Appropriate tokens set at each step
- User account created successfully
- User can access protected resources

**Validation**:
```javascript
pm.test("Registration flow completed successfully", function () {
    pm.expect(pm.environment.get("accessToken")).to.not.be.empty;
    pm.expect(pm.environment.get("refreshToken")).to.not.be.empty;
    pm.expect(pm.environment.get("userId")).to.not.be.empty;
});
```

### Test 1.2: Invalid Invite Code

**Objective**: Verify proper handling of invalid invite codes

**Test Steps**:
1. POST `/auth/validate-invite-code` with invalid format
2. POST `/auth/validate-invite-code` with non-existent code
3. POST `/auth/validate-invite-code` with expired code
4. POST `/auth/validate-invite-code` with already used code

**Expected Results**:
- 400 status for invalid format
- 404 status for non-existent code
- 404 status for expired code
- 409 status for already used code

### Test 1.3: Email Already Exists

**Objective**: Verify handling when email is already registered

**Test Steps**:
1. Complete invite code validation
2. POST `/auth/register-email` with existing email

**Expected Results**:
- 409 status with USER_ALREADY_EXISTS error
- Appropriate error message returned

### Test 1.4: Invalid OTP Verification

**Objective**: Test OTP verification error scenarios

**Test Steps**:
1. Complete email registration
2. POST `/auth/verify-registration-otp` with wrong OTP
3. Wait for OTP expiration
4. POST `/auth/verify-registration-otp` with expired OTP
5. Attempt verification without otpToken

**Expected Results**:
- 400 status for wrong OTP
- 400 status for expired OTP  
- 401 status for missing token

### Test 1.5: Weak Password Validation

**Objective**: Verify password strength requirements

**Test Steps**:
1. Complete OTP verification
2. POST `/auth/complete-registration` with various weak passwords:
   - Too short: "Pass1!"
   - No uppercase: "password123!"
   - No lowercase: "PASSWORD123!"
   - No numbers: "Password!"
   - No special chars: "Password123"

**Expected Results**:
- 400 status for all weak passwords
- Specific validation error messages

---

## 2. Authentication Tests

### Test 2.1: Successful Login

**Objective**: Verify successful user authentication

**Test Steps**:
1. POST `/auth/login` with valid credentials
2. Verify tokens are set
3. Access protected resource with accessToken

**Expected Results**:
- 200 status with user data
- accessToken and refreshToken cookies set
- Protected resource accessible

### Test 2.2: Invalid Credentials

**Objective**: Test login with wrong credentials

**Test Steps**:
1. POST `/auth/login` with wrong email
2. POST `/auth/login` with wrong password
3. POST `/auth/login` with non-existent user

**Expected Results**:
- 400 status with INVALID_CREDENTIALS error
- No tokens set
- Consistent error message for security

### Test 2.3: Token Refresh

**Objective**: Verify token refresh functionality

**Test Steps**:
1. Login successfully
2. Wait for access token to near expiration
3. POST `/auth/refresh` with refreshToken
4. Verify new accessToken received

**Expected Results**:
- 200 status with new accessToken
- New token has extended expiration
- Old token is invalidated

### Test 2.4: Logout

**Objective**: Verify proper logout functionality

**Test Steps**:
1. Login successfully
2. POST `/auth/logout` with tokens
3. Attempt to access protected resource
4. Attempt to refresh token

**Expected Results**:
- 200 status with logout message
- Tokens cleared from cookies
- Protected resource returns 401
- Token refresh fails

---

## 3. Password Reset Tests

### Test 3.1: Complete Password Reset Flow

**Objective**: Verify successful password reset

**Test Steps**:
1. POST `/auth/request-password-reset` with valid email
2. Check email for OTP
3. POST `/auth/verify-password-reset-otp` with correct OTP
4. POST `/auth/complete-password-reset` with new password
5. Login with new password

**Expected Results**:
- All steps return 200 status
- Appropriate tokens set at each step
- Login successful with new password
- Old password no longer works

### Test 3.2: Invalid Reset Email

**Objective**: Test reset with non-existent email

**Test Steps**:
1. POST `/auth/request-password-reset` with non-existent email

**Expected Results**:
- 404 status with USER_NOT_FOUND error
- No OTP sent

### Test 3.3: Reset Token Expiration

**Objective**: Verify reset token expiration handling

**Test Steps**:
1. Complete OTP verification for reset
2. Wait for reset token to expire
3. POST `/auth/complete-password-reset` with expired token

**Expected Results**:
- 400 status with INVALID_RESET_TOKEN error
- Password not changed

---

## 4. Admin Operation Tests

### Test 4.1: Admin Login

**Objective**: Verify admin authentication

**Test Steps**:
1. POST `/admin/auth/login` with admin credentials
2. Verify admin token received

**Expected Results**:
- 200 status with admin access token
- Admin role in user data

### Test 4.2: Admin Employee Registration

**Objective**: Test admin creating new employee

**Test Steps**:
1. Admin login
2. POST `/admin/auth/register` with employee data
3. Verify employee account created

**Expected Results**:
- 200 status with employee data
- Employee can login with provided credentials

---

## 5. Security Tests

### Test 5.1: Rate Limiting

**Objective**: Verify rate limiting enforcement

**Test Steps**:
1. Make multiple rapid requests to `/auth/login`
2. Exceed the rate limit (5 attempts in 15 minutes)
3. Verify rate limit error

**Expected Results**:
- 429 status after exceeding limit
- Retry-After header provided
- Rate limit resets after time window

### Test 5.2: CSRF Protection

**Objective**: Test CSRF token validation

**Test Steps**:
1. Make state-changing request without CSRF token
2. Make request with invalid CSRF token
3. Make request with valid CSRF token

**Expected Results**:
- 403 status for missing/invalid CSRF token
- 200 status for valid CSRF token

### Test 5.3: Token Blacklisting

**Objective**: Verify token blacklisting functionality

**Test Steps**:
1. Login and get tokens
2. Logout (blacklists tokens)
3. Attempt to use blacklisted tokens

**Expected Results**:
- Blacklisted tokens rejected
- 401 status for blacklisted token usage

---

## 6. Error Handling Tests

### Test 6.1: Malformed Requests

**Objective**: Test handling of malformed requests

**Test Steps**:
1. Send requests with invalid JSON
2. Send requests with missing required fields
3. Send requests with invalid data types

**Expected Results**:
- 400 status with validation errors
- Clear error messages
- No server crashes

### Test 6.2: Server Error Handling

**Objective**: Test graceful error handling

**Test Steps**:
1. Simulate database connection failure
2. Simulate email service failure
3. Simulate Redis connection failure

**Expected Results**:
- 500 status with generic error message
- No sensitive information leaked
- Proper error logging

---

## 7. Performance Tests

### Test 7.1: Response Time

**Objective**: Verify acceptable response times

**Test Steps**:
1. Measure response times for all endpoints
2. Test under normal load
3. Test under high load

**Expected Results**:
- All endpoints respond within 2 seconds
- 95th percentile under 5 seconds
- No timeouts under normal load

### Test 7.2: Concurrent Users

**Objective**: Test system under concurrent load

**Test Steps**:
1. Simulate 100 concurrent registrations
2. Simulate 500 concurrent logins
3. Monitor system performance

**Expected Results**:
- All requests processed successfully
- Response times remain acceptable
- No data corruption

---

## 🔧 Test Automation

### Postman Test Scripts

```javascript
// Common validation script
pm.test("Response time is acceptable", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('data');
    pm.expect(jsonData).to.have.property('meta');
});

// Error handling validation
pm.test("Error response has required fields", function () {
    if (pm.response.code >= 400) {
        const jsonData = pm.response.json();
        pm.expect(jsonData).to.have.property('error');
        pm.expect(jsonData.error).to.have.property('code');
        pm.expect(jsonData.error).to.have.property('message');
        pm.expect(jsonData.error).to.have.property('type');
    }
});
```

### Load Testing with Newman

```bash
# Run collection with multiple iterations
newman run authentication-api-postman-collection.json \
  -e authentication-api-environment.json \
  -n 100 \
  --delay-request 100 \
  --timeout-request 10000
```

## 📊 Test Reporting

### Metrics to Track
- Test execution time
- Pass/fail rates
- Response times
- Error rates by endpoint
- Security test results

### Test Coverage
- ✅ All endpoints tested
- ✅ All error scenarios covered
- ✅ Security features validated
- ✅ Performance benchmarks established
- ✅ Edge cases identified

## 🔄 Continuous Testing

### CI/CD Integration
1. Run tests on every commit
2. Performance regression detection
3. Security vulnerability scanning
4. Automated test reporting

### Test Maintenance
1. Update tests for new features
2. Review test scenarios quarterly
3. Update test data regularly
4. Monitor test environment health
