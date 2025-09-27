# Position Management API Documentation

## Overview

The Position Management API provides endpoints for managing organizational positions within departments. All endpoints require JWT authentication and are accessible only to users with appropriate roles.

## Base URL

```
{BASE_URL}/admin/position
```

## Authentication

All endpoints require JWT authentication via the `accessToken` cookie. The authentication system uses **cookie-based JWT tokens**, not Authorization headers.

### Authentication Flow

1. **Login Request**: Send credentials to `/admin/auth/login`
2. **Server Response**: Server returns JWT token in response body AND sets `accessToken` cookie
3. **Automatic Cookie Handling**: Browser/Postman automatically includes cookie in subsequent requests
4. **API Access**: All position endpoints automatically authenticate using the cookie

### Manual Authentication (cURL)

```bash
# 1. Login to get token
curl -X POST http://localhost:12001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"123456789"}'

# Response includes both token and cookie:
# {"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
# Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/

# 2. Use token in Cookie header for API calls
curl -X GET http://localhost:12001/api/v1/admin/position \
  -H "Cookie: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Postman Authentication

1. **Import the Position API collection**
2. **Run "Admin Login" request first** - This automatically sets the cookie
3. **All other requests work automatically** - Postman handles cookies automatically
4. **No manual token setup needed** - Cookie authentication is seamless

### Browser Authentication

1. **Login via frontend or direct API call**
2. **Cookie is automatically set by browser**
3. **All API calls include cookie automatically**
4. **No additional headers needed**

## Authorization

Position endpoints use JWT authentication with role-based access control:

- **Authentication**: JWT token required in `accessToken` cookie
- **Authorization**: Only authenticated users can access these endpoints
- **Role Requirements**: Based on frontend implementation, the following roles have access:
  - `super_admin`: Full access (view, create, edit, delete)
  - `admin`: Full access (view, create, edit, delete)
  - `employee`: Read-only access (view)
  - `operator`: Limited access (view, create, edit)

## Data Models

### Position Entity

```typescript
interface Position {
  _id: string;                    // MongoDB ObjectId
  name: string;                   // Position name (3-255 characters)
  departmentId: string;           // Reference to Department ObjectId
  description?: string;           // Optional description
  status: "ACTIVE" | "INACTIVE";  // Position status
  isDeleted: boolean;             // Soft delete flag
}
```

### Position Status Enum

```typescript
enum PositionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

## API Endpoints

### 1. Get All Positions

Retrieves all non-deleted positions.

**Endpoint:** `GET /admin/position`

**Authentication:** Required (JWT)

**Request Parameters:** None

**Response:**

```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Software Engineer",
      "description": "Develops and maintains software applications",
      "status": "ACTIVE",
      "isDeleted": false,
      "departmentId": "507f1f77bcf86cd799439012"
    }
  ]
}
```

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| data | Array | Array of position objects |
| data[].id | string | Position unique identifier |
| data[].name | string | Position name |
| data[].description | string\|null | Position description |
| data[].status | string | Position status (ACTIVE/INACTIVE) |
| data[].isDeleted | boolean | Soft delete flag |
| data[].departmentId | string | Associated department ID |

**Error Responses:**

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 403 | ACCESS_TOKEN_NOT_EXIST | Invalid or missing JWT token |
| 500 | - | Internal server error |

---

### 2. Get Position by ID

Retrieves a specific position by its ID with populated department information.

**Endpoint:** `GET /admin/position/{id}`

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Position ObjectId |

**Response:**

```json
{
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Software Engineer",
    "description": "Develops and maintains software applications",
    "status": "ACTIVE",
    "department": "Engineering"
  }
}
```

**Response Schema:**

| Field | Type | Description |
|-------|------|-------------|
| data | object | Position object with department info |
| data.id | string | Position unique identifier |
| data.name | string | Position name |
| data.description | string\|null | Position description |
| data.status | string | Position status (ACTIVE/INACTIVE) |
| data.department | string | Department name |

**Error Responses:**

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 403 | ACCESS_TOKEN_NOT_EXIST | Invalid or missing JWT token |
| 404 | 10000 | Position not found |
| 500 | - | Internal server error |

---

### 3. Create Position

Creates a new position.

**Endpoint:** `POST /admin/position`

**Authentication:** Required (JWT)

**Request Body:**

```json
{
  "name": "Software Engineer",
  "departmentId": "507f1f77bcf86cd799439012",
  "description": "Develops and maintains software applications",
  "status": "ACTIVE"
}
```

**Request Schema:**

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | 3-255 chars | Position name |
| departmentId | string | Yes | Valid ObjectId | Department reference |
| description | string | No | - | Position description |
| status | string | No | ACTIVE/INACTIVE | Position status (defaults to ACTIVE) |

**Response:**

```json
{
  "data": null
}
```

**Validation Rules:**

- `name`: Must be 3-255 characters long
- `departmentId`: Must be a valid MongoDB ObjectId and reference an existing department
- `description`: Optional string field
- `status`: Must be either "ACTIVE" or "INACTIVE", defaults to "ACTIVE"

**Error Responses:**

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | - | Validation error (invalid request body) |
| 403 | ACCESS_TOKEN_NOT_EXIST | Invalid or missing JWT token |
| 404 | 10000 | Department not found |
| 409 | 11001 | Position with this name already exists |
| 500 | - | Internal server error |

---

### 4. Update Position

Updates an existing position.

**Endpoint:** `PUT /admin/position/{id}`

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Position ObjectId |

**Request Body:**

```json
{
  "name": "Senior Software Engineer",
  "departmentId": "507f1f77bcf86cd799439012",
  "description": "Leads software development projects",
  "status": "ACTIVE"
}
```

**Request Schema:** Same as Create Position

**Response:**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Senior Software Engineer",
    "departmentId": "507f1f77bcf86cd799439012",
    "description": "Leads software development projects",
    "status": "ACTIVE",
    "isDeleted": false
  }
}
```

**Validation Rules:**

- Same as Create Position
- Position name uniqueness is checked (excluding current position)
- Department must exist

**Error Responses:**

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 400 | - | Validation error (invalid request body) |
| 403 | ACCESS_TOKEN_NOT_EXIST | Invalid or missing JWT token |
| 404 | 11000 | Position not found |
| 404 | 10000 | Department not found |
| 409 | 11001 | Position with this name already exists |
| 500 | - | Internal server error |

---

### 5. Delete Position

Soft deletes a position (sets isDeleted to true).

**Endpoint:** `DELETE /admin/position/{id}`

**Authentication:** Required (JWT)

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Position ObjectId |

**Response:**

```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Software Engineer",
    "departmentId": "507f1f77bcf86cd799439012",
    "description": "Develops and maintains software applications",
    "status": "ACTIVE",
    "isDeleted": true
  }
}
```

**Error Responses:**

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 403 | ACCESS_TOKEN_NOT_EXIST | Invalid or missing JWT token |
| 404 | 11000 | Position not found |
| 500 | - | Internal server error |

## Error Handling

### Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "path": "/admin/position",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Position not found",
    "code": 11000,
    "errorType": "POSITION_ERROR"
  }
}
```

### Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 10000 | Department not found | Referenced department doesn't exist |
| 11000 | Position not found | Position with given ID doesn't exist |
| 11001 | Position already exists | Position name already taken |
| ACCESS_TOKEN_NOT_EXIST | Access token not exist | JWT authentication failed |

## Rate Limiting

No specific rate limiting is implemented at the API level.

## Examples

### Complete CRUD Example

```bash
# 1. Create a position
curl -X POST "http://localhost:3000/admin/position" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_jwt_token" \
  -d '{
    "name": "DevOps Engineer",
    "departmentId": "507f1f77bcf86cd799439012",
    "description": "Manages infrastructure and deployment",
    "status": "ACTIVE"
  }'

# 2. Get all positions
curl -X GET "http://localhost:3000/admin/position" \
  -H "Cookie: accessToken=your_jwt_token"

# 3. Get specific position
curl -X GET "http://localhost:3000/admin/position/507f1f77bcf86cd799439011" \
  -H "Cookie: accessToken=your_jwt_token"

# 4. Update position
curl -X PUT "http://localhost:3000/admin/position/507f1f77bcf86cd799439011" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_jwt_token" \
  -d '{
    "name": "Senior DevOps Engineer",
    "departmentId": "507f1f77bcf86cd799439012",
    "description": "Leads infrastructure and deployment initiatives",
    "status": "ACTIVE"
  }'

# 5. Delete position
curl -X DELETE "http://localhost:3000/admin/position/507f1f77bcf86cd799439011" \
  -H "Cookie: accessToken=your_jwt_token"
```

## Notes

1. **Soft Delete**: The API uses soft deletion - positions are marked as deleted but not physically removed
2. **Department Validation**: All position operations validate that the referenced department exists
3. **Name Uniqueness**: Position names must be unique across the system
4. **Status Management**: Positions can be ACTIVE or INACTIVE
5. **Population**: The get-by-id endpoint populates department information
6. **Response Wrapping**: All successful responses are wrapped in a `data` object by the ResponseInterceptor
