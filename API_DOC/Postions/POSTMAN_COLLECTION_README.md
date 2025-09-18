# Authentication System Postman Collection

## Overview

This comprehensive Postman collection provides complete testing coverage for the Authentication System API. It includes all authentication endpoints, error scenarios, and complete workflow tests with automatic token management.

## 📁 Collection Structure

### 1. User Authentication
- **User Registration (Sign In)**: Register new user accounts
- **User Login**: Standard email/password login
- **Send OTP (User)**: Send verification OTP to email
- **Verify OTP**: Verify OTP for account confirmation

### 2. Admin Authentication
- **Admin Login**: Login for admin/employee/operator accounts
- **Send OTP for Employee Registration**: Admin OTP for employee onboarding
- **Employee Registration**: Register employees with invite codes

### 3. Password Reset Flow
- **Send Reset OTP**: Initiate password reset
- **Verify Reset OTP**: Verify OTP for password reset
- **Reset Password**: Complete password reset

### 4. Token Management
- **Refresh Token**: Refresh access tokens using cookies
- **Logout**: Logout and clear tokens

### 5. Error Testing
- **Invalid Login Credentials**: Test authentication errors
- **Invalid OTP**: Test OTP validation errors
- **Missing Authorization Header**: Test missing token errors
- **Invalid Invite Code**: Test invite code validation
- **Validation Error**: Test input validation

### 6. Complete Authentication Flows
- **Complete User Registration Flow**: End-to-end user onboarding
- **Complete Employee Registration Flow**: End-to-end employee onboarding

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Authentication_System_Postman_Collection.json`
4. Collection will be imported with all requests and tests

### 2. Environment Setup
The collection includes pre-configured variables:
- `baseUrl`: `http://localhost:12001/api/v1`
- `testEmail`: `test@example.com`
- `testPassword`: `SecurePass123`
- `adminEmail`: `admin@company.com`
- `adminPassword`: `AdminPass123`
- `employeeEmail`: `employee@company.com`
- `inviteCode`: `$INV-2024-ABC123`

### 3. Update Variables (Optional)
You can customize these variables in the collection variables:
1. Click on the collection name
2. Go to **Variables** tab
3. Update values as needed

## 🔧 Features

### Automatic Token Management
- **Auto-saves tokens**: Access tokens, refresh tokens, and OTP tokens are automatically saved
- **Auto-applies tokens**: Authorization headers are automatically added to requests
- **Token rotation**: Refresh tokens are automatically updated
- **Token cleanup**: Tokens are cleared on logout

### Comprehensive Testing
- **Response validation**: All requests include response structure tests
- **Error handling**: Specific tests for different error scenarios
- **Status code validation**: Ensures correct HTTP status codes
- **Token validation**: Verifies token presence and format

### Workflow Support
- **Sequential execution**: Some requests are designed to run in sequence
- **State management**: Tokens and data flow between requests
- **Complete flows**: End-to-end testing scenarios

## 📋 Usage Instructions

### Basic Authentication Testing

#### 1. User Registration and Login
```
1. Run "User Registration (Sign In)"
   → Creates user account and saves access token
2. Run "Send OTP (User)"
   → Sends OTP and saves OTP token
3. Run "Verify OTP"
   → Verifies account using saved OTP token
```

#### 2. Admin Authentication
```
1. Run "Admin Login"
   → Logs in admin and saves access token
2. Use saved token for admin operations
```

#### 3. Employee Registration
```
1. Run "Send OTP for Employee Registration"
   → Sends OTP and saves OTP token
2. Run "Employee Registration"
   → Registers employee using OTP token and invite code
3. Run "Verify OTP"
   → Verifies employee account
```

### Advanced Testing

#### Password Reset Flow
```
1. Run "Send Reset OTP"
   → Initiates password reset
2. Run "Verify Reset OTP"
   → Verifies OTP and gets reset token
3. Run "Reset Password"
   → Completes password reset
```

#### Token Management
```
1. Run any login request to get tokens
2. Run "Refresh Token"
   → Gets new access token using refresh cookie
3. Run "Logout"
   → Clears all tokens and cookies
```

#### Error Testing
```
1. Run "Invalid Login Credentials"
   → Tests authentication error handling
2. Run "Invalid OTP"
   → Tests OTP validation errors
3. Run "Missing Authorization Header"
   → Tests missing token scenarios
```

## 🔍 Test Scenarios

### Positive Test Cases
- ✅ User registration with valid data
- ✅ User login with correct credentials
- ✅ Admin login with admin credentials
- ✅ Employee registration with valid invite code
- ✅ OTP verification with correct OTP
- ✅ Password reset with valid flow
- ✅ Token refresh with valid refresh token
- ✅ Successful logout

### Negative Test Cases
- ❌ Login with invalid credentials (Error 4003)
- ❌ OTP verification with invalid OTP (Error 4002)
- ❌ Protected endpoint without token (Error 4013)
- ❌ Employee registration with invalid invite code (Error 13000)
- ❌ Registration with missing fields (Error 70000)
- ❌ Expired token scenarios (Error 4006)

### Edge Cases
- 🔄 Token refresh scenarios
- 🔄 Multiple login attempts
- 🔄 Concurrent session handling
- 🔄 Cookie-based authentication

## 📊 Expected Results

### Successful Responses
- **201 Created**: User/Employee registration
- **200 OK**: Login, OTP verification, token refresh, logout
- **Tokens**: Access tokens saved automatically
- **Cookies**: Refresh tokens set as HTTP-only cookies

### Error Responses
All errors follow this structure:
```json
{
  "error": {
    "path": "/api/v1/endpoint",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Error description",
    "code": 4003,
    "errorType": "AUTH_ERROR"
  }
}
```

### Common Error Codes
- **4001**: OTP expired or not found
- **4002**: Invalid OTP
- **4003**: Invalid credentials
- **4006**: Expired access token
- **4013**: Access token not exist
- **13000**: Invite code not found
- **70000**: Validation error

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Access token not exist" Error
**Solution**: Run a login request first to get an access token

#### 2. "OTP expired or not found" Error
**Solution**: Run "Send OTP" request to get a fresh OTP token

#### 3. "Invalid invite code" Error
**Solution**: Update the `inviteCode` variable with a valid invite code

#### 4. CORS Errors
**Solution**: Ensure the server is running with proper CORS configuration

#### 5. Connection Refused
**Solution**: Verify the server is running on `http://localhost:12001`

### Debug Tips

#### 1. Check Console Logs
- Open Postman Console (View → Show Postman Console)
- Review request/response logs and script outputs

#### 2. Verify Variables
- Check collection variables for saved tokens
- Ensure `baseUrl` points to correct server

#### 3. Test Sequence
- Some requests depend on previous requests
- Run requests in the suggested order

#### 4. Cookie Management
- Ensure cookies are enabled in Postman
- Check if refresh token cookies are being set

## 🔄 Workflow Examples

### Complete User Onboarding
```
1. User Registration (Sign In)
2. Send OTP (User)
3. Verify OTP
4. User Login (optional - to test login)
```

### Complete Employee Onboarding
```
1. Admin Login (to get admin access)
2. Send OTP for Employee Registration
3. Employee Registration
4. Verify OTP (to complete employee verification)
```

### Password Reset Workflow
```
1. User Login (to establish session)
2. Send Reset OTP
3. Verify Reset OTP
4. Reset Password
5. User Login (with new password)
```

### Token Management Workflow
```
1. User Login (get initial tokens)
2. Refresh Token (get new access token)
3. Use protected endpoints
4. Logout (clear all tokens)
```

## 📝 Notes

### Important Considerations
- **Server Requirements**: Ensure the authentication server is running on port 12001
- **Database**: MongoDB should be running with proper collections
- **Redis**: Redis server should be running for session management
- **Email Service**: Email service should be configured for OTP delivery
- **Invite Codes**: Valid invite codes should exist in the system

### Security Notes
- **Tokens**: Access tokens are stored in collection variables (not secure for production)
- **Passwords**: Test passwords are visible in requests (use test data only)
- **Cookies**: Refresh tokens use HTTP-only cookies for security
- **HTTPS**: Use HTTPS in production environments

### Performance Notes
- **Response Time**: Tests include response time validation (< 5000ms)
- **Concurrent Requests**: Be mindful of rate limiting
- **Session Limits**: Server may limit concurrent sessions per user

## 🤝 Contributing

To add new test cases:
1. Create new request in appropriate folder
2. Add proper test scripts
3. Update this README with new scenarios
4. Test the complete flow

For bug reports or improvements, please refer to the main API documentation.
