# Users Management Page - Refactored

## Overview
Admin page for managing and viewing user accounts with search, filtering, and pagination.

## Structure

### Main Page (`page.tsx`)
- ~30 lines (reduced from ~250 lines)
- Orchestrates components and hooks
- Handles page state and search coordination

### Hooks

#### `use-users-data.ts`
- Fetches users from API with pagination
- Handles loading states
- Auto-refetches on page/search changes

#### `use-debounced-search.ts`
- Debounces search input (500ms delay)
- Prevents excessive API calls
- Returns search state and debounced value

### Components

#### `page-header.tsx`
- Page title with icon
- Search input with icon
- Responsive layout

#### `user-stats.tsx` (NEW)
- 4 stat cards: Total, Active, Banned, Admins
- Color-coded icons
- Calculated from current page data

#### `users-table.tsx`
- User list with avatar, role, status
- Loading skeleton states
- Empty state with icon
- Click to navigate to user detail

#### `pagination.tsx`
- Previous/Next buttons
- Page indicator
- Disabled states

### Utils

#### `user-helpers.tsx`
- `getRoleIcon()`: Returns icon based on role
- `formatJoinDate()`: Formats date consistently
- `getUserInitials()`: Extracts initials from name

## Features
- Real-time search with debouncing
- Pagination (20 users per page)
- Role-based icons (Admin/User)
- Status badges (Active/Banned)
- Auth provider display
- Click row to view details
- Stats overview cards

## Improvements
- Added stats cards for better overview
- Extracted reusable utilities
- Separated concerns (data/UI/logic)
- Improved code maintainability
- Better loading states
