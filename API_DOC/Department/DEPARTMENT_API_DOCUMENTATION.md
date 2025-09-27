# Department API Documentation

## Overview

The Department API provides comprehensive CRUD operations for managing organizational departments within the HR system. This API is designed for administrative users to create, read, update, and delete department records with proper validation and error handling.

## Base Information

- **Base URL**: `http://localhost:12001/api/v1`
- **API Prefix**: `/admin/department`
- **Full Base Path**: `http://localhost:12001/api/v1/admin/department`
- **Authentication**: JWT Bearer Token required for all endpoints
- **Content-Type**: `application/json`
- **Authorization**: Admin, Super Admin roles only

## Authentication

All department endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

The JWT token is typically obtained through the admin login endpoint and stored as an HTTP-only cookie.

## Department Routes

### 1. Get All Departments

- **Method**: `GET`
- **Endpoint**: `/admin/department`
- **Description**: Retrieve all active departments in the system
- **Authentication**: Admin access token required
- **Authorization**: Admin, Super Admin roles

#### Request Format
```http
GET /api/v1/admin/department
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Response Format
**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Engineering",
      "description": "Software development and technical operations",
      "status": "ACTIVE"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Human Resources",
      "description": "Employee management and organizational development",
      "status": "ACTIVE"
    }
  ]
}
```

#### Error Responses
**Unauthorized (401):**
```json
{
  "error": {
    "code": 4009,
    "message": "Invalid token",
    "type": "INVALID_TOKEN",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### 2. Get Department by ID

- **Method**: `GET`
- **Endpoint**: `/admin/department/{id}`
- **Description**: Retrieve a specific department by its ID
- **Authentication**: Admin access token required
- **Authorization**: Admin, Super Admin roles

#### Request Format
```http
GET /api/v1/admin/department/507f1f77bcf86cd799439011
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the department |

#### Response Format
**Success Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Engineering",
    "description": "Software development and technical operations",
    "status": "ACTIVE",
    "isDeleted": false
  }
}
```

#### Error Responses
**Department Not Found (404):**
```json
{
  "error": {
    "code": 10000,
    "message": "Department not found",
    "type": "DEPARTMENT_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### 3. Create Department

- **Method**: `POST`
- **Endpoint**: `/admin/department`
- **Description**: Create a new department
- **Authentication**: Admin access token required
- **Authorization**: Admin, Super Admin roles

#### Request Format
```http
POST /api/v1/admin/department
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Marketing",
  "description": "Brand management and customer acquisition",
  "status": "ACTIVE"
}
```

#### Request Body Schema
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | min: 3, max: 255 | Department name (must be unique) |
| description | string | No | - | Department description |
| status | string | No | enum: ["ACTIVE", "INACTIVE"] | Department status (default: "ACTIVE") |

#### Response Format
**Success Response (201 Created):**
```json
{
  "data": null
}
```

#### Error Responses
**Department Already Exists (400):**
```json
{
  "error": {
    "code": 10001,
    "message": "Department already exists",
    "type": "DEPARTMENT_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

**Validation Error (400):**
```json
{
  "error": {
    "code": 70000,
    "message": "name String must contain at least 3 character(s)",
    "type": "VALIDATION_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### 4. Update Department

- **Method**: `PUT`
- **Endpoint**: `/admin/department/{id}`
- **Description**: Update an existing department
- **Authentication**: Admin access token required
- **Authorization**: Admin, Super Admin roles

#### Request Format
```http
PUT /api/v1/admin/department/507f1f77bcf86cd799439011
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Software Engineering",
  "description": "Advanced software development and architecture",
  "status": "ACTIVE"
}
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the department |

#### Request Body Schema
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| name | string | Yes | min: 3, max: 255 | Department name (must be unique) |
| description | string | No | - | Department description |
| status | string | No | enum: ["ACTIVE", "INACTIVE"] | Department status |

#### Response Format
**Success Response (200 OK):**
```json
{
  "data": null
}
```

#### Error Responses
**Department Not Found (404):**
```json
{
  "error": {
    "code": 10000,
    "message": "Department not found",
    "type": "DEPARTMENT_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

**Department Name Already Exists (400):**
```json
{
  "error": {
    "code": 10001,
    "message": "Department already exists",
    "type": "DEPARTMENT_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

### 5. Delete Department

- **Method**: `DELETE`
- **Endpoint**: `/admin/department/{id}`
- **Description**: Soft delete a department (sets isDeleted to true)
- **Authentication**: Admin access token required
- **Authorization**: Admin, Super Admin roles

#### Request Format
```http
DELETE /api/v1/admin/department/507f1f77bcf86cd799439011
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the department |

#### Response Format
**Success Response (200 OK):**
```json
{
  "data": null
}
```

#### Error Responses
**Department Not Found (404):**
```json
{
  "error": {
    "code": 10000,
    "message": "Department not found",
    "type": "DEPARTMENT_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

**Department Has Positions (400):**
```json
{
  "error": {
    "code": 10002,
    "message": "Department has position",
    "type": "DEPARTMENT_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

**Department Has Employees (400):**
```json
{
  "error": {
    "code": 10003,
    "message": "Department has employee",
    "type": "DEPARTMENT_ERROR",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "requestId": "req_123456789"
  }
}
```

## Data Models

### Department Entity
```typescript
interface Department {
  _id?: string;           // MongoDB ObjectId
  name: string;           // Department name (unique)
  description?: string;   // Optional description
  status?: string;        // "ACTIVE" | "INACTIVE"
  isDeleted?: boolean;    // Soft delete flag (default: false)
}
```

### Department Status Enum
```typescript
enum DepartmentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 10000 | Department not found | Department with specified ID does not exist |
| 10001 | Department already exists | Department name is already in use |
| 10002 | Department has position | Cannot delete department with associated positions |
| 10003 | Department has employee | Cannot delete department with associated employees |
| 70000 | Validation error | Request validation failed |
| 4009 | Invalid token | JWT token is invalid or expired |
| 3000 | Server error | Internal server error |

## Validation Rules

### Create/Update Department
- **name**: Required, string, minimum 3 characters, maximum 255 characters, must be unique
- **description**: Optional, string, no length restrictions
- **status**: Optional, must be either "ACTIVE" or "INACTIVE", defaults to "ACTIVE"

## Business Logic

### Department Creation
1. Validates request data using Zod schema
2. Checks if department name already exists
3. Creates department with status "ACTIVE" by default
4. Returns success response

### Department Update
1. Validates request data using Zod schema
2. Checks if department exists
3. If name is being changed, validates new name is unique
4. Updates department with new data
5. Forces status to "ACTIVE" during update

### Department Deletion
1. Checks if department exists
2. Uses MongoDB aggregation to check for associated employees and positions
3. Prevents deletion if department has associated records
4. Performs soft delete by setting isDeleted to true

## Authentication Flow

1. **Admin Login**: Use `/api/v1/admin/auth/login` to obtain JWT token
2. **Token Storage**: Token is stored as HTTP-only cookie
3. **Request Authentication**: Include token in Authorization header
4. **Token Validation**: Server validates JWT on each request

## Rate Limiting

The API implements rate limiting to prevent abuse. If you exceed the rate limit, you'll receive a 429 status code with details about when you can retry.

## CORS Configuration

The API is configured to accept requests from `http://localhost:3000` (frontend application) with credentials enabled for cookie-based authentication.

## Environment Variables

- `NODE_ENV`: Application environment (development/production)
- `JWT_SECRET`: Secret key for JWT token signing
- `MONGODB_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection for session management

## Frontend Integration Examples

### React/TypeScript Integration

```typescript
// Department Service Implementation
import { apiClient, apiRequest } from '../client';

export class DepartmentService {
  private static readonly BASE_PATH = '/admin/department';

  // Get all departments
  static async getAll(): Promise<Department[]> {
    return apiRequest(() =>
      apiClient.get<Department[]>(DepartmentService.BASE_PATH)
    );
  }

  // Create department
  static async create(data: CreateDepartmentRequest): Promise<void> {
    return apiRequest(() =>
      apiClient.post(DepartmentService.BASE_PATH, data)
    );
  }

  // Update department
  static async update(id: string, data: UpdateDepartmentRequest): Promise<void> {
    return apiRequest(() =>
      apiClient.put(`${DepartmentService.BASE_PATH}/${id}`, data)
    );
  }

  // Delete department
  static async delete(id: string): Promise<void> {
    return apiRequest(() =>
      apiClient.delete(`${DepartmentService.BASE_PATH}/${id}`)
    );
  }
}
```

### React Query Hooks

```typescript
// Custom hooks for department operations
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => DepartmentService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: DepartmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
};
```

## Security Considerations

### Authentication Requirements
- All endpoints require valid JWT token
- Tokens expire after configured time (typically 1 hour)
- Refresh tokens should be used for token renewal
- Logout should invalidate tokens server-side

### Authorization Levels
- **Admin**: Full CRUD access to departments
- **Super Admin**: Full CRUD access to departments
- **Employee**: Read-only access (if implemented)
- **Operator**: Read-only access (if implemented)

### Input Validation
- All inputs are validated using Zod schemas
- SQL injection protection through MongoDB ODM
- XSS protection through input sanitization
- CSRF protection via tokens

## Performance Considerations

### Caching Strategy
- Department data is relatively static
- Implement client-side caching with 5-minute TTL
- Use React Query or similar for automatic cache management
- Consider Redis caching on server-side for high-traffic scenarios

### Pagination
- Current implementation returns all departments
- Consider implementing pagination for large datasets:
  ```
  GET /admin/department?page=1&limit=20&sort=name&order=asc
  ```

### Database Optimization
- Ensure indexes on frequently queried fields (name, status)
- Use MongoDB aggregation for complex queries
- Implement soft delete to maintain referential integrity

## Monitoring and Logging

### Request Logging
- All requests are logged with unique request IDs
- Error responses include request ID for debugging
- Winston logger integration for structured logging

### Metrics to Monitor
- Response times for each endpoint
- Error rates by endpoint and error type
- Authentication failure rates
- Department creation/deletion patterns

## Troubleshooting

### Common Issues

**1. "Department not found" (Code: 10000)**
- Verify the department ID is correct
- Check if department was soft-deleted
- Ensure proper MongoDB ObjectId format

**2. "Department already exists" (Code: 10001)**
- Department names must be unique
- Check for case-sensitive duplicates
- Consider implementing case-insensitive uniqueness

**3. "Department has position/employee" (Codes: 10002, 10003)**
- Remove associated positions/employees first
- Implement cascade deletion if business logic allows
- Consider deactivating instead of deleting

**4. Authentication errors (Code: 4009)**
- Check token expiration
- Verify token format and signature
- Ensure proper Authorization header format

### Debug Steps
1. Check server logs for detailed error information
2. Verify database connectivity and schema
3. Test with Postman collection for isolated testing
4. Check CORS configuration for browser requests
5. Validate environment variables and configuration

## API Versioning

Current API version: `v1`
- Base path includes version: `/api/v1/admin/department`
- Future versions will maintain backward compatibility
- Deprecated endpoints will be marked with sunset dates

## Testing

### Automated Testing
Use the provided Postman collection to test all department endpoints with proper authentication setup and error handling scenarios.

### Test Scenarios Covered
1. **Authentication Flow**: Login and token management
2. **CRUD Operations**: Create, Read, Update, Delete departments
3. **Validation Testing**: Invalid inputs and edge cases
4. **Error Handling**: Various error conditions and responses
5. **Authorization Testing**: Unauthorized access attempts

### Running Tests
1. Import the Postman collection
2. Set environment variables (baseUrl, credentials)
3. Run the collection with automatic authentication
4. Review test results and response validation

## Support and Documentation

- **API Documentation**: This document
- **Postman Collection**: Complete test suite included
- **Error Reference**: Comprehensive error code documentation
- **Frontend Examples**: React/TypeScript integration samples

For additional support or questions about the Department API, refer to the development team or create an issue in the project repository.
