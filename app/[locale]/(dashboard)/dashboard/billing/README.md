# Billing Page - Refactoring Documentation

## Overview
Refactored from 600+ lines to ~150 lines following DRY principles and clean code guidelines from `.agent/skills/clean-code/SKILL.md`.

## Architecture

### Main Page (`page.tsx`)
- **Role**: Orchestrator component
- **Responsibilities**: 
  - State management coordination
  - Event handler delegation
  - Layout composition
- **Lines**: ~150

### Custom Hooks (`_hooks/`)

#### `use-billing-data.ts`
- Fetches billing info, payment history, and pending transactions
- Manages loading states
- Provides data setters for updates

#### `use-payment-actions.ts`
- Handles subscription cancellation
- Manages pending transaction cancellation
- Downloads invoices with PDF generation
- Manages confirmation dialogs state

#### `use-sepay-polling.ts`
- Polls Sepay payment status every 3 seconds
- Auto-refreshes billing data on success
- Handles timeout and failure scenarios
- Cleans up on unmount

### Components (`_components/`)

#### `status-badge.tsx`
- Displays subscription status with appropriate styling
- Supports: active, cancelled, expired, pending_cancellation

#### `current-plan-card.tsx`
- Shows current subscription details
- Displays renewal/expiry dates
- Cancel subscription button
- Uses CSS variables for all colors

#### `permissions-card.tsx`
- Lists feature permissions (Export, AI, Batch Import)
- Visual indicators for enabled/disabled features

#### `quota-card.tsx`
- Displays usage quotas with progress bars
- Shows vocabulary, AI, and translation limits
- Color-coded progress indicators

#### `upgrade-cta-card.tsx`
- Call-to-action for free users
- Links to pricing page
- Highlights premium benefits

#### `payment-history-card.tsx`
- Paginated transaction history
- Download invoice functionality
- Status badges for each transaction

## Design Principles Applied

### Single Responsibility Principle (SRP)
- Each component has one clear purpose
- Hooks separated by concern (data, actions, polling)
- No mixed business logic in UI components

### Don't Repeat Yourself (DRY)
- Reusable components for common patterns
- Shared hooks for data fetching
- Centralized status badge logic

### Keep It Simple, Stupid (KISS)
- Small, focused functions
- Clear naming conventions
- Minimal prop drilling

### You Aren't Gonna Need It (YAGNI)
- No speculative features
- Only essential functionality
- Removed unused code

## CSS Variables Usage
All colors use CSS variables from `app/globals.css`:
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--card`, `--card-foreground`

## Key Features

### Real-time Payment Polling
- Automatic status updates via Sepay polling
- 3-second intervals with 5-minute timeout
- Graceful error handling

### Invoice Generation
- Server-side PDF generation
- Automatic download trigger
- Loading states during generation

### Pending Transaction Management
- Resume incomplete payments
- Cancel pending transactions
- Visual banner for pending state

### Subscription Management
- Cancel active subscriptions
- View renewal dates
- Status tracking

## File Structure
```
billing/
├── page.tsx                          # Main orchestrator (~150 lines)
├── _hooks/
│   ├── use-billing-data.ts          # Data fetching
│   ├── use-payment-actions.ts       # Action handlers
│   └── use-sepay-polling.ts         # Payment polling
├── _components/
│   ├── status-badge.tsx             # Status display
│   ├── current-plan-card.tsx        # Plan details
│   ├── permissions-card.tsx         # Feature list
│   ├── quota-card.tsx               # Usage display
│   ├── upgrade-cta-card.tsx         # Upgrade prompt
│   └── payment-history-card.tsx     # Transaction list
└── README.md                         # This file
```

## Benefits of Refactoring

1. **Maintainability**: Easy to locate and modify specific features
2. **Testability**: Isolated hooks and components are easier to test
3. **Reusability**: Components can be reused in other contexts
4. **Readability**: Clear separation of concerns
5. **Scalability**: Easy to add new features without bloating main file
6. **Theme Support**: CSS variables enable easy theme customization

## Testing Checklist

- [ ] Billing data loads correctly
- [ ] Payment history displays with pagination
- [ ] Invoice download works
- [ ] Subscription cancellation flow
- [ ] Pending transaction resume/cancel
- [ ] Sepay polling updates status
- [ ] All CSS variables render correctly
- [ ] Responsive layout on mobile
- [ ] Loading states display properly
- [ ] Error handling works as expected

## Future Improvements

- Add unit tests for hooks
- Add component tests with React Testing Library
- Implement optimistic UI updates
- Add skeleton loaders for better UX
- Consider adding analytics tracking
