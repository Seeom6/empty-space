# Skeleton Loading Components

This directory contains skeleton loading components that provide better user experience during data loading and code splitting.

## Overview

Skeleton screens are placeholder components that mimic the layout and structure of the actual content while data is being loaded. They provide several benefits:

- **Better Perceived Performance**: Users see immediate visual feedback
- **Reduced Layout Shift**: Maintains consistent layout during loading
- **Professional Appearance**: More polished than simple spinners
- **Accessibility**: Better for screen readers than loading spinners

## Components

### SkeletonCard
Mimics the technology card layout with placeholder elements for:
- Technology icon and name
- Category badge
- Description text
- Version and status
- User count and date
- Action buttons

```tsx
import { SkeletonCard, SkeletonCardGrid } from './components/skeletons'

// Single card
<SkeletonCard />

// Grid of cards
<SkeletonCardGrid count={6} />
```

### SkeletonTable
Replicates the table structure with:
- All column headers
- Skeleton rows with proper cell structure
- Maintains table accessibility

```tsx
import { SkeletonTable } from './components/skeletons'

<SkeletonTable rows={5} />
```

### SkeletonStats
Provides placeholders for statistics cards:
- 4 main stat cards (Total, Active, Inactive, Deprecated)
- Most used technologies card
- Proper responsive grid layout

```tsx
import { SkeletonStats } from './components/skeletons'

<SkeletonStats />
```

### SkeletonFilters
Mimics the filter controls:
- Search input
- Category select
- Status select
- Clear filters button

```tsx
import { SkeletonFilters } from './components/skeletons'

<SkeletonFilters />
```

### SkeletonPage
Complete page skeleton that combines all components:
- Page header
- Statistics section
- Filters
- Content area (grid or table)

```tsx
import { SkeletonPage } from './components/skeletons'

<SkeletonPage viewMode="grid" />
<SkeletonPage viewMode="list" />
```

### SkeletonModal
Modal loading placeholder:
- Modal overlay
- Content skeleton
- Custom loading message

```tsx
import { SkeletonModal } from './components/skeletons'

<SkeletonModal title="Loading form..." />
```

### SkeletonTechnologyDetails
Detailed view skeleton for technology details modal:
- Header with icon and title
- Description area
- Details grid
- Action buttons

```tsx
import { SkeletonTechnologyDetails } from './components/skeletons'

<SkeletonTechnologyDetails />
```

## Design Principles

### 1. Layout Consistency
Skeleton components maintain the exact same layout as their real counterparts:
- Same grid systems
- Same spacing and padding
- Same responsive breakpoints

### 2. Visual Hierarchy
Skeleton elements reflect the visual importance of content:
- Larger elements for headings
- Smaller elements for secondary text
- Proper spacing between sections

### 3. Animation
All skeletons use the `animate-pulse` class for consistent animation:
- Subtle pulsing effect
- Indicates loading state
- Not distracting or overwhelming

### 4. Accessibility
Skeleton components are designed to be accessible:
- No interactive elements during loading
- Proper semantic structure
- Screen reader friendly

## Implementation Examples

### Basic Usage
```tsx
// In a component
const MyComponent = () => {
  const { data, isLoading } = useQuery('data', fetchData)
  
  if (isLoading) {
    return <SkeletonPage />
  }
  
  return <ActualContent data={data} />
}
```

### Conditional Skeletons
```tsx
// Different skeletons for different sections
const TechnologiesManagement = () => {
  const { technologies, isLoading } = useTechnologies()
  
  return (
    <div>
      {isLoading ? <SkeletonStats /> : <TechnologyStats />}
      {isLoading ? <SkeletonFilters /> : <TechnologyFilters />}
      {isLoading ? <SkeletonCardGrid /> : <TechnologiesGrid />}
    </div>
  )
}
```

### Dynamic Imports with Skeletons
```tsx
const LazyComponent = dynamic(
  () => import('./HeavyComponent'),
  {
    loading: () => <SkeletonModal title="Loading component..." />,
    ssr: false,
  }
)
```

## Customization

### Custom Styling
All skeleton components accept a `className` prop for customization:

```tsx
<SkeletonCard className="border-2 border-blue-200" />
<SkeletonStats className="mb-8" />
```

### Custom Counts
Grid components accept count parameters:

```tsx
<SkeletonCardGrid count={9} />
<SkeletonTable rows={10} />
```

### Custom Messages
Modal skeletons accept custom titles:

```tsx
<SkeletonModal title="Preparing your data..." />
```

## Performance Considerations

### 1. Lightweight Components
Skeleton components are designed to be lightweight:
- Minimal DOM elements
- CSS-only animations
- No JavaScript logic

### 2. Reusability
Components are highly reusable:
- Shared across different views
- Consistent appearance
- Easy to maintain

### 3. Bundle Size
Skeleton components add minimal bundle size:
- Simple HTML structure
- Tailwind CSS classes
- No external dependencies

## Testing

Skeleton components are fully tested:
- Rendering tests
- Accessibility tests
- Responsive design tests
- Animation tests

```bash
npm test -- SkeletonComponents.test.tsx
```

## Best Practices

### 1. Match Real Content
Ensure skeleton structure matches the actual content:
- Same number of elements
- Similar sizes and proportions
- Consistent spacing

### 2. Use Appropriate Skeletons
Choose the right skeleton for the context:
- `SkeletonPage` for initial page loads
- `SkeletonModal` for dynamic imports
- Specific skeletons for partial updates

### 3. Consistent Animation
Use the same animation across all skeletons:
- `animate-pulse` class
- Consistent timing
- Subtle effect

### 4. Accessibility
Ensure skeletons don't interfere with accessibility:
- No interactive elements
- Proper semantic structure
- Screen reader friendly

## Browser Support

Skeleton components work in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

CSS animations are gracefully degraded in older browsers.

## Future Enhancements

Potential improvements for skeleton components:
- Smart skeleton generation based on actual content
- Progressive skeleton loading
- Intersection observer for lazy skeleton loading
- Custom animation options
