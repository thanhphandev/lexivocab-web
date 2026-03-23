# Explore Page - Refactoring Documentation

## Overview
Refactored from 280+ lines to ~90 lines following DRY principles and clean code guidelines.

## Architecture

### Main Page (`page.tsx`)
- **Role**: Orchestrator component
- **Responsibilities**: State coordination and layout composition
- **Lines**: ~90

### Custom Hooks (`_hooks/`)

#### `use-explore-data.ts`
- Fetches word list from API
- Manages pagination state
- Returns words, loading state, and total pages

#### `use-debounced-search.ts`
- Debounces search input (500ms delay)
- Prevents excessive API calls
- Resets page to 1 on new search

#### `use-word-actions.ts`
- Handles adding words to vocabulary
- Manages audio playback state
- Shows success/error toasts

### Components (`_components/`)

#### `search-bar.tsx`
- Search input with icon
- Controlled component pattern
- Focus event handling

#### `search-dropdown.tsx`
- Animated dropdown with suggestions
- Shows top 5 matching words
- Click outside to close

#### `word-detail-card.tsx`
- Full word details view
- Audio pronunciation playback
- External dictionary links (Cambridge, Oxford)
- Add to vocabulary button

#### `word-grid.tsx`
- Grid layout for word cards
- Skeleton loading states
- Quick add button on each card

#### `pagination.tsx`
- Previous/Next navigation
- Current page indicator
- Disabled states for boundaries

## Design Principles Applied

### Single Responsibility Principle (SRP)
- Each component handles one UI section
- Hooks separated by concern (data, search, actions)
- Clear separation of presentation and logic

### Don't Repeat Yourself (DRY)
- Reusable search debouncing hook
- Shared word action handlers
- Common pagination component

### Keep It Simple, Stupid (KISS)
- Small, focused components
- Clear prop interfaces
- Minimal state management

### You Aren't Gonna Need It (YAGNI)
- Removed unused imports (Hash, masterVocabApi)
- Only essential features
- No speculative code

## CSS Variables Usage
All colors use CSS variables:
- `--primary`, `--foreground`, `--muted-foreground`
- `--card`, `--accent`, `--popover`, `--border`
- `--secondary` for buttons

## Key Features

### Debounced Search
- 500ms delay prevents excessive API calls
- Resets pagination on new search
- Shows dropdown with top 5 suggestions

### Word Detail View
- Full word information display
- Audio pronunciation with visual feedback
- External dictionary integration
- Smooth animations with Framer Motion

### Audio Playback
- Visual indicator during playback
- Error handling for failed audio
- Auto-cleanup on completion

### Pagination
- Client-side page navigation
- Disabled states for boundaries
- Hidden when only 1 page

## File Structure
```
explore/
├── page.tsx                              # Main orchestrator (~90 lines)
├── _hooks/
│   ├── use-explore-data.ts              # Data fetching
│   ├── use-debounced-search.ts          # Search debouncing
│   └── use-word-actions.ts              # Add/audio actions
├── _components/
│   ├── search-bar.tsx                   # Search input
│   ├── search-dropdown.tsx              # Suggestions dropdown
│   ├── word-detail-card.tsx             # Full word view
│   ├── word-grid.tsx                    # Word cards grid
│   └── pagination.tsx                   # Page navigation
└── README.md                             # This file
```

## Benefits

1. **Maintainability**: Easy to update individual features
2. **Testability**: Isolated hooks and components
3. **Reusability**: Components can be used elsewhere
4. **Readability**: Clear separation of concerns
5. **Performance**: Debounced search reduces API calls

## Testing Checklist

- [ ] Search debouncing works (500ms delay)
- [ ] Dropdown shows top 5 suggestions
- [ ] Word detail view displays correctly
- [ ] Audio playback works with visual feedback
- [ ] Add to vocabulary shows success toast
- [ ] Pagination navigates correctly
- [ ] Loading skeletons display
- [ ] Click outside closes dropdown
- [ ] External dictionary links work
- [ ] Responsive layout on mobile
- [ ] Error handling for failed requests

## Future Improvements

- Add unit tests for hooks
- Add component tests with React Testing Library
- Implement infinite scroll as alternative to pagination
- Add word favorites/bookmarks
- Cache search results
- Add keyboard navigation for dropdown
