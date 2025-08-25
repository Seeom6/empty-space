# Privilege System API Documentation

## Overview

This document provides comprehensive API documentation for the Privilege System. The privilege system is a core component of the Role-Based Access Control (RBAC) implementation, managing permissions and access control throughout the application. The system is primarily read-only, with privileges being predefined and managed through the role system.

## Base URL Structure

```
Admin Privilege Management: /admin/privilege/*
```

## System Architecture

The privilege system is the foundation of the RBAC implementation and integrates with:
- **Role System**: Privileges are embedded within roles
- **Authentication System**: Privileges are checked during authorization
- **Account System**: User privileges are derived from their assigned roles
- **Invite Code System**: Privileges can be assigned through invite codes
- **All Protected Endpoints**: Use privilege-based access control

## Privilege System Design

### Core Concepts

1. **Privileges**: Atomic permissions that define what actions can be performed
2. **Privilege Keys**: Unique identifiers for each privilege (enum-based)
3. **Built-in Roles**: Predefined role categories that group related privileges
4. **Localization**: Multi-language support for privilege names and descriptions
5. **Policy Guards**: Runtime privilege validation for endpoint access

### RBAC Flow

```
User → Role → Privileges → Access Control → Endpoint Access
```

1. **User Assignment**: Users are assigned roles during registration or by admins
2. **Role Definition**: Roles contain a collection of privileges
3. **Privilege Validation**: Guards check user privileges against required permissions
4. **Access Control**: Allow/deny access based on privilege validation

---

## Privilege Endpoints

### 1. Get All Privileges

**Endpoint**: `GET /admin/privilege`

**Description**: Retrieve all system privileges grouped by built-in role categories.

**Authentication**: Required - Admin access token with privilege validation

**Required Privileges**: 
- `createOperator` OR `createRole`

**Request Headers**:
```http
Authorization: Bearer <admin_access_token>
Accept-Language: en|ar (optional, defaults to 'en')
```

**Query Parameters**: None

**Success Response** (200):
```json
{
  "data": [
    {
      "name": "Role Management",
      "privileges": [
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b1",
          "action": "Create Role",
          "description": "Ability to create new roles in the system"
        },
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b2",
          "action": "View Role",
          "description": "Ability to view existing roles"
        },
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "action": "Update Role",
          "description": "Ability to modify existing roles"
        },
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b4",
          "action": "Delete Role",
          "description": "Ability to delete roles from the system"
        }
      ]
    },
    {
      "name": "Operator Management",
      "privileges": [
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b5",
          "action": "Create Operator",
          "description": "Ability to create new operators"
        },
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b6",
          "action": "View Operator",
          "description": "Ability to view operator information"
        },
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b7",
          "action": "Update Operator",
          "description": "Ability to modify operator details"
        },
        {
          "id": "60f7b3b3b3b3b3b3b3b3b3b8",
          "action": "Delete Operator",
          "description": "Ability to remove operators"
        }
      ]
    }
  ]
}
```

**Response Structure**:
- `data`: Array of privilege groups
  - `name`: Built-in role category name (localized)
  - `privileges`: Array of privileges in this category
    - `id`: Unique privilege identifier (MongoDB ObjectId)
    - `action`: Human-readable privilege action name (localized)
    - `description`: Detailed privilege description (localized)

**Error Responses**:
- **403 Forbidden** - Insufficient privileges:
```json
{
  "error": {
    "path": "/admin/privilege",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "You are not allowed to access this resource",
    "code": 5001,
    "errorType": "Policies Guard"
  }
}
```

- **401 Unauthorized** - Invalid or missing token:
```json
{
  "error": {
    "path": "/admin/privilege",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Access token not exist",
    "code": 4013,
    "errorType": "AUTH_ERROR"
  }
}
```

**Notes**:
- Privileges are grouped by `builtInRoleName` for better organization
- Response is localized based on `Accept-Language` header
- Only users with `createOperator` OR `createRole` privileges can access this endpoint
- Privileges are read-only and cannot be created/modified through API

---

## Data Models

### Privilege Schema

```typescript
interface Privilege {
  _id: ObjectId;                           // Unique identifier
  key: PrivilegeKey;                       // Enum-based privilege key
  privilegeActionName: LocalizableString; // Localized action name
  privilegeAction: string;                 // Action identifier
  builtInRoleName: LocalizableString;      // Localized role category
  description: LocalizableString;          // Localized description
  createdAt: Date;                         // Auto-generated
  updatedAt: Date;                         // Auto-generated
}
```

### Privilege Keys Enum

```typescript
enum PrivilegeKeys {
  // Role Management
  createRole = "createRole",
  viewRole = "viewRole", 
  updateRole = "updateRole",
  deleteRole = "deleteRole",
  
  // Operator Management
  createOperator = "createOperator",
  viewOperator = "viewOperator",
  updateOperator = "updateOperator",
  deleteOperator = "deleteOperator"
}
```

### Localizable String Structure

```typescript
interface LocalizableString {
  en: string;  // English text
  ar: string;  // Arabic text
}
```

---

## RBAC Integration

### Privilege Validation Decorators

The system provides several decorators for privilege-based access control:

#### 1. @PrivilegePolicy Decorator

```typescript
@PrivilegePolicy({
  privilegeKeys: [PrivilegeKeys.createRole],
  policyAccessMode?: ['create', 'update'] // Optional action modes
})
```

#### 2. HTTP Method Decorators with Privileges

```typescript
@GetPrivilege({
  apiUrl: '',
  privilegeKeys: [PrivilegeKeys.viewRole]
})

@PostPrivilege({
  apiUrl: '',
  privilegeKeys: [PrivilegeKeys.createRole]
})

@PatchPrivilege({
  apiUrl: ':id',
  privilegeKeys: [PrivilegeKeys.updateRole]
})

@DeletePrivilege({
  apiUrl: ':id', 
  privilegeKeys: [PrivilegeKeys.deleteRole]
})
```

### Policy Guards

#### 1. PoliciesGuard
- Validates both privilege keys AND action modes
- Used when specific actions within a privilege are required
- Checks `user.privileges[privilegeKey][actionMode]`

#### 2. PoliciesGuardNoActions
- Validates only privilege keys
- Used when any access to the privilege is sufficient
- Checks `user.privileges[privilegeKey]`

### User Privilege Structure

When a user is authenticated, their privileges are structured as:

```typescript
interface UserPrivileges {
  [privilegeKey: string]: {
    [actionMode: string]: boolean;
  } | boolean;
}

// Example:
{
  "createRole": {
    "create": true,
    "update": true,
    "delete": false
  },
  "viewRole": true
}
```

---

## Integration with Other Systems

### Role System Integration

- **Role Creation**: Requires privilege IDs to assign to roles
- **Role Updates**: Can modify privilege assignments
- **Role Validation**: Validates privilege IDs exist before assignment

### Authentication System Integration

- **Token Payload**: Contains user privileges derived from roles
- **Authorization**: Guards validate privileges on protected endpoints
- **Cache Management**: User privileges cached in Redis for performance

### Invite Code System Integration

- **Code Creation**: Invite codes can specify privilege assignments
- **Employee Registration**: Privileges assigned through invite codes

---

## Error Codes Reference

| Code | Message | Description | HTTP Status |
|------|---------|-------------|-------------|
| 5001 | You are not allowed to access this resource | Insufficient privileges | 403 |
| 4013 | Access token not exist | No admin token provided | 401 |
| 12000 | Privilege not found | Privilege ID doesn't exist | 400 |
| 12001 | Privilege already exists | Duplicate privilege (system-level) | 400 |

---

## Security Considerations

### Access Control
- **Admin-only Access**: All privilege endpoints require admin authentication
- **Privilege Validation**: Specific privileges required for access
- **Token Validation**: JWT tokens validated through guards

### Data Integrity
- **Read-only System**: Privileges cannot be modified through API
- **Enum Validation**: Privilege keys validated against predefined enum
- **Localization**: Multi-language support with fallback mechanisms

### Performance
- **Caching**: User privileges cached in Redis
- **Grouping**: Privileges grouped by role for efficient retrieval
- **Lean Queries**: Database queries optimized for read operations

---

## Localization Support

### Supported Languages
- **English (en)**: Default language
- **Arabic (ar)**: Secondary language

### Localized Fields
- `privilegeActionName`: Action display name
- `builtInRoleName`: Role category name
- `description`: Privilege description

### Language Selection
- **Header**: `Accept-Language: en|ar`
- **Default**: English if header not provided
- **Fallback**: English if requested language not available

---

## Usage Examples

### Getting All Privileges
```bash
curl -X GET /admin/privilege \
  -H "Authorization: Bearer <admin_token>" \
  -H "Accept-Language: en"
```

### Using Privileges in Role Creation
```bash
curl -X POST /admin/role \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": {"en": "Content Manager", "ar": "مدير المحتوى"},
    "privileges": ["60f7b3b3b3b3b3b3b3b3b3b1", "60f7b3b3b3b3b3b3b3b3b3b2"]
  }'
```

---

## Best Practices

### Privilege Management
- **Principle of Least Privilege**: Assign minimum required privileges
- **Regular Audits**: Review privilege assignments periodically
- **Documentation**: Maintain clear privilege descriptions

### Integration
- **Consistent Validation**: Use provided decorators for privilege checks
- **Error Handling**: Handle privilege errors gracefully
- **Caching**: Leverage Redis caching for performance

### Development
- **Enum Usage**: Always use PrivilegeKeys enum for consistency
- **Localization**: Provide translations for all privilege text
- **Testing**: Test privilege validation thoroughly

---

## System Limitations

### Current Constraints
- **Read-only API**: No endpoints for creating/modifying privileges
- **Fixed Privilege Set**: Privileges are predefined in the system
- **Limited Languages**: Only English and Arabic supported
- **No Hierarchical Privileges**: Flat privilege structure

### Future Considerations
- **Dynamic Privileges**: Ability to create custom privileges
- **Privilege Hierarchies**: Parent-child privilege relationships
- **Additional Languages**: Support for more localization options
- **Audit Logging**: Track privilege usage and changes
