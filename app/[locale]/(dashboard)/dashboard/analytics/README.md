# Analytics Page - Refactoring Documentation

## Overview
Refactored from 200+ lines to ~70 lines following DRY principles and clean code guidelines.

## Architecture

### Main Page (`page.tsx`)
- **Role**: Orchestrator component
- **Responsibilities**: Layout composition and data flow
- **Lines**: ~70

### Custom Hooks (`_hooks/`)

#### `use-analytics-data.ts`
- Fetches dashboard and heatmap data in parallel
- Manages loading states
- Returns structured analytics data

### Components (`_components/`)

#### `stats-overview.tsx`
- Displays streak, active days, and mastery rate
- Uses motion animations
- Reuses StatCard component

#### `vocabulary-distribution.tsx`
- Shows active vs mastered words with progress bars
- Calculates percentages dynamically
- Uses CSS variables for colors

#### `performance-stats.tsx`
- Displays today and this week review counts
- Grid layout for stats
- Consistent styling with secondary background

#### `heatmap-section.tsx`
- Wraps Heatmap component with motion animation
- Shows year badge
- Conditional rendering based on data availability

### Utilities (`_utils/`)

#### `calculations.ts`
- `calculateMasteryRate`: Computes mastery percentage
- `calculatePercentage`: Generic percentage calculator
- Prevents division by zero

## Design Principles Applied

### Single Responsibility Principle (SRP)
- Each component displays one section
- Hook handles only data fetching
- Utilities handle only calculations

### Don't Repeat Yourself (DRY)
- Percentage calculations extracted to utility
- Reusable components for stats display
- Shared motion animation patterns

### Keep It Simple, Stupid (KISS)
- Small, focused components
- Clear prop interfaces
- Minimal logic in components

## CSS Variables Usage
All colors use CSS variables:
- `--primary`, `--foreground`, `--muted-foreground`
- `--card`, `--secondary`, `--border`
- Hardcoded colors only for semantic meaning (orange-500 for streak, yellow-500 for trophy, emerald-500 for mastered)

## File Structure
```
analytics/
├── page.tsx                              # Main orchestrator (~70 lines)
├── _hooks/
│   └── use-analytics-data.ts            # Data fetching
├── _components/
│   ├── stats-overview.tsx               # Streak/days/mastery
│   ├── vocabulary-distribution.tsx      # Active/mastered progress
│   ├── performance-stats.tsx            # Review counts
│   └── heatmap-section.tsx              # Heatmap wrapper
├── _utils/
│   └── calculations.ts                  # Math utilities
└── README.md                             # This file
```

## Benefits

1. **Maintainability**: Easy to update individual sections
2. **Testability**: Isolated utilities and components
3. **Reusability**: Components can be used elsewhere
4. **Readability**: Clear separation of concerns
5. **Performance**: Parallel data fetching with Promise.all

## Testing Checklist

- [ ] Dashboard data loads correctly
- [ ] Heatmap displays for current year
- [ ] Mastery rate calculates accurately
- [ ] Progress bars show correct percentages
- [ ] Review counts display properly
- [ ] Loading state shows spinner
- [ ] Error state shows message
- [ ] Animations work smoothly
- [ ] Responsive layout on mobile
