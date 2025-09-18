# Position Management API Documentation

## Overview

This document provides comprehensive documentation for the Position Management API. The API allows administrators to manage organizational positions, including creating, reading, updating, and deleting positions within departments. All position endpoints require admin authentication.

**Base URL**: `http://localhost:3000/api/v1`

## Table of Contents

1. [Position Routes](#position-routes)
2. [Request/Response Specifications](#requestresponse-specifications)
3. [Error Handling](#error-handling)
4. [Data Models](#data-models)
5. [Business Logic](#business-logic)
6. [Frontend Integration Guide](#frontend-integration-guide)

---

## Position Routes

All position management endpoints are protected and require admin authentication. The base path for all position endpoints is `/admin/position`.

### 1. Get All Positions
- **Method**: `GET`
- **Endpoint**: `/admin/position`
- **Description**: Retrieve all active positions in the system
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

### 2. Get Position by ID
- **Method**: `GET`
- **Endpoint**: `/admin/position/{id}`
- **Description**: Retrieve a specific position by its ID with department information
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

### 3. Create Position
- **Method**: `POST`
- **Endpoint**: `/admin/position`
- **Description**: Create a new position within a department
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

### 4. Update Position
- **Method**: `PUT`
- **Endpoint**: `/admin/position/{id}`
- **Description**: Update an existing position's information
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

### 5. Delete Position
- **Method**: `DELETE`
- **Endpoint**: `/admin/position/{id}`
- **Description**: Soft delete a position (marks as deleted, doesn't remove from database)
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

---

## Request/Response Specifications

### 1. Get All Positions (GET /admin/position)

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:** None

**Query Parameters:** None

**Success Response (200):**
```json
[
  {
    "id": "string", // MongoDB ObjectId
    "name": "string",
    "description": "string",
    "status": "ACTIVE" | "INACTIVE"
  }
]
```

**Example Response:**
```json
[
  {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Software Engineer",
    "description": "Develops and maintains software applications",
    "status": "ACTIVE"
  },
  {
    "id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Product Manager",
    "description": "Manages product development lifecycle",
    "status": "ACTIVE"
  }
]
```

### 2. Get Position by ID (GET /admin/position/{id})

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the position

**Request Body:** None

**Success Response (200):**
```json
{
  "id": "string", // MongoDB ObjectId
  "name": "string",
  "description": "string",
  "status": "ACTIVE" | "INACTIVE",
  "department": "string" // Department name
}
```

**Example Response:**
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Software Engineer",
  "description": "Develops and maintains software applications",
  "status": "ACTIVE",
  "department": "Engineering"
}
```

### 3. Create Position (POST /admin/position)

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (required)", // 3-255 characters
  "departmentId": "string (required)", // MongoDB ObjectId
  "description": "string (optional)",
  "status": "ACTIVE" | "INACTIVE (optional)" // Default: "ACTIVE"
}
```

**Validation Rules:**
- `name`: Required, minimum 3 characters, maximum 255 characters
- `departmentId`: Required, must be a valid MongoDB ObjectId of an existing department
- `description`: Optional string
- `status`: Optional, must be either "ACTIVE" or "INACTIVE", defaults to "ACTIVE"

**Example Request:**
```json
{
  "name": "Senior Software Engineer",
  "departmentId": "64f1a2b3c4d5e6f7a8b9c0d3",
  "description": "Leads software development projects and mentors junior developers",
  "status": "ACTIVE"
}
```

**Success Response (201):**
```json
{} // Empty response body on successful creation
```

### 4. Update Position (PUT /admin/position/{id})

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the position to update

**Request Body:**
```json
{
  "name": "string (required)", // 3-255 characters
  "departmentId": "string (required)", // MongoDB ObjectId
  "description": "string (optional)",
  "status": "ACTIVE" | "INACTIVE (optional)" // Default: "ACTIVE"
}
```

**Validation Rules:**
- Same as Create Position
- Position name must be unique (excluding the current position being updated)
- Department must exist

**Example Request:**
```json
{
  "name": "Lead Software Engineer",
  "departmentId": "64f1a2b3c4d5e6f7a8b9c0d3",
  "description": "Leads engineering teams and drives technical decisions",
  "status": "ACTIVE"
}
```

**Success Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "departmentId": "string",
  "description": "string",
  "status": "string",
  "isDeleted": false,
  "__v": 0
}
```

### 5. Delete Position (DELETE /admin/position/{id})

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the position to delete

**Request Body:** None

**Success Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "departmentId": "string",
  "description": "string",
  "status": "string",
  "isDeleted": true, // Marked as deleted
  "__v": 0
}
```

---

## Error Handling

### HTTP Status Codes

- **200**: Success (GET, PUT, DELETE)
- **201**: Created (POST)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid or missing access token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (position or department not found)
- **409**: Conflict (duplicate position name)
- **500**: Internal Server Error

### Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "path": "string", // API endpoint path
    "time": "string", // ISO timestamp
    "message": "string", // Human-readable error message
    "code": "number", // Internal error code
    "errorType": "string" // Error category
  }
}
```

### Position-Specific Error Codes

| Code | Message | Description | HTTP Status |
|------|---------|-------------|-------------|
| 11000 | Position not found | Position with given ID doesn't exist or is deleted | 404 |
| 11001 | Position already exists | Position with the same name already exists | 409 |
| 10000 | Department not found | Referenced department doesn't exist | 404 |
| 70000 | Validation error | Request data validation failed | 400 |

### Authentication Error Codes

| Code | Message | Description | HTTP Status |
|------|---------|-------------|-------------|
| 4006 | Expired access token | Access token has expired | 401 |
| 4013 | Access token not exist | Access token is missing | 401 |
| 4009 | Invalid token | Token format or signature is invalid | 401 |

### Example Error Responses

**Position Not Found (404):**
```json
{
  "error": {
    "path": "/api/v1/admin/position/64f1a2b3c4d5e6f7a8b9c0d1",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Position not found",
    "code": 11000,
    "errorType": "POSITION_ERROR"
  }
}
```

**Position Already Exists (409):**
```json
{
  "error": {
    "path": "/api/v1/admin/position",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Position already exists",
    "code": 11001,
    "errorType": "POSITION_ERROR"
  }
}
```

**Department Not Found (404):**
```json
{
  "error": {
    "path": "/api/v1/admin/position",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Department not found",
    "code": 10000,
    "errorType": "POSITION_ERROR"
  }
}
```

**Validation Error (400):**
```json
{
  "error": {
    "path": "/api/v1/admin/position",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Validation error",
    "code": 70000,
    "errorType": "VALIDATION_ERROR"
  }
}
```

**Unauthorized (401):**
```json
{
  "error": {
    "path": "/api/v1/admin/position",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Access token not exist",
    "code": 4013,
    "errorType": "AUTH_ERROR"
  }
}
```

---

## Data Models

### Position Model

```typescript
interface IPosition {
  _id?: string; // MongoDB ObjectId
  name: string; // Position name (3-255 characters)
  departmentId: string | DepartmentDocument; // Reference to Department
  description?: string; // Optional description
  status?: PositionStatus; // ACTIVE or INACTIVE
  isDeleted?: boolean; // Soft delete flag (default: false)
}
```

### Position Status Enum

```typescript
enum PositionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

### Department Model (Related)

```typescript
interface IDepartment {
  _id?: string; // MongoDB ObjectId
  name: string; // Department name
  description?: string; // Optional description
  status?: DepartmentStatus; // ACTIVE or INACTIVE
  isDeleted?: boolean; // Soft delete flag
}

enum DepartmentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

### Database Schema

**Position Collection:**
```javascript
{
  _id: ObjectId,
  name: String, // Required, unique among non-deleted positions
  departmentId: ObjectId, // Required, references Department collection
  description: String, // Optional
  status: String, // Default: "ACTIVE"
  isDeleted: Boolean, // Default: false
  createdAt: Date, // Auto-generated
  updatedAt: Date // Auto-generated
}
```

**Indexes:**
- `name`: Unique index for position names (sparse, excludes deleted positions)
- `departmentId`: Index for department lookups
- `isDeleted`: Index for filtering deleted positions

---

## Business Logic

### Position Creation Process

1. **Department Validation**: Verify that the specified `departmentId` exists and is not deleted
2. **Name Uniqueness Check**: Ensure no other active position has the same name
3. **Data Validation**: Validate all input fields according to schema rules
4. **Status Assignment**: Set status to "ACTIVE" by default if not specified
5. **Database Creation**: Create the position record in the database

### Position Update Rules

1. **Existence Check**: Verify the position exists and is not deleted
2. **Department Validation**: If `departmentId` is changed, verify the new department exists
3. **Name Uniqueness**: If name is changed, ensure no other position has the same name (excluding current position)
4. **Data Validation**: Validate all input fields
5. **Update Operation**: Apply changes to the database

### Position Deletion Constraints

1. **Soft Delete**: Positions are never physically deleted from the database
2. **Employee Check**: Before deletion, the system should verify no employees are currently assigned to this position
3. **Invite Code Check**: Verify no pending invite codes reference this position
4. **Audit Trail**: Maintain deletion timestamp and reason for audit purposes

### Relationship Management

#### Position-Department Relationship
- **Type**: Many-to-One (Many positions belong to one department)
- **Constraint**: Position cannot exist without a valid department
- **Cascade**: When a department is deleted, all its positions should be handled appropriately

#### Position-Employee Relationship
- **Type**: One-to-Many (One position can have multiple employees)
- **Constraint**: Position cannot be deleted if employees are assigned to it
- **Business Rule**: Active positions should be prioritized for employee assignments

#### Position-Invite Code Relationship
- **Type**: One-to-Many (One position can have multiple invite codes)
- **Constraint**: Position cannot be deleted if there are pending invite codes
- **Business Rule**: Only active positions can be used for new invite codes

### Validation Rules

#### Name Validation
- **Length**: 3-255 characters
- **Uniqueness**: Must be unique among all non-deleted positions
- **Format**: No special validation beyond length

#### Department Validation
- **Existence**: Must reference an existing, non-deleted department
- **Format**: Must be a valid MongoDB ObjectId

#### Status Validation
- **Values**: Only "ACTIVE" or "INACTIVE" allowed
- **Default**: "ACTIVE" if not specified
- **Business Rule**: Inactive positions cannot be used for new employee assignments

### Special Business Rules

1. **Position Hierarchy**: While not explicitly modeled, positions within the same department may have implicit hierarchy
2. **Status Inheritance**: Position status may affect employee status and permissions
3. **Reporting Structure**: Positions may be used to determine reporting relationships
4. **Skill Requirements**: Positions may have associated technology/skill requirements (via separate relationships)

---

## Frontend Integration Guide

### 1. Setting Up HTTP Client

```typescript
// API Client Configuration for Position Management
const API_BASE_URL = 'http://localhost:3000/api/v1';

const positionApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin access token
positionApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAccessToken'); // or regular accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
positionApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminAccessToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. Position Management Functions

```typescript
// Position API Functions
export interface Position {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  department?: string; // Only in detailed view
}

export interface CreatePositionRequest {
  name: string;
  departmentId: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdatePositionRequest {
  name: string;
  departmentId: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Get all positions
export const getAllPositions = async (): Promise<Position[]> => {
  const response = await positionApiClient.get('/admin/position');
  return response.data;
};

// Get position by ID
export const getPositionById = async (id: string): Promise<Position> => {
  const response = await positionApiClient.get(`/admin/position/${id}`);
  return response.data;
};

// Create new position
export const createPosition = async (positionData: CreatePositionRequest): Promise<void> => {
  await positionApiClient.post('/admin/position', positionData);
};

// Update position
export const updatePosition = async (
  id: string, 
  positionData: UpdatePositionRequest
): Promise<any> => {
  const response = await positionApiClient.put(`/admin/position/${id}`, positionData);
  return response.data;
};

// Delete position (soft delete)
export const deletePosition = async (id: string): Promise<any> => {
  const response = await positionApiClient.delete(`/admin/position/${id}`);
  return response.data;
};
```

### 3. Error Handling

```typescript
// Position-specific error handling
export const handlePositionError = (error: any): string => {
  if (error.response?.data?.error) {
    const { code, message } = error.response.data.error;
    
    switch (code) {
      case 11000:
        return 'Position not found. It may have been deleted.';
      case 11001:
        return 'A position with this name already exists.';
      case 10000:
        return 'The selected department does not exist.';
      case 70000:
        return 'Please check your input. Name must be 3-255 characters.';
      case 4006:
        return 'Your session has expired. Please log in again.';
      case 4013:
        return 'Authentication required. Please log in.';
      default:
        return message || 'An error occurred while processing your request.';
    }
  }
  
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  return 'Network error. Please check your connection and try again.';
};

// Usage in components
try {
  await createPosition(positionData);
  toast.success('Position created successfully!');
} catch (error) {
  const errorMessage = handlePositionError(error);
  toast.error(errorMessage);
}
```

### 4. React Hooks for Position Management

```typescript
// Custom hooks for position management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook for fetching all positions
export const usePositions = () => {
  return useQuery({
    queryKey: ['positions'],
    queryFn: getAllPositions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching single position
export const usePosition = (id: string) => {
  return useQuery({
    queryKey: ['position', id],
    queryFn: () => getPositionById(id),
    enabled: !!id,
  });
};

// Hook for creating position
export const useCreatePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position created successfully!');
    },
    onError: (error) => {
      const errorMessage = handlePositionError(error);
      toast.error(errorMessage);
    },
  });
};

// Hook for updating position
export const useUpdatePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePositionRequest }) =>
      updatePosition(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['position', id] });
      toast.success('Position updated successfully!');
    },
    onError: (error) => {
      const errorMessage = handlePositionError(error);
      toast.error(errorMessage);
    },
  });
};

// Hook for deleting position
export const useDeletePosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = handlePositionError(error);
      toast.error(errorMessage);
    },
  });
};
```

### 5. Form Validation

```typescript
// Validation schemas using Zod
import { z } from 'zod';

export const createPositionSchema = z.object({
  name: z.string()
    .min(3, 'Position name must be at least 3 characters')
    .max(255, 'Position name must not exceed 255 characters'),
  departmentId: z.string()
    .min(1, 'Please select a department'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updatePositionSchema = createPositionSchema;

export type CreatePositionFormData = z.infer<typeof createPositionSchema>;
export type UpdatePositionFormData = z.infer<typeof updatePositionSchema>;

// React Hook Form integration
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const usePositionForm = (defaultValues?: Partial<CreatePositionFormData>) => {
  return useForm<CreatePositionFormData>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: {
      name: '',
      departmentId: '',
      description: '',
      status: 'ACTIVE',
      ...defaultValues,
    },
  });
};
```

### 6. React Components Example

```typescript
// Position List Component
export const PositionList: React.FC = () => {
  const { data: positions, isLoading, error } = usePositions();
  const deletePosition = useDeletePosition();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deletePosition.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="position-list">
      <div className="header">
        <h2>Positions</h2>
        <Link to="/admin/positions/create" className="btn btn-primary">
          Create Position
        </Link>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions?.map((position) => (
              <tr key={position.id}>
                <td>{position.name}</td>
                <td>{position.description || '-'}</td>
                <td>
                  <span className={`status ${position.status.toLowerCase()}`}>
                    {position.status}
                  </span>
                </td>
                <td>
                  <Link to={`/admin/positions/${position.id}`} className="btn btn-sm">
                    View
                  </Link>
                  <Link to={`/admin/positions/${position.id}/edit`} className="btn btn-sm">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(position.id, position.name)}
                    className="btn btn-sm btn-danger"
                    disabled={deletePosition.isPending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Position Form Component
export const PositionForm: React.FC<{
  position?: Position;
  onSubmit: (data: CreatePositionFormData) => void;
  isLoading?: boolean;
}> = ({ position, onSubmit, isLoading }) => {
  const { data: departments } = useDepartments(); // Assume this hook exists
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = usePositionForm(position);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="position-form">
      <div className="form-group">
        <label htmlFor="name">Position Name *</label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="departmentId">Department *</label>
        <select
          id="departmentId"
          {...register('departmentId')}
          className={errors.departmentId ? 'error' : ''}
        >
          <option value="">Select a department</option>
          {departments?.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        {errors.departmentId && (
          <span className="error-text">{errors.departmentId.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select id="status" {...register('status')}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="button" onClick={() => window.history.back()}>
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? 'Saving...' : position ? 'Update Position' : 'Create Position'}
        </button>
      </div>
    </form>
  );
};
```

### 7. Best Practices

#### Security
- Always include admin access token in requests
- Validate user permissions on the frontend (though backend validation is primary)
- Handle token expiration gracefully
- Use HTTPS in production

#### Performance
- Implement proper caching with React Query
- Use pagination for large position lists (when implemented)
- Debounce search inputs
- Optimize re-renders with proper dependency arrays

#### User Experience
- Show loading states during API calls
- Provide clear error messages
- Implement optimistic updates where appropriate
- Add confirmation dialogs for destructive actions
- Use proper form validation with real-time feedback

#### Error Handling
- Implement global error boundaries
- Log errors for debugging (without sensitive data)
- Provide fallback UI for error states
- Handle network errors gracefully

---

## API Testing Examples

### Using cURL

```bash
# Get all positions
curl -X GET http://localhost:3000/api/v1/admin/position \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json"

# Get position by ID
curl -X GET http://localhost:3000/api/v1/admin/position/64f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json"

# Create position
curl -X POST http://localhost:3000/api/v1/admin/position \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Senior Software Engineer",
    "departmentId": "64f1a2b3c4d5e6f7a8b9c0d3",
    "description": "Leads software development projects",
    "status": "ACTIVE"
  }'

# Update position
curl -X PUT http://localhost:3000/api/v1/admin/position/64f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lead Software Engineer",
    "departmentId": "64f1a2b3c4d5e6f7a8b9c0d3",
    "description": "Leads engineering teams and drives technical decisions",
    "status": "ACTIVE"
  }'

# Delete position
curl -X DELETE http://localhost:3000/api/v1/admin/position/64f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json"
```

### Using Postman

1. **Set Base URL**: `http://localhost:3000/api/v1`
2. **Set Authorization**: 
   - Type: Bearer Token
   - Token: `<admin_access_token>`
3. **Create Environment Variables**:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `adminToken`: (set after admin login)

4. **Pre-request Script for Admin Endpoints**:
```javascript
// Auto-set authorization header for admin endpoints
if (pm.environment.get("adminToken")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("adminToken")
    });
}
```

5. **Test Script for Position Endpoints**:
```javascript
// Test successful responses
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Test response structure for GET all positions
if (pm.request.url.toString().includes("/admin/position") && pm.request.method === "GET") {
    pm.test("Response is an array", function () {
        pm.expect(pm.response.json()).to.be.an('array');
    });
    
    pm.test("Each position has required fields", function () {
        const positions = pm.response.json();
        if (positions.length > 0) {
            pm.expect(positions[0]).to.have.property('id');
            pm.expect(positions[0]).to.have.property('name');
            pm.expect(positions[0]).to.have.property('status');
        }
    });
}

// Test response structure for GET single position
if (pm.request.url.toString().match(/\/admin\/position\/[a-f0-9]{24}$/) && pm.request.method === "GET") {
    pm.test("Response has position details", function () {
        const position = pm.response.json();
        pm.expect(position).to.have.property('id');
        pm.expect(position).to.have.property('name');
        pm.expect(position).to.have.property('department');
    });
}
```

---

## Common Use Cases and Workflows

### 1. Position Management Workflow

```typescript
// Complete position management workflow
class PositionManagementWorkflow {
  async createNewPosition(departmentId: string, positionName: string) {
    try {
      // 1. Validate department exists
      const department = await getDepartmentById(departmentId);
      if (!department) {
        throw new Error('Department not found');
      }

      // 2. Check if position name is unique
      const existingPositions = await getAllPositions();
      const nameExists = existingPositions.some(
        pos => pos.name.toLowerCase() === positionName.toLowerCase()
      );
      if (nameExists) {
        throw new Error('Position name already exists');
      }

      // 3. Create position
      await createPosition({
        name: positionName,
        departmentId,
        status: 'ACTIVE'
      });

      return { success: true, message: 'Position created successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async transferPositionToDepartment(positionId: string, newDepartmentId: string) {
    try {
      // 1. Get current position
      const position = await getPositionById(positionId);
      
      // 2. Validate new department
      const department = await getDepartmentById(newDepartmentId);
      if (!department) {
        throw new Error('Target department not found');
      }

      // 3. Update position
      await updatePosition(positionId, {
        ...position,
        departmentId: newDepartmentId
      });

      return { success: true, message: 'Position transferred successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deactivatePosition(positionId: string) {
    try {
      // 1. Check if position has active employees
      const employees = await getEmployeesByPosition(positionId);
      const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE');
      
      if (activeEmployees.length > 0) {
        throw new Error('Cannot deactivate position with active employees');
      }

      // 2. Update position status
      const position = await getPositionById(positionId);
      await updatePosition(positionId, {
        ...position,
        status: 'INACTIVE'
      });

      return { success: true, message: 'Position deactivated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

### 2. Integration with Employee Management

```typescript
// Position-Employee integration patterns
export const usePositionEmployeeIntegration = () => {
  const { data: positions } = usePositions();
  const { data: employees } = useEmployees();

  // Get active positions for employee assignment
  const getActivePositionsForAssignment = () => {
    return positions?.filter(pos => pos.status === 'ACTIVE') || [];
  };

  // Get employees by position
  const getEmployeesByPosition = (positionId: string) => {
    return employees?.filter(emp => emp.positionId === positionId) || [];
  };

  // Check if position can be deleted
  const canDeletePosition = (positionId: string) => {
    const positionEmployees = getEmployeesByPosition(positionId);
    return positionEmployees.length === 0;
  };

  return {
    getActivePositionsForAssignment,
    getEmployeesByPosition,
    canDeletePosition,
  };
};
```

---

## Conclusion

This documentation provides a complete guide for integrating with the Position Management API. The system supports full CRUD operations for organizational positions with proper validation, error handling, and business logic enforcement.

Key features:
- Complete position lifecycle management
- Department relationship validation
- Soft delete functionality
- Status-based position management
- Comprehensive error handling
- Admin-level security

For any questions or issues, please refer to the error codes section or contact the development team.
