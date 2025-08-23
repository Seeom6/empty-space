# RESTful API Client Implementation

A comprehensive, production-ready API client for the Technologies, Positions, and Departments management systems built with React, TypeScript, TanStack Query, and Axios.

## 🚀 Features

- **Complete CRUD Operations** for all three systems
- **Type-Safe** with full TypeScript support
- **TanStack Query Integration** for caching, background updates, and optimistic updates
- **Comprehensive Error Handling** with specific error codes and user-friendly messages
- **JWT Authentication** with automatic token management
- **Optimistic Updates** for better UX
- **Background Refetching** and cache invalidation
- **Production-Ready** with proper error boundaries and retry logic

## 📁 Project Structure

```
src/lib/api/
├── types/
│   └── index.ts              # TypeScript interfaces and types
├── services/
│   ├── technologyService.ts  # Technology API service
│   ├── departmentService.ts  # Department API service
│   └── positionService.ts    # Position API service
├── hooks/
│   ├── useTechnology.ts      # Technology React Query hooks
│   ├── useDepartment.ts      # Department React Query hooks
│   └── usePosition.ts        # Position React Query hooks
├── client.ts                 # Axios HTTP client configuration
├── queryClient.ts            # TanStack Query client setup
├── index.ts                  # Main exports
└── README.md                 # This file
```

## 🛠 Installation & Setup

### 1. Install Dependencies

```bash
npm install @tanstack/react-query axios react-hot-toast
# or
yarn add @tanstack/react-query axios react-hot-toast
```

### 2. Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:12001
```

### 3. Setup Query Client Provider

```tsx
// app/layout.tsx or pages/_app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/api/queryClient';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### 4. Authentication Setup

```tsx
// Set JWT token (usually after login)
import { setAuthToken } from './lib/api';

const handleLogin = async (credentials) => {
  const response = await loginAPI(credentials);
  const token = response.data.accessToken;
  
  // Store token and configure API client
  localStorage.setItem('auth_token', token);
  setAuthToken(token);
};
```

## 📖 Usage Examples

### Technology System

```tsx
import React from 'react';
import {
  useTechnologies,
  useTechnologyStatistics,
  useCreateTechnology,
  useUpdateTechnology,
  useDeleteTechnology,
  CreateTechnologyRequest
} from './lib/api';

const TechnologyManager: React.FC = () => {
  // Queries
  const { data: technologies, isLoading, error } = useTechnologies();
  const { data: stats } = useTechnologyStatistics();
  
  // Mutations
  const createMutation = useCreateTechnology();
  const updateMutation = useUpdateTechnology();
  const deleteMutation = useDeleteTechnology();
  
  const handleCreate = () => {
    const newTech: CreateTechnologyRequest = {
      name: 'React',
      description: 'A JavaScript library for building user interfaces',
      icon: 'react-icon.png',
      website: 'https://reactjs.org',
      version: '18.2.0',
      category: 'Frontend Framework'
    };
    
    createMutation.mutate(newTech);
  };
  
  const handleUpdate = (id: string) => {
    updateMutation.mutate({
      id,
      data: {
        name: 'React',
        description: 'Updated description',
        status: 'ACTIVE',
        icon: 'react-icon.png',
        website: 'https://reactjs.org',
        version: '18.3.0',
        category: 'Frontend Framework'
      }
    });
  };
  
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Technologies ({stats?.count[0]?.count || 0})</h2>
      <button onClick={handleCreate}>Create Technology</button>
      
      {technologies?.map(tech => (
        <div key={tech.id}>
          <h3>{tech.name} v{tech.version}</h3>
          <p>{tech.description}</p>
          <button onClick={() => handleUpdate(tech.id)}>Update</button>
          <button onClick={() => handleDelete(tech.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};
```

### Department System

```tsx
import React from 'react';
import {
  useDepartments,
  useActiveDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  CreateDepartmentRequest
} from './lib/api';

const DepartmentManager: React.FC = () => {
  const { data: departments } = useDepartments();
  const { data: activeDepartments } = useActiveDepartments();
  
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();
  
  const handleCreate = () => {
    const newDept: CreateDepartmentRequest = {
      name: 'Engineering',
      description: 'Software development and engineering',
      status: 'ACTIVE'
    };
    
    createMutation.mutate(newDept);
  };
  
  return (
    <div>
      <h2>Departments</h2>
      <button onClick={handleCreate}>Create Department</button>
      
      {departments?.map(dept => (
        <div key={dept.id}>
          <h3>{dept.name}</h3>
          <p>{dept.description}</p>
          <span>Status: {dept.status}</span>
        </div>
      ))}
    </div>
  );
};
```

### Position System

```tsx
import React from 'react';
import {
  usePositions,
  usePositionsByDepartment,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
  CreatePositionRequest
} from './lib/api';

const PositionManager: React.FC = () => {
  const { data: positions } = usePositions();
  const { data: engineeringPositions } = usePositionsByDepartment('dept-id-123');
  
  const createMutation = useCreatePosition();
  
  const handleCreate = () => {
    const newPosition: CreatePositionRequest = {
      name: 'Senior Developer',
      departmentId: 'dept-id-123',
      description: 'Senior software developer position',
      status: 'ACTIVE'
    };
    
    createMutation.mutate(newPosition);
  };
  
  return (
    <div>
      <h2>Positions</h2>
      <button onClick={handleCreate}>Create Position</button>
      
      {positions?.map(position => (
        <div key={position.id}>
          <h3>{position.name}</h3>
          <p>{position.description}</p>
        </div>
      ))}
    </div>
  );
};
```

## 🔧 Advanced Usage

### Custom Error Handling

```tsx
import { useCreateTechnology, ApiError, ErrorCodes } from './lib/api';

const MyComponent = () => {
  const createMutation = useCreateTechnology({
    onError: (error: ApiError) => {
      switch (error.code) {
        case ErrorCodes.TECHNOLOGY_ALREADY_EXISTS:
          // Handle duplicate technology
          break;
        case ErrorCodes.VALIDATION_ERROR:
          // Handle validation errors
          break;
        default:
          // Handle other errors
      }
    }
  });
};
```

### Search and Filtering

```tsx
import { useSearchTechnologies, useTechnologiesByCategory } from './lib/api';

const SearchExample = () => {
  const [query, setQuery] = useState('');
  const { data: searchResults } = useSearchTechnologies(query);
  const { data: frontendTechs } = useTechnologiesByCategory('Frontend Framework');
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search technologies..."
      />
      {searchResults?.map(tech => (
        <div key={tech.id}>{tech.name}</div>
      ))}
    </div>
  );
};
```

### Optimistic Updates

```tsx
import { useUpdateTechnology, queryClient } from './lib/api';

const OptimisticUpdate = () => {
  const updateMutation = useUpdateTechnology({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['technology', 'detail', variables.id]);
      
      // Snapshot previous value
      const previousTech = queryClient.getQueryData(['technology', 'detail', variables.id]);
      
      // Optimistically update
      queryClient.setQueryData(['technology', 'detail', variables.id], {
        ...previousTech,
        ...variables.data
      });
      
      return { previousTech };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTech) {
        queryClient.setQueryData(['technology', 'detail', variables.id], context.previousTech);
      }
    }
  });
};
```

## 🚨 Error Handling

The API client provides comprehensive error handling with specific error codes:

### Technology Errors
- `90000`: Technology not found
- `90001`: Technology already exists

### Department Errors
- `10000`: Department not found
- `10001`: Department already exists
- `10002`: Department has positions (cannot delete)
- `10003`: Department has employees (cannot delete)

### Position Errors
- `11000`: Position not found
- `11001`: Position already exists

### Common Errors
- `70000`: Validation error
- `401`: Unauthorized
- `403`: Forbidden
- `500`: Server error

## 🎯 Best Practices

1. **Always handle loading states** in your components
2. **Use optimistic updates** for better UX
3. **Implement proper error boundaries** for error handling
4. **Cache frequently accessed data** like departments and technologies
5. **Use search and filtering hooks** for better performance
6. **Implement retry logic** for failed requests
7. **Clear cache on logout** to prevent stale data

## 🔍 Debugging

Enable React Query DevTools in development:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to your app
<ReactQueryDevtools initialIsOpen={false} />
```

## 📝 API Documentation Reference

This implementation is based on the complete API documentation found in `API_Documentation_Systems.md`. All endpoints, request/response formats, and error codes are implemented according to the documented specifications.

## 🤝 Contributing

When adding new endpoints or modifying existing ones:

1. Update the types in `types/index.ts`
2. Add/modify service methods
3. Create/update React Query hooks
4. Update this README with examples
5. Test all CRUD operations
6. Ensure error handling is comprehensive
