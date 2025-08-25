# Technology Management System Tests

This directory contains comprehensive tests for the technology management system, including unit tests, integration tests, and component tests.

## Test Structure

```
__tests__/
├── components/           # Component tests
│   ├── TechnologiesList.test.tsx
│   ├── TechnologyStats.test.tsx
│   └── TechnologyFilters.test.tsx
├── hooks/               # Hook tests
│   └── useTechnologies.test.tsx
├── mocks/               # MSW mock handlers
│   ├── handlers.ts
│   └── server.ts
├── test-utils.tsx       # Test utilities and factories
├── utils.test.ts        # Utility function tests
└── README.md           # This file
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### CI Mode
```bash
npm run test:ci
```

## Test Coverage Goals

- **Overall Coverage**: 80% minimum
- **Technology Module**: 85% minimum
- **Critical Paths**: 90% minimum

## Test Categories

### 1. Unit Tests (`utils.test.ts`)
Tests all utility functions including:
- Filtering and sorting algorithms
- Data transformation functions
- Validation logic
- Permission checks
- Text utilities

### 2. Integration Tests (`hooks/useTechnologies.test.tsx`)
Tests the main business logic hook:
- API data fetching
- Error handling
- CRUD operations
- Data transformation pipeline
- Filter application

### 3. Component Tests
Tests React components:
- **TechnologiesList**: Table rendering, interactions, permissions
- **TechnologyStats**: Statistics display, responsive layout
- **TechnologyFilters**: Filter controls, search functionality

## Mock Data

The test suite uses MSW (Mock Service Worker) to mock API calls:
- Realistic API responses
- Error scenarios
- Edge cases
- Authentication flows

## Test Utilities

### Mock Factories
- `createMockTechnology()`: Creates realistic technology objects
- `createMockTechnologies()`: Creates arrays of technologies
- `createMockStats()`: Creates statistics objects
- `createMockFilters()`: Creates filter objects

### Test Helpers
- `createTestQueryClient()`: Creates React Query client for tests
- `mockConsoleMethod()`: Mocks console methods for testing
- `waitForLoadingToFinish()`: Utility for async operations

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Realistic Data**: Use mock factories for consistent test data
3. **Error Scenarios**: Test both success and failure cases
4. **Accessibility**: Test keyboard navigation and screen reader support
5. **Performance**: Test memoization and re-render behavior

## Debugging Tests

### Console Logging
Tests include console logging verification to ensure debugging information is properly displayed.

### MSW Debugging
To debug API mocking:
```javascript
server.use(
  http.get('/api/endpoint', () => {
    console.log('API call intercepted')
    return HttpResponse.json({ data: 'test' })
  })
)
```

### React Query Debugging
Enable React Query DevTools in tests:
```javascript
const queryClient = createTestQueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
})
```

## Common Issues

### 1. Async Operations
Always use `waitFor` for async operations:
```javascript
await waitFor(() => {
  expect(result.current.isLoading).toBe(false)
})
```

### 2. MSW Handlers
Ensure handlers are properly reset between tests:
```javascript
afterEach(() => {
  server.resetHandlers()
})
```

### 3. React Query Cache
Clear cache between tests:
```javascript
afterEach(() => {
  queryClient.clear()
})
```

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Use the provided mock factories
3. Test both happy path and error scenarios
4. Include accessibility tests
5. Maintain or improve coverage percentage
