# Postman Collection: Employee Management Systems API

## Overview

This Postman collection provides comprehensive testing for the Technologies, Departments, and Positions management systems. It includes all CRUD operations, error testing scenarios, and automated test scripts.

## Collection Structure

### 📁 **Authentication**
- **Admin Login** - Authenticates and sets JWT token automatically

### 📁 **Technologies** 
- Get Technology Statistics
- Get All Technologies  
- Create Technology
- Get Technology by ID
- Update Technology
- Delete Technology (Soft Delete)

### 📁 **Departments**
- Get All Departments
- Create Department
- Get Department by ID
- Update Department
- Delete Department

### 📁 **Positions**
- Get All Positions
- Create Position
- Get Position by ID
- Update Position
- Delete Position (Soft Delete)

### 📁 **Error Testing**
- Test Technology Already Exists
- Test Invalid Department ID for Position
- Test Validation Error - Missing Required Fields

## Setup Instructions

### 1. Import Collection
1. Open Postman
2. Click **Import** button
3. Select `Postman_Collection_Systems.json`
4. Collection will be imported with all requests and tests

### 2. Configure Environment Variables

The collection uses the following variables (automatically managed):

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:5000` |
| `authToken` | JWT authentication token | Auto-set after login |
| `departmentId` | Department ID for testing | Auto-set after creation |
| `positionId` | Position ID for testing | Auto-set after creation |
| `technologyId` | Technology ID for testing | Auto-set after creation |

### 3. Update Login Credentials

Before running the collection, update the login credentials in the **Admin Login** request:

```json
{
  "email": "your-admin-email@example.com",
  "password": "your-admin-password"
}
```

## Running the Collection

### Option 1: Manual Testing
1. Start with **Authentication → Admin Login**
2. Run any individual request
3. Check the **Test Results** tab for automated validations

### Option 2: Collection Runner
1. Click **Run Collection** button
2. Select all folders or specific ones
3. Set iterations and delay if needed
4. Click **Run Employee Management Systems API**

### Option 3: Automated Testing Sequence
**Recommended order for full testing:**

1. **Authentication → Admin Login**
2. **Departments → Create Department**
3. **Departments → Get All Departments**
4. **Departments → Get Department by ID**
5. **Departments → Update Department**
6. **Technologies → Create Technology**
7. **Technologies → Get All Technologies**
8. **Technologies → Get Technology by ID**
9. **Technologies → Update Technology**
10. **Positions → Create Position** (uses departmentId)
11. **Positions → Get All Positions**
12. **Positions → Get Position by ID**
13. **Positions → Update Position**
14. **Error Testing → All error scenarios**
15. **Cleanup: Delete Position, Technology, Department**

## Test Automation Features

### Automatic Token Management
```javascript
// Login request automatically sets token
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set('authToken', response.accessToken);
}
```

### ID Extraction and Storage
```javascript
// Automatically stores created resource IDs
if (pm.response.code === 200 || pm.response.code === 201) {
    const response = pm.response.json();
    if (response.id || response._id) {
        pm.collectionVariables.set('departmentId', response.id || response._id);
    }
}
```

### Response Validation
```javascript
// Validates response structure and data
pm.test('Response has department details', function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('name');
    pm.expect(response).to.have.property('id');
});
```

## Error Testing Scenarios

### 1. Duplicate Resource Creation
- **Test**: Create technology with existing name
- **Expected**: HTTP 400 with error code 90001
- **Validates**: Business logic constraints

### 2. Invalid Foreign Key References
- **Test**: Create position with invalid departmentId
- **Expected**: HTTP 400 with department not found error
- **Validates**: Referential integrity

### 3. Validation Errors
- **Test**: Create department without required name field
- **Expected**: HTTP 400 with validation error code 70000
- **Validates**: Input validation

## Expected Response Formats

### Success Response
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Engineering",
  "description": "Software development department",
  "status": "ACTIVE"
}
```

### Error Response
```json
{
  "error": {
    "path": "/admin/department",
    "time": "2024-01-15T10:30:00.000Z",
    "message": "Department already exists",
    "code": 10001,
    "errorType": "DEPARTMENT_ERROR"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failures
- **Problem**: 401 Unauthorized responses
- **Solution**: Run **Admin Login** request first
- **Check**: Verify credentials in login request body

#### 2. Missing Environment Variables
- **Problem**: Variables like `{{departmentId}}` not resolved
- **Solution**: Run creation requests first to populate variables
- **Check**: Collection Variables tab shows populated values

#### 3. Server Connection Issues
- **Problem**: Connection refused errors
- **Solution**: Verify server is running on `http://localhost:5000`
- **Check**: Update `baseUrl` variable if using different port

#### 4. Test Failures
- **Problem**: Automated tests failing
- **Solution**: Check response format matches expected structure
- **Check**: Console logs for detailed error information

### Debug Tips

1. **Enable Console Logging**
   ```javascript
   console.log('Response:', pm.response.json());
   ```

2. **Check Variable Values**
   ```javascript
   console.log('Department ID:', pm.collectionVariables.get('departmentId'));
   ```

3. **Validate Token**
   ```javascript
   console.log('Auth Token:', pm.collectionVariables.get('authToken'));
   ```

## Collection Maintenance

### Adding New Endpoints
1. Create new request in appropriate folder
2. Add authentication header: `Bearer {{authToken}}`
3. Include test scripts for validation
4. Update this README with new endpoint details

### Updating Test Scripts
- Modify `event.listen.test.script.exec` arrays
- Follow existing patterns for consistency
- Include both positive and negative test cases

### Environment Management
- Keep sensitive data in environment variables
- Use collection variables for test data
- Clear variables after testing if needed

## Integration with CI/CD

### Newman (Command Line)
```bash
# Install Newman
npm install -g newman

# Run collection
newman run Postman_Collection_Systems.json \
  --environment your-environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

### GitHub Actions Example
```yaml
- name: Run API Tests
  run: |
    newman run API_DOC/Postman_Collection_Systems.json \
      --reporters cli,junit \
      --reporter-junit-export test-results.xml
```

## Support

For issues or questions:
1. Check server logs for backend errors
2. Verify API documentation matches collection
3. Test individual requests before running full collection
4. Check Postman console for detailed error messages
