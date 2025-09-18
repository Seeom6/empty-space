# Technology Management API Documentation

## Overview

This document provides comprehensive documentation for the Technology Management API. The API allows administrators to manage organizational technologies, including creating, reading, updating, and deleting technology records. Technologies are used to track skills and tools that employees work with. All technology endpoints require admin authentication.

**Base URL**: `http://localhost:3000/api/v1`

## Table of Contents

1. [Technology Routes](#technology-routes)
2. [Request/Response Specifications](#requestresponse-specifications)
3. [Error Handling](#error-handling)
4. [Data Models](#data-models)
5. [Business Logic](#business-logic)
6. [Frontend Integration Guide](#frontend-integration-guide)

---

## Technology Routes

All technology management endpoints are protected and require admin authentication. The base path for all technology endpoints is `/admin/technology`.

### 1. Get All Technologies
- **Method**: `GET`
- **Endpoint**: `/admin/technology`
- **Description**: Retrieve all active technologies in the system
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

### 2. Get Technology by ID
- **Method**: `GET`
- **Endpoint**: `/admin/technology/{id}`
- **Description**: Retrieve a specific technology by its ID
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

### 3. Create Technology
- **Method**: `POST`
- **Endpoint**: `/admin/technology`
- **Description**: Create a new technology record
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles

### 4. Update Technology
- **Method**: `PUT`
- **Endpoint**: `/admin/technology/{id}`
- **Description**: Update an existing technology's information
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles
- **Note**: ⚠️ Current implementation has a bug - missing path parameter in route definition

### 5. Delete Technology
- **Method**: `DELETE`
- **Endpoint**: `/admin/technology/{id}`
- **Description**: Soft delete a technology (marks as deleted, doesn't remove from database)
- **Authentication**: Admin access token required (Bearer token)
- **Authorization**: Admin, Super Admin, Employee, Operator roles
- **Note**: ⚠️ Current implementation has a bug - missing path parameter in route definition

---

## Request/Response Specifications

### 1. Get All Technologies (GET /admin/technology)

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
    "version": "string",
    "icon": "string", // URL to icon
    "website": "string", // Official website URL
    "status": "ACTIVE" | "INACTIVE",
    "description": "string",
    "category": "string"
  }
]
```

**Example Response:**
```json
[
  {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "React",
    "version": "18.2.0",
    "icon": "https://reactjs.org/favicon.ico",
    "website": "https://reactjs.org",
    "status": "ACTIVE",
    "description": "A JavaScript library for building user interfaces",
    "category": "Frontend Framework"
  },
  {
    "id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Node.js",
    "version": "20.0.0",
    "icon": "https://nodejs.org/favicon.ico",
    "website": "https://nodejs.org",
    "status": "ACTIVE",
    "description": "JavaScript runtime built on Chrome's V8 JavaScript engine",
    "category": "Backend Runtime"
  }
]
```

### 2. Get Technology by ID (GET /admin/technology/{id})

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the technology

**Request Body:** None

**Success Response (200):**
```json
{
  "id": "string", // MongoDB ObjectId
  "name": "string",
  "version": "string",
  "icon": "string", // URL to icon
  "website": "string", // Official website URL
  "status": "ACTIVE" | "INACTIVE",
  "description": "string",
  "category": "string"
}
```

**Example Response:**
```json
{
  "id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "name": "React",
  "version": "18.2.0",
  "icon": "https://reactjs.org/favicon.ico",
  "website": "https://reactjs.org",
  "status": "ACTIVE",
  "description": "A JavaScript library for building user interfaces",
  "category": "Frontend Framework"
}
```

### 3. Create Technology (POST /admin/technology)

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (required)", // Technology name
  "version": "string (required)", // Version number
  "icon": "string (required)", // URL to technology icon
  "website": "string (required)", // Official website URL
  "description": "string (required)", // Technology description
  "category": "string (required)", // Technology category
  "status": "ACTIVE" | "INACTIVE (optional)" // Default: "ACTIVE"
}
```

**Validation Rules:**
- `name`: Required, must be unique among non-deleted technologies
- `version`: Required string (e.g., "18.2.0", "v1.0.0")
- `icon`: Required, must be a valid URL
- `website`: Required, must be a valid URL
- `description`: Required string
- `category`: Required string (e.g., "Frontend Framework", "Database", "Programming Language")
- `status`: Optional, must be either "ACTIVE" or "INACTIVE", defaults to "ACTIVE"

**Example Request:**
```json
{
  "name": "Vue.js",
  "version": "3.3.0",
  "icon": "https://vuejs.org/logo.svg",
  "website": "https://vuejs.org",
  "description": "The Progressive JavaScript Framework",
  "category": "Frontend Framework",
  "status": "ACTIVE"
}
```

**Success Response (201):**
```json
{
  "_id": "string",
  "name": "string",
  "version": "string",
  "icon": "string",
  "website": "string",
  "status": "string",
  "description": "string",
  "category": "string",
  "isDeleted": false,
  "createdAt": "string", // ISO timestamp
  "updatedAt": "string", // ISO timestamp
  "__v": 0
}
```

### 4. Update Technology (PUT /admin/technology/{id})

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the technology to update

**Request Body:**
```json
{
  "name": "string (required)", // Technology name
  "version": "string (required)", // Version number
  "icon": "string (required)", // URL to technology icon
  "website": "string (required)", // Official website URL
  "description": "string (required)", // Technology description
  "category": "string (required)", // Technology category
  "status": "ACTIVE" | "INACTIVE (optional)" // Default: "ACTIVE"
}
```

**Validation Rules:**
- Same as Create Technology
- Technology name must be unique (excluding the current technology being updated)

**Example Request:**
```json
{
  "name": "React",
  "version": "18.3.0",
  "icon": "https://reactjs.org/favicon.ico",
  "website": "https://reactjs.org",
  "description": "A JavaScript library for building user interfaces with improved performance",
  "category": "Frontend Framework",
  "status": "ACTIVE"
}
```

**Success Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "version": "string",
  "icon": "string",
  "website": "string",
  "status": "string",
  "description": "string",
  "category": "string",
  "isDeleted": false,
  "createdAt": "string",
  "updatedAt": "string", // Updated timestamp
  "__v": 0
}
```

### 5. Delete Technology (DELETE /admin/technology/{id})

**Request Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the technology to delete

**Request Body:** None

**Success Response (200):**
```json
{
  "_id": "string",
  "name": "string",
  "version": "string",
  "icon": "string",
  "website": "string",
  "status": "string",
  "description": "string",
  "category": "string",
  "isDeleted": true, // Marked as deleted
  "createdAt": "string",
  "updatedAt": "string",
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
- **404**: Not Found (technology not found)
- **409**: Conflict (duplicate technology name)
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

### Technology-Specific Error Codes

| Code | Message | Description | HTTP Status |
|------|---------|-------------|-------------|
| 90000 | Technology not found | Technology with given ID doesn't exist or is deleted | 404 |
| 90001 | Technology already exist before | Technology with the same name already exists | 409 |
| 70000 | Validation error | Request data validation failed | 400 |

### Authentication Error Codes

| Code | Message | Description | HTTP Status |
|------|---------|-------------|-------------|
| 4006 | Expired access token | Access token has expired | 401 |
| 4013 | Access token not exist | Access token is missing | 401 |
| 4009 | Invalid token | Token format or signature is invalid | 401 |

### Example Error Responses

**Technology Not Found (404):**
```json
{
  "error": {
    "path": "/api/v1/admin/technology/64f1a2b3c4d5e6f7a8b9c0d1",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Technology not found",
    "code": 90000,
    "errorType": "TECHNOLOGY_ERROR"
  }
}
```

**Technology Already Exists (409):**
```json
{
  "error": {
    "path": "/api/v1/admin/technology",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Technology already exist before",
    "code": 90001,
    "errorType": "TECHNOLOGY_ERROR"
  }
}
```

**Validation Error (400):**
```json
{
  "error": {
    "path": "/api/v1/admin/technology",
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
    "path": "/api/v1/admin/technology",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Access token not exist",
    "code": 4013,
    "errorType": "AUTH_ERROR"
  }
}
```

---

## Data Models

### Technology Model

```typescript
interface ITechnology {
  _id?: string; // MongoDB ObjectId
  name: string; // Technology name (required, unique)
  version: string; // Version number (required)
  icon: string; // URL to technology icon (required)
  website: string; // Official website URL (required)
  status?: TechnologyStatus; // ACTIVE or INACTIVE
  description: string; // Technology description (required)
  category: string; // Technology category (required)
  isDeleted?: boolean; // Soft delete flag (default: false)
  createdAt?: Date; // Auto-generated creation timestamp
  updatedAt?: Date; // Auto-generated update timestamp
}
```

### Technology Status Enum

```typescript
enum TechnologyStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}
```

### Employee-Technology Relationship

```typescript
interface IEmployee {
  _id?: string;
  // ... other employee fields
  technologies: string[] | TechnologyDocument[]; // Array of Technology references
  // ... other fields
}
```

### Database Schema

**Technology Collection:**
```javascript
{
  _id: ObjectId,
  name: String, // Required, unique among non-deleted technologies
  version: String, // Required
  icon: String, // Required, URL format
  website: String, // Required, URL format
  status: String, // Default: "ACTIVE"
  description: String, // Required
  category: String, // Required
  isDeleted: Boolean, // Default: false
  createdAt: Date, // Auto-generated
  updatedAt: Date // Auto-generated
}
```

**Indexes:**
- `name`: Unique index for technology names (sparse, excludes deleted technologies)
- `status`: Index for filtering by status
- `category`: Index for filtering by category
- `isDeleted`: Index for filtering deleted technologies

---

## Business Logic

### Technology Creation Process

1. **Name Uniqueness Check**: Ensure no other active technology has the same name
2. **URL Validation**: Validate that icon and website are valid URLs
3. **Data Validation**: Validate all input fields according to schema rules
4. **Status Assignment**: Set status to "ACTIVE" by default if not specified
5. **Database Creation**: Create the technology record in the database

### Technology Update Rules

1. **Existence Check**: Verify the technology exists and is not deleted
2. **Name Uniqueness**: If name is changed, ensure no other technology has the same name (excluding current technology)
3. **URL Validation**: Validate icon and website URLs if changed
4. **Data Validation**: Validate all input fields
5. **Update Operation**: Apply changes to the database

### Technology Deletion Constraints

1. **Soft Delete**: Technologies are never physically deleted from the database
2. **Employee Check**: Before deletion, verify no employees are currently assigned this technology
3. **Project Check**: Verify no projects are using this technology
4. **Audit Trail**: Maintain deletion timestamp for audit purposes

### Relationship Management

#### Technology-Employee Relationship
- **Type**: Many-to-Many (Employees can have multiple technologies, technologies can be used by multiple employees)
- **Implementation**: Employee schema contains `technologies` array with Technology ObjectId references
- **Constraint**: Technology cannot be deleted if employees are assigned to it
- **Business Rule**: Only active technologies should be available for employee assignment

#### Technology-Project Relationship
- **Type**: Many-to-Many (Projects can use multiple technologies, technologies can be used in multiple projects)
- **Constraint**: Technology cannot be deleted if projects are using it
- **Business Rule**: Technology usage in projects should be tracked for reporting

### Validation Rules

#### Name Validation
- **Uniqueness**: Must be unique among all non-deleted technologies
- **Format**: No special validation beyond uniqueness requirement
- **Case Sensitivity**: Names are case-sensitive

#### Version Validation
- **Format**: String format (e.g., "1.0.0", "v2.1.3", "18.2.0")
- **Required**: Must be provided
- **Business Rule**: Should follow semantic versioning when possible

#### URL Validation
- **Icon URL**: Must be a valid URL pointing to an image resource
- **Website URL**: Must be a valid URL pointing to the official technology website
- **Format**: Standard URL validation (http/https protocols)

#### Category Validation
- **Format**: String value representing technology category
- **Examples**: "Frontend Framework", "Backend Framework", "Database", "Programming Language", "DevOps Tool"
- **Business Rule**: Categories should be standardized for better organization

### Special Business Rules

1. **Technology Lifecycle**: Technologies can be marked as INACTIVE when deprecated but should remain in the system for historical tracking
2. **Version Management**: Version updates should be tracked for technology evolution monitoring
3. **Skill Tracking**: Technologies are used to track employee skills and project requirements
4. **Reporting**: Technology usage statistics should be available for management reporting
5. **Integration**: Technology data may be used for project planning and team formation

---

## Frontend Integration Guide

### 1. Setting Up HTTP Client

```typescript
// API Client Configuration for Technology Management
const API_BASE_URL = 'http://localhost:3000/api/v1';

const technologyApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin access token
technologyApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminAccessToken'); // or regular accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
technologyApiClient.interceptors.response.use(
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

### 2. Technology Management Functions

```typescript
// Technology API Functions
export interface Technology {
  id: string;
  name: string;
  version: string;
  icon: string; // URL
  website: string; // URL
  status: 'ACTIVE' | 'INACTIVE';
  description: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTechnologyRequest {
  name: string;
  version: string;
  icon: string;
  website: string;
  description: string;
  category: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateTechnologyRequest {
  name: string;
  version: string;
  icon: string;
  website: string;
  description: string;
  category: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// Get all technologies
export const getAllTechnologies = async (): Promise<Technology[]> => {
  const response = await technologyApiClient.get('/admin/technology');
  return response.data;
};

// Get technology by ID
export const getTechnologyById = async (id: string): Promise<Technology> => {
  const response = await technologyApiClient.get(`/admin/technology/${id}`);
  return response.data;
};

// Create new technology
export const createTechnology = async (technologyData: CreateTechnologyRequest): Promise<any> => {
  const response = await technologyApiClient.post('/admin/technology', technologyData);
  return response.data;
};

// Update technology
export const updateTechnology = async (
  id: string, 
  technologyData: UpdateTechnologyRequest
): Promise<any> => {
  const response = await technologyApiClient.put(`/admin/technology/${id}`, technologyData);
  return response.data;
};

// Delete technology (soft delete)
export const deleteTechnology = async (id: string): Promise<any> => {
  const response = await technologyApiClient.delete(`/admin/technology/${id}`);
  return response.data;
};
```

### 3. Error Handling

```typescript
// Technology-specific error handling
export const handleTechnologyError = (error: any): string => {
  if (error.response?.data?.error) {
    const { code, message } = error.response.data.error;
    
    switch (code) {
      case 90000:
        return 'Technology not found. It may have been deleted.';
      case 90001:
        return 'A technology with this name already exists.';
      case 70000:
        return 'Please check your input. All fields are required and URLs must be valid.';
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
  await createTechnology(technologyData);
  toast.success('Technology created successfully!');
} catch (error) {
  const errorMessage = handleTechnologyError(error);
  toast.error(errorMessage);
}
```

### 4. React Hooks for Technology Management

```typescript
// Custom hooks for technology management
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook for fetching all technologies
export const useTechnologies = () => {
  return useQuery({
    queryKey: ['technologies'],
    queryFn: getAllTechnologies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching single technology
export const useTechnology = (id: string) => {
  return useQuery({
    queryKey: ['technology', id],
    queryFn: () => getTechnologyById(id),
    enabled: !!id,
  });
};

// Hook for creating technology
export const useCreateTechnology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Technology created successfully!');
    },
    onError: (error) => {
      const errorMessage = handleTechnologyError(error);
      toast.error(errorMessage);
    },
  });
};

// Hook for updating technology
export const useUpdateTechnology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTechnologyRequest }) =>
      updateTechnology(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      queryClient.invalidateQueries({ queryKey: ['technology', id] });
      toast.success('Technology updated successfully!');
    },
    onError: (error) => {
      const errorMessage = handleTechnologyError(error);
      toast.error(errorMessage);
    },
  });
};

// Hook for deleting technology
export const useDeleteTechnology = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTechnology,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Technology deleted successfully!');
    },
    onError: (error) => {
      const errorMessage = handleTechnologyError(error);
      toast.error(errorMessage);
    },
  });
};
```

### 5. Form Validation

```typescript
// Validation schemas using Zod
import { z } from 'zod';

export const createTechnologySchema = z.object({
  name: z.string()
    .min(1, 'Technology name is required')
    .max(100, 'Technology name must not exceed 100 characters'),
  version: z.string()
    .min(1, 'Version is required')
    .max(20, 'Version must not exceed 20 characters'),
  icon: z.string()
    .url('Icon must be a valid URL')
    .min(1, 'Icon URL is required'),
  website: z.string()
    .url('Website must be a valid URL')
    .min(1, 'Website URL is required'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters'),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateTechnologySchema = createTechnologySchema;

export type CreateTechnologyFormData = z.infer<typeof createTechnologySchema>;
export type UpdateTechnologyFormData = z.infer<typeof updateTechnologySchema>;

// React Hook Form integration
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const useTechnologyForm = (defaultValues?: Partial<CreateTechnologyFormData>) => {
  return useForm<CreateTechnologyFormData>({
    resolver: zodResolver(createTechnologySchema),
    defaultValues: {
      name: '',
      version: '',
      icon: '',
      website: '',
      description: '',
      category: '',
      status: 'ACTIVE',
      ...defaultValues,
    },
  });
};
```

### 6. React Components Example

```typescript
// Technology List Component
export const TechnologyList: React.FC = () => {
  const { data: technologies, isLoading, error } = useTechnologies();
  const deleteTechnology = useDeleteTechnology();

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteTechnology.mutate(id);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="technology-list">
      <div className="header">
        <h2>Technologies</h2>
        <Link to="/admin/technologies/create" className="btn btn-primary">
          Add Technology
        </Link>
      </div>

      <div className="grid-container">
        {technologies?.map((technology) => (
          <div key={technology.id} className="technology-card">
            <div className="card-header">
              <img src={technology.icon} alt={technology.name} className="tech-icon" />
              <div className="tech-info">
                <h3>{technology.name}</h3>
                <span className="version">v{technology.version}</span>
              </div>
              <span className={`status ${technology.status.toLowerCase()}`}>
                {technology.status}
              </span>
            </div>

            <div className="card-body">
              <p className="description">{technology.description}</p>
              <p className="category">Category: {technology.category}</p>
              <a href={technology.website} target="_blank" rel="noopener noreferrer" className="website-link">
                Visit Website
              </a>
            </div>

            <div className="card-actions">
              <Link to={`/admin/technologies/${technology.id}`} className="btn btn-sm">
                View
              </Link>
              <Link to={`/admin/technologies/${technology.id}/edit`} className="btn btn-sm">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(technology.id, technology.name)}
                className="btn btn-sm btn-danger"
                disabled={deleteTechnology.isPending}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Technology Form Component
export const TechnologyForm: React.FC<{
  technology?: Technology;
  onSubmit: (data: CreateTechnologyFormData) => void;
  isLoading?: boolean;
}> = ({ technology, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useTechnologyForm(technology);

  const iconUrl = watch('icon');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="technology-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Technology Name *</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className={errors.name ? 'error' : ''}
            placeholder="e.g., React, Node.js, MongoDB"
          />
          {errors.name && <span className="error-text">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="version">Version *</label>
          <input
            id="version"
            type="text"
            {...register('version')}
            className={errors.version ? 'error' : ''}
            placeholder="e.g., 18.2.0, v1.0.0"
          />
          {errors.version && <span className="error-text">{errors.version.message}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="icon">Icon URL *</label>
          <input
            id="icon"
            type="url"
            {...register('icon')}
            className={errors.icon ? 'error' : ''}
            placeholder="https://example.com/icon.png"
          />
          {errors.icon && <span className="error-text">{errors.icon.message}</span>}
          {iconUrl && (
            <div className="icon-preview">
              <img src={iconUrl} alt="Icon preview" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="website">Website URL *</label>
          <input
            id="website"
            type="url"
            {...register('website')}
            className={errors.website ? 'error' : ''}
            placeholder="https://example.com"
          />
          {errors.website && <span className="error-text">{errors.website.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          {...register('category')}
          className={errors.category ? 'error' : ''}
        >
          <option value="">Select a category</option>
          <option value="Frontend Framework">Frontend Framework</option>
          <option value="Backend Framework">Backend Framework</option>
          <option value="Database">Database</option>
          <option value="Programming Language">Programming Language</option>
          <option value="DevOps Tool">DevOps Tool</option>
          <option value="Testing Framework">Testing Framework</option>
          <option value="Cloud Service">Cloud Service</option>
          <option value="Other">Other</option>
        </select>
        {errors.category && <span className="error-text">{errors.category.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          {...register('description')}
          className={errors.description ? 'error' : ''}
          rows={4}
          placeholder="Describe what this technology is used for..."
        />
        {errors.description && <span className="error-text">{errors.description.message}</span>}
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
          {isLoading ? 'Saving...' : technology ? 'Update Technology' : 'Create Technology'}
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
- Sanitize URLs before displaying or using them

#### Performance
- Implement proper caching with React Query
- Use pagination for large technology lists (when implemented)
- Optimize image loading for technology icons
- Debounce search inputs
- Optimize re-renders with proper dependency arrays

#### User Experience
- Show loading states during API calls
- Provide clear error messages
- Implement optimistic updates where appropriate
- Add confirmation dialogs for destructive actions
- Use proper form validation with real-time feedback
- Show icon previews when entering URLs
- Provide category suggestions or dropdowns

#### Error Handling
- Implement global error boundaries
- Log errors for debugging (without sensitive data)
- Provide fallback UI for error states
- Handle network errors gracefully
- Validate URLs before submission

---

## API Testing Examples

### Using cURL

```bash
# Get all technologies
curl -X GET http://localhost:3000/api/v1/admin/technology \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json"

# Get technology by ID
curl -X GET http://localhost:3000/api/v1/admin/technology/64f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json"

# Create technology
curl -X POST http://localhost:3000/api/v1/admin/technology \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vue.js",
    "version": "3.3.0",
    "icon": "https://vuejs.org/logo.svg",
    "website": "https://vuejs.org",
    "description": "The Progressive JavaScript Framework",
    "category": "Frontend Framework",
    "status": "ACTIVE"
  }'

# Update technology
curl -X PUT http://localhost:3000/api/v1/admin/technology/64f1a2b3c4d5e6f7a8b9c0d1 \
  -H "Authorization: Bearer <admin_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "React",
    "version": "18.3.0",
    "icon": "https://reactjs.org/favicon.ico",
    "website": "https://reactjs.org",
    "description": "A JavaScript library for building user interfaces with improved performance",
    "category": "Frontend Framework",
    "status": "ACTIVE"
  }'

# Delete technology
curl -X DELETE http://localhost:3000/api/v1/admin/technology/64f1a2b3c4d5e6f7a8b9c0d1 \
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

5. **Test Script for Technology Endpoints**:
```javascript
// Test successful responses
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

// Test response structure for GET all technologies
if (pm.request.url.toString().includes("/admin/technology") && pm.request.method === "GET") {
    pm.test("Response is an array", function () {
        pm.expect(pm.response.json()).to.be.an('array');
    });

    pm.test("Each technology has required fields", function () {
        const technologies = pm.response.json();
        if (technologies.length > 0) {
            pm.expect(technologies[0]).to.have.property('id');
            pm.expect(technologies[0]).to.have.property('name');
            pm.expect(technologies[0]).to.have.property('version');
            pm.expect(technologies[0]).to.have.property('status');
        }
    });
}

// Test response structure for GET single technology
if (pm.request.url.toString().match(/\/admin\/technology\/[a-f0-9]{24}$/) && pm.request.method === "GET") {
    pm.test("Response has technology details", function () {
        const technology = pm.response.json();
        pm.expect(technology).to.have.property('id');
        pm.expect(technology).to.have.property('name');
        pm.expect(technology).to.have.property('version');
        pm.expect(technology).to.have.property('icon');
        pm.expect(technology).to.have.property('website');
    });
}

// Test URL validation
if (pm.request.method === "POST" || pm.request.method === "PUT") {
    pm.test("URLs are valid format", function () {
        const requestBody = JSON.parse(pm.request.body.raw);
        if (requestBody.icon) {
            pm.expect(requestBody.icon).to.match(/^https?:\/\/.+/);
        }
        if (requestBody.website) {
            pm.expect(requestBody.website).to.match(/^https?:\/\/.+/);
        }
    });
}
```

---

## Common Use Cases and Workflows

### 1. Technology Management Workflow

```typescript
// Complete technology management workflow
class TechnologyManagementWorkflow {
  async createNewTechnology(technologyData: CreateTechnologyRequest) {
    try {
      // 1. Validate URLs
      await this.validateUrls(technologyData.icon, technologyData.website);

      // 2. Check if technology name is unique
      const existingTechnologies = await getAllTechnologies();
      const nameExists = existingTechnologies.some(
        tech => tech.name.toLowerCase() === technologyData.name.toLowerCase()
      );
      if (nameExists) {
        throw new Error('Technology name already exists');
      }

      // 3. Create technology
      await createTechnology(technologyData);

      return { success: true, message: 'Technology created successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateTechnologyVersion(technologyId: string, newVersion: string) {
    try {
      // 1. Get current technology
      const technology = await getTechnologyById(technologyId);

      // 2. Update version
      await updateTechnology(technologyId, {
        ...technology,
        version: newVersion
      });

      return { success: true, message: 'Technology version updated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deprecateTechnology(technologyId: string) {
    try {
      // 1. Check if technology has active employees
      const employees = await getEmployeesByTechnology(technologyId);
      const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE');

      if (activeEmployees.length > 0) {
        return {
          success: false,
          warning: `Technology is used by ${activeEmployees.length} active employees. Consider reassigning before deprecating.`,
          employees: activeEmployees
        };
      }

      // 2. Update technology status
      const technology = await getTechnologyById(technologyId);
      await updateTechnology(technologyId, {
        ...technology,
        status: 'INACTIVE'
      });

      return { success: true, message: 'Technology deprecated successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  private async validateUrls(...urls: string[]) {
    const urlValidation = urls.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
      } catch {
        return false;
      }
    });

    const results = await Promise.all(urlValidation);
    if (results.some(result => !result)) {
      throw new Error('One or more URLs are not accessible');
    }
  }
}
```

### 2. Integration with Employee Management

```typescript
// Technology-Employee integration patterns
export const useTechnologyEmployeeIntegration = () => {
  const { data: technologies } = useTechnologies();
  const { data: employees } = useEmployees();

  // Get active technologies for employee assignment
  const getActiveTechnologiesForAssignment = () => {
    return technologies?.filter(tech => tech.status === 'ACTIVE') || [];
  };

  // Get employees by technology
  const getEmployeesByTechnology = (technologyId: string) => {
    return employees?.filter(emp =>
      emp.technologies.includes(technologyId)
    ) || [];
  };

  // Get technology usage statistics
  const getTechnologyUsageStats = () => {
    if (!technologies || !employees) return [];

    return technologies.map(tech => ({
      ...tech,
      employeeCount: getEmployeesByTechnology(tech.id).length,
      activeEmployeeCount: getEmployeesByTechnology(tech.id)
        .filter(emp => emp.status === 'ACTIVE').length
    }));
  };

  // Check if technology can be deleted
  const canDeleteTechnology = (technologyId: string) => {
    const technologyEmployees = getEmployeesByTechnology(technologyId);
    return technologyEmployees.length === 0;
  };

  // Get technology recommendations for employee
  const getTechnologyRecommendations = (employeeId: string) => {
    const employee = employees?.find(emp => emp.id === employeeId);
    if (!employee) return [];

    // Get technologies used by employees in same department/position
    const similarEmployees = employees?.filter(emp =>
      emp.department === employee.department &&
      emp.position === employee.position &&
      emp.id !== employeeId
    ) || [];

    const recommendedTechIds = new Set<string>();
    similarEmployees.forEach(emp => {
      emp.technologies.forEach(techId => {
        if (!employee.technologies.includes(techId)) {
          recommendedTechIds.add(techId);
        }
      });
    });

    return technologies?.filter(tech =>
      recommendedTechIds.has(tech.id) && tech.status === 'ACTIVE'
    ) || [];
  };

  return {
    getActiveTechnologiesForAssignment,
    getEmployeesByTechnology,
    getTechnologyUsageStats,
    canDeleteTechnology,
    getTechnologyRecommendations,
  };
};

### 3. Technology Categories Management

```typescript
// Technology categories helper
export const useTechnologyCategories = () => {
  const { data: technologies } = useTechnologies();

  // Get all unique categories
  const getCategories = () => {
    if (!technologies) return [];

    const categories = new Set(technologies.map(tech => tech.category));
    return Array.from(categories).sort();
  };

  // Get technologies by category
  const getTechnologiesByCategory = (category: string) => {
    return technologies?.filter(tech => tech.category === category) || [];
  };

  // Get category statistics
  const getCategoryStats = () => {
    const categories = getCategories();

    return categories.map(category => ({
      name: category,
      count: getTechnologiesByCategory(category).length,
      activeCount: getTechnologiesByCategory(category)
        .filter(tech => tech.status === 'ACTIVE').length
    }));
  };

  // Suggest category based on technology name
  const suggestCategory = (technologyName: string): string => {
    const name = technologyName.toLowerCase();

    if (name.includes('react') || name.includes('vue') || name.includes('angular')) {
      return 'Frontend Framework';
    }
    if (name.includes('node') || name.includes('express') || name.includes('django')) {
      return 'Backend Framework';
    }
    if (name.includes('mongo') || name.includes('postgres') || name.includes('mysql')) {
      return 'Database';
    }
    if (name.includes('docker') || name.includes('kubernetes') || name.includes('jenkins')) {
      return 'DevOps Tool';
    }
    if (name.includes('jest') || name.includes('cypress') || name.includes('selenium')) {
      return 'Testing Framework';
    }
    if (name.includes('aws') || name.includes('azure') || name.includes('gcp')) {
      return 'Cloud Service';
    }

    return 'Other';
  };

  return {
    getCategories,
    getTechnologiesByCategory,
    getCategoryStats,
    suggestCategory,
  };
};
```

---

## Conclusion

This documentation provides a complete guide for integrating with the Technology Management API. The system supports full CRUD operations for organizational technologies with proper validation, error handling, and business logic enforcement.

Key features:
- Complete technology lifecycle management
- URL validation for icons and websites
- Status-based technology management
- Employee-technology relationship tracking
- Category-based organization
- Soft delete functionality
- Comprehensive error handling
- Admin-level security

**Important Notes:**
- ⚠️ The current backend implementation has bugs in the PUT and DELETE routes (missing path parameters)
- Technologies are linked to employees through a many-to-many relationship
- Icon URLs are processed through a file parsing utility for display
- All operations require admin-level authentication

For any questions or issues, please refer to the error codes section or contact the development team.
```
