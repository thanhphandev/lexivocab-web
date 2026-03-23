# Vocabulary Page - Refactored Architecture

## Overview
This vocabulary page has been refactored following DRY (Don't Repeat Yourself) principles and clean code standards from `.agents` guidelines.

## Structure

```
vocabulary/
├── _components/          # Presentational components
│   ├── vocabulary-header.tsx
│   ├── vocabulary-toolbar.tsx
│   ├── vocabulary-content.tsx
│   └── vocabulary-pagination.tsx
├── _hooks/              # Custom React hooks for logic
│   ├── use-vocabulary-data.ts
│   ├── use-tags-data.ts
│   ├── use-vocabulary-export.ts
│   └── use-debounced-search.ts
├── _types/              # Type definitions and schemas
│   └── vocabulary.schema.ts
├── page.tsx             # Main page component (orchestrator)
└── README.md            # This file
```

## Key Improvements

### 1. Separation of Concerns
- **Components**: Pure presentational components with no business logic
- **Hooks**: Encapsulated data fetching and state management
- **Types**: Zod schemas for runtime validation
- **Page**: Orchestrates components and hooks

### 2. DRY Principles Applied
- Extracted repeated logic into custom hooks
- Separated UI components for reusability
- Centralized type definitions with Zod schemas
- No hardcoded values - uses CSS variables from `globals.css`

### 3. Color System Integration
All components use CSS variables from `app/globals.css`:
- `text-foreground` / `text-muted-foreground`
- `bg-card` / `bg-background`
- `border-muted` / `border-primary`
- `text-primary` / `bg-primary/10`

This ensures:
- Consistent theming across light/dark modes
- Easy customization through CSS variables
- No hardcoded color values

### 4. Type Safety with Zod
```typescript
// vocabulary.schema.ts
export const vocabularyFilterSchema = z.object({
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(20),
  filter: z.enum(["all", "active", "archived"]).default("active"),
  tagFilter: z.string().default("all"),
});
```

### 5. Custom Hooks

#### `useVocabularyData`
Handles vocabulary fetching with filters
```typescript
const { data, isLoading, refetch } = useVocabularyData({
  search: debouncedSearch,
  page,
  pageSize: 20,
  filter,
  tagFilter,
});
```

#### `useTagsData`
Manages tags state and provides tag map
```typescript
const { tags, tagMap, refetchTags } = useTagsData();
```

#### `useDebouncedSearch`
Debounces search input to reduce API calls
```typescript
const { searchQuery, debouncedSearch, setSearchQuery } = useDebouncedSearch();
```

#### `useVocabularyExport`
Handles export functionality with proper error handling
```typescript
const { handleExport } = useVocabularyExport({ t, tErrors });
```

## Component Responsibilities

### VocabularyHeader
- Displays page title and subtitle
- Export dropdown menu
- Action buttons (Import, Create Tag, Explore, Add Word)

### VocabularyToolbar
- Search input with icon
- Status filter buttons (Active/Archived/All)
- Tag filter dropdown (mobile only)

### VocabularyContent
- Loading skeleton
- Empty states (no results, no match, empty tag)
- Vocabulary table with data

### VocabularyPagination
- Page information display
- Previous/Next navigation buttons

## Benefits

1. **Maintainability**: Each piece has a single responsibility
2. **Testability**: Hooks and components can be tested independently
3. **Reusability**: Components and hooks can be used elsewhere
4. **Readability**: Clear structure and naming conventions
5. **Type Safety**: Zod schemas provide runtime validation
6. **Theming**: CSS variables enable easy theme customization

## Usage Example

```typescript
// Main page orchestrates everything
export default function VocabularyPage() {
  // State management
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "active" | "archived">("active");
  
  // Custom hooks
  const { searchQuery, debouncedSearch, setSearchQuery } = useDebouncedSearch();
  const { tags, tagMap, refetchTags } = useTagsData();
  const { data, isLoading, refetch } = useVocabularyData({...});
  
  // Render components
  return (
    <div>
      <VocabularyHeader {...} />
      <VocabularyToolbar {...} />
      <VocabularyContent {...} />
      <VocabularyPagination {...} />
    </div>
  );
}
```

## Future Enhancements

- Add unit tests for hooks
- Add integration tests for components
- Consider React Query for better caching
- Add optimistic updates for better UX
- Implement virtual scrolling for large lists
