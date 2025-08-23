# API Documentation: Technologies, Positions, and Departments Systems

## Overview

This document provides comprehensive API documentation for the Technologies, Positions, and Departments management systems. All endpoints require JWT authentication and are prefixed with `/admin/` path.

## Authentication

All endpoints require:
- **Authorization Header**: `Bearer <JWT_TOKEN>`
- **Content-Type**: `application/json` (for POST/PUT requests)

### Base URL Structure
```
Base URL: /admin/{system}
- Technologies: /admin/technology
- Positions: /admin/position  
- Departments: /admin/department
```

---

## Technologies System

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/technology` | Get technology statistics | SUPER_ADMIN |
| GET | `/admin/technology/all` | Get all technologies | SUPER_ADMIN |
| GET | `/admin/technology/:id` | Get technology by ID | SUPER_ADMIN |
| POST | `/admin/technology` | Create new technology | SUPER_ADMIN |
| PUT | `/admin/technology/:id` | Update technology | SUPER_ADMIN |
| DELETE | `/admin/technology/:id` | Delete technology (soft delete) | SUPER_ADMIN |

### Data Structures

#### Technology Entity
```typescript
interface Technology {
  id: string;
  name: string;
  version: string;
  icon: string;
  website: string;
  status: "ACTIVE" | "INACTIVE";
  description: string;
  category: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints Detail

#### 1. Get Technology Statistics
```http
GET /admin/technology
```

**Response:**
```json
{
  "count": [{ "count": 15 }],
  "status": [
    { "status": "ACTIVE", "count": 12 },
    { "status": "INACTIVE", "count": 3 }
  ]
}
```

#### 2. Get All Technologies
```http
GET /admin/technology/all
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "React",
    "description": "A JavaScript library for building user interfaces",
    "status": "ACTIVE",
    "icon": "http://localhost:12001/media/image/react-icon.png",
    "website": "https://reactjs.org",
    "version": "18.2.0",
    "category": "Frontend Framework"
  }
]
```

#### 3. Get Technology by ID
```http
GET /admin/technology/:id
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "React",
  "description": "A JavaScript library for building user interfaces",
  "status": "ACTIVE",
  "icon": "http://localhost:12001/media/image/react-icon.png",
  "website": "https://reactjs.org",
  "version": "18.2.0",
  "category": "Frontend Framework"
}
```

#### 4. Create Technology
```http
POST /admin/technology
```

**Request Body:**
```json
{
  "name": "Vue.js",
  "description": "The Progressive JavaScript Framework",
  "icon": "vue-icon.png",
  "website": "https://vuejs.org",
  "version": "3.3.0",
  "category": "Frontend Framework"
}
```

**Response:** Returns created technology object

#### 5. Update Technology
```http
PUT /admin/technology/:id
```

**Request Body:**
```json
{
  "name": "Vue.js",
  "description": "The Progressive JavaScript Framework - Updated",
  "status": "ACTIVE",
  "icon": "vue-icon-new.png",
  "website": "https://vuejs.org",
  "version": "3.4.0",
  "category": "Frontend Framework"
}
```

#### 6. Delete Technology
```http
DELETE /admin/technology/:id
```

**Response:** Returns updated technology with `isDeleted: true`

### Technology Error Responses

| Error Code | HTTP Status | Message |
|------------|-------------|---------|
| 90000 | 404 | "technology not found" |
| 90001 | 400 | "technology already exist before" |

---

## Departments System

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/department` | Get all departments | JWT |
| GET | `/admin/department/:id` | Get department by ID | JWT |
| POST | `/admin/department` | Create new department | JWT |
| PUT | `/admin/department/:id` | Update department | JWT |
| DELETE | `/admin/department/:id` | Delete department | JWT |

### Data Structures

#### Department Entity
```typescript
interface Department {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  isDeleted: boolean;
}
```

### API Endpoints Detail

#### 1. Get All Departments
```http
GET /admin/department
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Engineering",
    "description": "Software development and engineering",
    "status": "ACTIVE"
  }
]
```

#### 2. Get Department by ID
```http
GET /admin/department/:id
```

**Response:** Returns full department object

#### 3. Create Department
```http
POST /admin/department
```

**Request Body:**
```json
{
  "name": "Marketing",
  "description": "Marketing and communications department",
  "status": "ACTIVE"
}
```

**Validation Rules:**
- `name`: Required, 3-255 characters
- `description`: Optional string
- `status`: Optional, defaults to "ACTIVE"

#### 4. Update Department
```http
PUT /admin/department/:id
```

**Request Body:** Same as create

#### 5. Delete Department
```http
DELETE /admin/department/:id
```

**Business Rules:**
- Cannot delete if department has positions
- Cannot delete if department has employees

### Department Error Responses

| Error Code | HTTP Status | Message |
|------------|-------------|---------|
| 10000 | 404 | "Department not found" |
| 10001 | 400 | "Department already exists" |
| 10002 | 400 | "Department has position" |
| 10003 | 400 | "Department has employee" |

---

## Positions System

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/position` | Get all positions | JWT |
| GET | `/admin/position/:id` | Get position by ID | JWT |
| POST | `/admin/position` | Create new position | JWT |
| PUT | `/admin/position/:id` | Update position | JWT |
| DELETE | `/admin/position/:id` | Delete position | JWT |

### Data Structures

#### Position Entity
```typescript
interface Position {
  id: string;
  name: string;
  departmentId: string;
  description?: string;
  status: "ACTIVE" | "INACTIVE";
  isDeleted: boolean;
}
```

### API Endpoints Detail

#### 1. Get All Positions
```http
GET /admin/position
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Senior Developer",
    "description": "Senior software developer position",
    "status": "ACTIVE"
  }
]
```

#### 2. Get Position by ID
```http
GET /admin/position/:id
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Senior Developer",
  "description": "Senior software developer position",
  "status": "ACTIVE",
  "department": "Engineering"
}
```

#### 3. Create Position
```http
POST /admin/position
```

**Request Body:**
```json
{
  "name": "Frontend Developer",
  "departmentId": "507f1f77bcf86cd799439011",
  "description": "Frontend development position",
  "status": "ACTIVE"
}
```

**Validation Rules:**
- `name`: Required, 3-255 characters
- `departmentId`: Required, valid department ID
- `description`: Optional string
- `status`: Optional, defaults to "ACTIVE"

#### 4. Update Position
```http
PUT /admin/position/:id
```

**Request Body:** Same as create

#### 5. Delete Position
```http
DELETE /admin/position/:id
```

**Response:** Soft delete (sets `isDeleted: true`)

### Position Error Responses

| Error Code | HTTP Status | Message |
|------------|-------------|---------|
| 11000 | 404 | "Position not found" |
| 11001 | 400 | "Position already exists" |

---

## Common Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "path": "/admin/technology",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "technology not found",
    "code": 90000,
    "errorType": "TECHNOLOGY_ERROR"
  }
}
```

## Validation Error Format

```json
{
  "error": {
    "path": "/admin/department",
    "time": "2024-01-15T10:30:00.000Z", 
    "message": "name Required",
    "code": 70000,
    "errorType": "VALIDATION_ERROR"
  }
}
```

## Status Codes

- **200**: Success
- **400**: Bad Request / Validation Error
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

---

## Business Logic & Relationships

### System Dependencies

1. **Positions depend on Departments**
   - A position must belong to a valid department
   - Cannot create position without valid `departmentId`
   - Department validation occurs during position creation/update

2. **Employees use Technologies, Positions, and Departments**
   - Employees reference positions and departments
   - Employees can have multiple technologies assigned
   - Deletion constraints apply when entities are referenced

### Deletion Constraints

#### Department Deletion
- **Blocked if**: Department has active positions
- **Blocked if**: Department has active employees
- **Check performed**: Aggregation query to verify no references exist

#### Position Deletion
- **Soft Delete**: Sets `isDeleted: true`
- **Employee Impact**: Employees referencing deleted positions may need handling

#### Technology Deletion
- **Soft Delete**: Sets `isDeleted: true`
- **Employee Impact**: Employee technology arrays may contain deleted technologies

### Data Validation Rules

#### Technology System
```typescript
{
  name: string,           // Required, unique
  description: string,    // Required
  status: string,        // Default: "ACTIVE"
  icon: string,          // Required, file path
  website: string,       // Required, URL
  version: string,       // Required
  category: string       // Required
}
```

#### Department System
```typescript
{
  name: string,          // Required, 3-255 chars, unique
  description?: string,  // Optional
  status?: string       // Optional, default: "ACTIVE"
}
```

#### Position System
```typescript
{
  name: string,          // Required, 3-255 chars, unique
  departmentId: string,  // Required, valid ObjectId
  description?: string,  // Optional
  status?: string       // Optional, default: "ACTIVE"
}
```

---

## Integration Notes for Frontend Developers

### Authentication Setup
```javascript
// Set JWT token in request headers
const token = localStorage.getItem('auth_token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

### Error Handling Best Practices
```javascript
try {
  const response = await api.post('/admin/technology', data);
  // Handle success
} catch (error) {
  const errorData = error.response?.data?.error;

  switch(errorData?.code) {
    case 90001: // Technology exists
      showError('Technology with this name already exists');
      break;
    case 70000: // Validation error
      showError(errorData.message);
      break;
    default:
      showError('An unexpected error occurred');
  }
}
```

### File Upload for Technology Icons
```javascript
// Technology icons are stored as file paths
// Use file upload endpoint first, then use returned path
const uploadResponse = await uploadFile(iconFile);
const technologyData = {
  ...formData,
  icon: uploadResponse.data.filePath
};
```

### Cascading Operations
```javascript
// When creating positions, ensure department exists
const departments = await api.get('/admin/department');
// Then create position with valid departmentId

// When deleting departments, check for dependencies
try {
  await api.delete(`/admin/department/${id}`);
} catch (error) {
  if (error.response?.data?.error?.code === 10002) {
    showError('Cannot delete department with active positions');
  }
}
```

### Recommended Data Flow
1. **Load departments first** - Required for position operations
2. **Load positions after departments** - For employee assignment
3. **Load technologies independently** - No dependencies
4. **Handle soft deletes** - Filter out `isDeleted: true` items in UI

### Performance Considerations
- **Pagination**: Not implemented in current API, consider client-side pagination
- **Caching**: Cache department/technology lists as they change infrequently
- **Batch Operations**: No bulk operations available, handle multiple items sequentially

---

## Testing Examples

### cURL Examples

#### Create Technology
```bash
curl -X POST http://localhost:12001/admin/technology \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Node.js",
    "description": "JavaScript runtime",
    "icon": "nodejs-icon.png",
    "website": "https://nodejs.org",
    "version": "18.17.0",
    "category": "Backend Runtime"
  }'
```

#### Create Department
```bash
curl -X POST http://localhost:12001/admin/department \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DevOps",
    "description": "Infrastructure and deployment"
  }'
```

#### Create Position
```bash
curl -X POST http://localhost:12001/admin/position \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DevOps Engineer",
    "departmentId": "507f1f77bcf86cd799439011",
    "description": "Infrastructure management"
  }'
```
