# Position Management API Documentation

This directory contains comprehensive documentation for the Position Management API, including detailed API specifications and a complete Postman collection for testing.

## 📁 Files Overview

### 1. `position-api.md`
Complete API documentation including:
- **Endpoint specifications** with HTTP methods, URLs, and parameters
- **Authentication and authorization** requirements
- **Request/response schemas** with detailed field descriptions
- **Error handling** with specific error codes and messages
- **Validation rules** for all input fields
- **Complete examples** for all operations

### 2. `position-postman-collection.json`
Ready-to-use Postman collection featuring:
- **Pre-configured requests** for all API endpoints
- **Environment variables** for easy configuration
- **Automated tests** to validate responses
- **Error handling examples** for common failure scenarios
- **Data validation tests** for edge cases

## 🚀 Quick Start

### Prerequisites
1. **Backend server** running on `http://localhost:3000` (or update baseUrl)
2. **Valid JWT token** for authentication
3. **Existing department** in the system for position creation

### Using the Postman Collection

1. **Import the collection:**
   ```
   File → Import → Upload Files → Select position-postman-collection.json
   ```

2. **Set up environment variables:**
   - `baseUrl`: Your API base URL (default: `http://localhost:3000`)
   - `accessToken`: Your JWT authentication token
   - `departmentId`: Valid department ID for testing
   - `positionId`: Valid position ID for testing

3. **Run the collection:**
   - Individual requests: Click and send
   - Full test suite: Collection Runner → Run all tests

### Authentication Setup

The API uses JWT authentication via cookies. To get your access token:

1. **Login via the auth endpoint** (not included in this collection)
2. **Extract the JWT token** from the response or browser cookies
3. **Set the `accessToken` variable** in your Postman environment

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/position` | Get all positions | ✅ |
| GET | `/admin/position/{id}` | Get position by ID | ✅ |
| POST | `/admin/position` | Create new position | ✅ |
| PUT | `/admin/position/{id}` | Update position | ✅ |
| DELETE | `/admin/position/{id}` | Delete position (soft) | ✅ |

## 🔐 Authorization

The Position API implements role-based access control:

- **super_admin**: Full access (CRUD operations)
- **admin**: Full access (CRUD operations)
- **employee**: Read-only access
- **operator**: Limited access (view, create, edit)

## 📊 Data Models

### Position Object
```json
{
  "id": "string",
  "name": "string (3-255 chars)",
  "departmentId": "string (ObjectId)",
  "description": "string (optional)",
  "status": "ACTIVE | INACTIVE",
  "isDeleted": "boolean"
}
```

### Position with Department (GET by ID)
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "ACTIVE | INACTIVE",
  "department": "string (department name)"
}
```

## ⚠️ Error Codes

| Code | Message | HTTP Status | Description |
|------|---------|-------------|-------------|
| 10000 | Department not found | 404 | Referenced department doesn't exist |
| 11000 | Position not found | 404 | Position with given ID doesn't exist |
| 11001 | Position already exists | 409 | Position name already taken |
| ACCESS_TOKEN_NOT_EXIST | Access token not exist | 403 | JWT authentication failed |

## 🧪 Testing Strategy

The Postman collection includes comprehensive tests:

### 1. **CRUD Operations**
- Create, read, update, delete positions
- Response validation
- Data integrity checks

### 2. **Error Handling**
- Invalid department references
- Non-existent position IDs
- Authentication failures
- Validation errors

### 3. **Data Validation**
- Minimum/maximum field lengths
- Required field validation
- Status enum validation
- ObjectId format validation

### 4. **Edge Cases**
- Minimum valid data
- Maximum length names
- Optional field handling

## 🔧 Configuration

### Environment Variables

```json
{
  "baseUrl": "http://localhost:3000",
  "accessToken": "your_jwt_token_here",
  "departmentId": "507f1f77bcf86cd799439012",
  "positionId": "507f1f77bcf86cd799439011"
}
```

### Pre-request Scripts

The collection includes automatic setup scripts that:
- Set default values for missing environment variables
- Validate required configurations
- Prepare test data

### Test Scripts

Each request includes automated tests that:
- Validate HTTP status codes
- Check response structure
- Verify data integrity
- Store dynamic values for subsequent requests

## 📝 Usage Examples

### Creating a Position
```bash
curl -X POST "http://localhost:3000/admin/position" \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your_jwt_token" \
  -d '{
    "name": "Software Engineer",
    "departmentId": "507f1f77bcf86cd799439012",
    "description": "Develops software applications",
    "status": "ACTIVE"
  }'
```

### Getting All Positions
```bash
curl -X GET "http://localhost:3000/admin/position" \
  -H "Cookie: accessToken=your_jwt_token"
```

## 🐛 Troubleshooting

### Common Issues

1. **403 Forbidden**
   - Check if JWT token is valid and not expired
   - Ensure token is set in Cookie header as `accessToken`

2. **404 Department Not Found**
   - Verify the departmentId exists in the system
   - Check if department is not soft-deleted

3. **409 Position Already Exists**
   - Position names must be unique
   - Check for existing positions with the same name

4. **400 Validation Error**
   - Ensure name is 3-255 characters
   - Verify departmentId is a valid ObjectId
   - Check status is either "ACTIVE" or "INACTIVE"

### Debug Tips

1. **Enable Postman Console** to see detailed request/response logs
2. **Check environment variables** are properly set
3. **Verify server is running** on the specified baseUrl
4. **Test authentication** with a simple GET request first

## 📚 Additional Resources

- **Backend Implementation**: `server/src/modules/position/`
- **Frontend Integration**: `client/lib/api/services/positionService.ts`
- **Database Schema**: MongoDB with Mongoose ODM
- **Authentication**: JWT with cookie-based storage

## 🤝 Contributing

When updating the API:

1. **Update the documentation** in `position-api.md`
2. **Add new requests** to the Postman collection
3. **Include test scripts** for validation
4. **Update error codes** and examples as needed
5. **Test thoroughly** with the complete collection

---

For questions or issues, please refer to the detailed API documentation in `position-api.md` or contact the development team.
