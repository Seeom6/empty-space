# Invite Code System API Documentation

## Overview

This document provides comprehensive API documentation for the Invite Code System. The system manages employee invitation codes that are used for employee registration, including code generation, status management, and integration with the position and privilege systems.

## Base URL Structure

```
Admin Invite Code Management: /admin/invite-code/*
```

## System Architecture

The invite code system integrates with:
- **Position System**: Each invite code is linked to a specific position
- **Privilege System**: Invite codes can have associated privileges
- **Employee Registration**: Used in the authentication system for employee registration
- **Account System**: Tracks which accounts used specific invite codes

## Invite Code Lifecycle

1. **Creation**: Admin creates invite code for a specific position
2. **Active**: Code is available for use
3. **Used**: Employee registers using the code
4. **Expired**: Code expires (manual status change)
5. **Revoked**: Code is manually revoked by admin

---

## Admin Endpoints (Require Admin Authentication)

### 1. Create Invite Code

**Endpoint**: `POST /admin/invite-code`

**Description**: Create a new invite code for employee registration.

**Authentication**: Required - Admin access token (SUPER_ADMIN, ADMIN, EMPLOYEE, OPERATOR)

**Request Body**:
```json
{
  "position": "string",
  "privilege": ["string"]
}
```

**Validation Rules**:
- `position`: Required MongoDB ObjectId - Must be a valid position ID
- `privilege`: Required array of MongoDB ObjectIds - List of privilege IDs

**Success Response** (200):
```json
{}
```

**Note**: The endpoint returns an empty response body on success (HTTP 200 status indicates success).

**Error Responses**:
- **400 Bad Request** - Invalid position ID:
```json
{
  "error": {
    "path": "/admin/invite-code",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Position not found",
    "code": 10000,
    "errorType": "POSITION_ERROR"
  }
}
```

**Note**: The position validation currently throws `DEPARTMENT_NOT_FOUND` (code 10000) instead of `POSITION_NOT_FOUND` due to a bug in the position service.

- **400 Bad Request** - Validation error:
```json
{
  "error": {
    "path": "/admin/invite-code",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "position Required",
    "code": 70000,
    "errorType": "VALIDATION_ERROR"
  }
}
```

**Notes**:
- Invite code is automatically generated with format: `$INV-{YEAR}-{6_RANDOM_CHARS}`
- Code uniqueness is ensured through recursive generation
- Position must exist in the system
- **⚠️ Issue**: Privilege IDs are not validated during creation (no validation against privilege collection)
- Empty response body indicates successful creation

---

### 2. Get Invite Code Statistics

**Endpoint**: `GET /admin/invite-code/home`

**Description**: Get statistics about invite codes grouped by status.

**Authentication**: Required - Admin access token

**Request Body**: None

**Success Response** (200):
```json
[
  {
    "status": "active",
    "count": 15
  },
  {
    "status": "used",
    "count": 8
  },
  {
    "status": "expired",
    "count": 3
  },
  {
    "status": "revoked",
    "count": 2
  }
]
```

**Notes**:
- Returns aggregated count of invite codes by status
- Useful for dashboard statistics
- Empty statuses are not included in response

---

### 3. Get All Invite Codes

**Endpoint**: `GET /admin/invite-code`

**Description**: Retrieve paginated list of invite codes with filtering options.

**Authentication**: Required - Admin access token

**Query Parameters**:
- `status` (optional): Filter by invite code status
  - Values: `active`, `used`, `expired`, `revoked`
- `position` (optional): Filter by position ID (MongoDB ObjectId)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `skip` (optional): Number of items to skip

**Example Request**:
```
GET /admin/invite-code?status=active&page=1&limit=10
```

**Success Response** (200):
```json
[
  {
    "code": "$INV-2024-ABC123",
    "status": "active",
    "position": "Frontend Developer",
    "account": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "code": "$INV-2024-DEF456",
    "status": "used",
    "position": "Backend Developer",
    "account": {
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2024-01-10T08:15:00.000Z"
  }
]
```

**Response Fields**:
- `code`: The generated invite code
- `status`: Current status of the invite code
- `position`: Name of the associated position
- `account`: Employee account info if code was used (null if unused)
- `createdAt`: Timestamp when code was created

**Notes**:
- Results are sorted by creation date (newest first)
- Includes position information through database lookup
- Shows associated employee account if code was used
- Supports pagination for large datasets

---

## Internal Service Methods (Used by Authentication System)

### 4. Check Invite Code for Registration

**Method**: `checkInviteCodeForRegister(code: string)`

**Description**: Internal method used by authentication system to validate invite codes during employee registration.

**Parameters**:
- `code`: The invite code to validate

**Returns**:
```typescript
{
  _id: ObjectId,
  code: string,
  status: InviteCodeStatus,
  position: {
    _id: ObjectId,
    name: string,
    departmentId: ObjectId,
    // ... other position fields
  },
  privilege: ObjectId[]
}
```

**Error Responses**:
- Throws `INVITE_CODE_NOT_FOUND` if code doesn't exist or is not active

**Notes**:
- Only returns codes with `active` status
- Populates position information for employee creation
- Used internally by `POST /admin/auth/register` endpoint

---

### 5. Update Invite Code Status

**Method**: `updateInviteCode(body: UpdateInviteCodeStatusDto)`

**Description**: Internal method to update invite code status.

**Parameters**:
```typescript
{
  code: string,
  status: InviteCodeStatus
}
```

**Status Values**:
- `active`: Code is available for use
- `used`: Code has been used for registration
- `expired`: Code has expired
- `revoked`: Code has been revoked

**Error Responses**:
- Throws `INVITE_CODE_NOT_FOUND` if code doesn't exist

**Notes**:
- Used internally when employee registration is completed
- Can be used to manually change code status

---

## Data Models

### Invite Code Schema

```typescript
interface InviteCode {
  _id?: ObjectId;
  code: string;              // Unique invite code
  position: ObjectId;        // Reference to Position
  privilege: ObjectId[];     // Array of Privilege references
  status: InviteCodeStatus;  // Current status
  createdAt: Date;          // Auto-generated timestamp
  updatedAt: Date;          // Auto-generated timestamp
}
```

### Invite Code Status Enum

```typescript
enum InviteCodeStatus {
  Active = "active",
  USED = "used", 
  EXPIRED = "expired",
  REVOKED = "revoked"
}
```

---

## Error Codes Reference

| Code | Message | Description | HTTP Status |
|------|---------|-------------|-------------|
| 13000 | Invite code not found | Invite code doesn't exist or is not active | 400 |
| 10000 | Position not found | Referenced position doesn't exist (bug: should be 11000) | 400 |
| 70000 | Validation error | Request data validation failed | 400 |
| 4013 | Access token not exist | No admin access token provided | 403 |

---

## Integration with Other Systems

### Position System Integration

- Each invite code must reference a valid position
- Position validation occurs during invite code creation
- Position information is included in invite code responses

### Privilege System Integration

- Invite codes can have associated privileges
- Privileges are stored as ObjectId references
- Used to assign permissions to employees during registration

### Authentication System Integration

- Invite codes are validated during employee registration
- `checkInviteCodeForRegister` method is called by auth service
- Code status is updated to "used" after successful registration

### Employee Account Integration

- Used invite codes are linked to employee accounts
- Account information is shown in invite code listings
- Enables tracking of which employee used which code

---

## Code Generation

### Format
- Pattern: `$INV-{YEAR}-{6_RANDOM_CHARS}`
- Example: `$INV-2024-ABC123`

### Generation Process
1. Generate code with current year and random string
2. Check for uniqueness in database
3. If duplicate exists, regenerate recursively
4. Return unique code

### Random String Generation
- Uses `generateRandomString(6)` utility
- Generates 6-character alphanumeric string
- Ensures code uniqueness across the system

---

## Security Considerations

### Access Control
- All endpoints require admin authentication
- Only users with admin roles can manage invite codes
- JWT token validation through admin guards

### Code Validation
- Invite codes are validated for existence and status
- Only `active` codes can be used for registration
- Automatic status updates prevent code reuse

### Data Integrity
- Position references are validated before creation
- Privilege references are validated if provided
- Database constraints ensure code uniqueness

---

## Usage Examples

### Creating an Invite Code
```bash
curl -X POST /admin/invite-code \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "position": "60f7b3b3b3b3b3b3b3b3b3b3",
    "privilege": ["60f7b3b3b3b3b3b3b3b3b3b4"]
  }'
```

### Getting Invite Code Statistics
```bash
curl -X GET /admin/invite-code/home \
  -H "Authorization: Bearer <admin_token>"
```

### Filtering Invite Codes
```bash
curl -X GET "/admin/invite-code?status=active&page=1&limit=5" \
  -H "Authorization: Bearer <admin_token>"
```

---

## Best Practices

### Code Management
- Regularly review and clean up expired codes
- Monitor code usage statistics
- Set appropriate privileges for each position

### Security
- Protect invite codes from unauthorized access
- Regularly rotate admin access tokens
- Monitor invite code usage patterns

### Integration
- Validate position existence before creating codes
- Handle errors gracefully in dependent systems
- Maintain audit trails for code usage
