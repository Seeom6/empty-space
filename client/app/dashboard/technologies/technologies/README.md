# Technologies Management - API Integration

This document explains how the Technologies management system has been updated to integrate with the backend API.

## Overview

The Technologies management system has been updated to use the real API client instead of mock data. All CRUD operations now connect to the backend API endpoints.

## Key Changes Made

### 1. Updated API Integration
- **File**: `hooks/useTechnologies.ts`
- **Changes**: Replaced mock data with real API calls using our API client
- **Features**: 
  - Real-time data fetching from `/admin/technology` endpoints
  - Proper error handling with specific error codes
  - Loading states for all operations
  - Automatic cache invalidation and refetching

### 2. Authentication Requirements
- **Requirement**: All technology operations require `SUPER_ADMIN` role
- **Files Updated**: 
  - `utils.ts` - Updated permission functions
  - `page.tsx` - Set userRole to "SUPER_ADMIN"
- **API Endpoints**: All require JWT authentication with SUPER_ADMIN role

### 3. Data Structure Mapping
- **API Format**: Uses the documented API response structure
- **Dashboard Format**: Maintains existing dashboard component structure
- **Conversion**: Helper functions convert between API and dashboard formats

## API Endpoints Integrated

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| Statistics | GET | `/admin/technology` | Get technology statistics |
| List All | GET | `/admin/technology/all` | Get all technologies |
| Get by ID | GET | `/admin/technology/:id` | Get specific technology |
| Create | POST | `/admin/technology` | Create new technology |
| Update | PUT | `/admin/technology/:id` | Update technology |
| Delete | DELETE | `/admin/technology/:id` | Soft delete technology |

## Error Handling

The system now handles all documented error scenarios:

- **90000**: Technology not found
- **90001**: Technology already exists  
- **70000**: Validation errors
- **401/403**: Authentication/authorization errors
- **Network errors**: Connection and timeout issues

## Data Flow

1. **Loading**: Components show loading states while fetching data
2. **Display**: API data is converted to dashboard format for display
3. **Actions**: User actions are converted to API format and sent to backend
4. **Updates**: Successful operations trigger cache refresh and UI updates
5. **Errors**: Failed operations show user-friendly error messages

## Authentication Setup

To use the Technologies management system:

1. **Login**: User must be authenticated with SUPER_ADMIN role
2. **Token**: JWT token is automatically included in API requests
3. **Permissions**: All technology operations require SUPER_ADMIN role

## Usage Example

```tsx
// The page automatically handles authentication
const TechnologiesPage = () => {
  const userRole = "SUPER_ADMIN"; // Required for all operations
  
  return (
    <TechnologiesManagement userRole={userRole} />
  );
};
```

## Component Structure

```
technologies/
├── page.tsx                     # Main page component
├── TechnologiesManagement.tsx   # Main management component
├── hooks/
│   └── useTechnologies.ts       # API integration hook
├── components/
│   ├── TechnologyCard.tsx       # Individual technology display
│   ├── TechnologyStats.tsx      # Statistics display
│   └── ...                     # Other UI components
└── utils.ts                     # Permission and utility functions
```

## Testing

To test the integration:

1. **Start Backend**: Ensure the backend server is running on the configured port
2. **Authentication**: Login with a SUPER_ADMIN account
3. **Operations**: Test all CRUD operations through the UI
4. **Error Cases**: Test with invalid data to verify error handling

## Configuration

The API client is configured to connect to:
- **Base URL**: `http://localhost:12001/api/v1`
- **Authentication**: JWT Bearer token
- **Timeout**: 10 seconds
- **Retry Logic**: Automatic retry for server errors

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live updates
2. **Bulk Operations**: Support for bulk create/update/delete
3. **Advanced Filtering**: More sophisticated search and filter options
4. **Audit Trail**: Track who made what changes when
5. **File Upload**: Direct icon upload functionality
