# Review Page - Refactored Architecture

## Overview
The review page has been refactored following DRY principles and clean code standards.

## Structure

```
review/
├── _components/          # Presentational components
│   ├── review-start-screen.tsx
│   ├── review-complete-screen.tsx
│   └── review-active-session.tsx
├── _hooks/              # Custom React hooks
│   ├── use-review-session.ts
│   └── use-review-timer.ts
├── _utils/              # Utility functions
│   └── confetti.ts
├── page.tsx             # Main page (orchestrator)
└── README.md            # This file
```

## Key Improvements

### 1. Separation of Concerns
- **Components**: 3 screen components for different states
- **Hooks**: 2 custom hooks for session and timer logic
- **Utils**: Extracted confetti animation
- **Page**: Clean orchestrator (~80 lines)

### 2. DRY Principles Applied
- Reduced from 300+ lines to ~80 lines in main page
- Extracted timer logic into reusable hook
- Separated UI states into distinct components
- No hardcoded values - uses CSS variables

### 3. Custom Hooks

#### `useReviewSession`
Manages review session state and actions
```typescript
const {
  session,
  isLoading,
  currentIndex,
  isSessionActive,
  reviewedCount,
  startSession,
  moveToNext,
  finishSession,
} = useReviewSession();
```

#### `useReviewTimer`
Handles production-grade time tracking with pause detection
```typescript
const { pauseNotice, getTimeSpent } = useReviewTimer(isSessionActive, currentIndex);
```

### 4. Component Responsibilities

#### ReviewStartScreen
- Displays card count
- Start button
- Animated entrance

#### ReviewCompleteScreen
- Success/empty state
- Statistics display
- Back to dashboard link

#### ReviewActiveSession
- Progress bar
- Flashcard display
- Pause notification overlay
- Rating buttons

## Benefits

1. **Maintainability**: Clear separation of concerns
2. **Testability**: Hooks can be tested independently
3. **Reusability**: Timer logic can be used elsewhere
4. **Readability**: Each file has a single purpose
5. **Performance**: Optimized re-renders

## Code Quality Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main file lines | 300+ | ~80 | 73% reduction |
| Files | 1 | 7 | Better organization |
| Reusable hooks | 0 | 2 | Extracted logic |
| Components | 0 | 3 | Separated UI states |

## Features

- Production-grade time tracking
- Tab visibility detection
- Pause notifications
- Confetti celebration
- Optimistic UI updates
- Background API calls
