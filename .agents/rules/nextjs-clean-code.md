---
description: Comprehensive coding conventions and clean code rules for the LexiVocab Next.js webapp. All AI agents MUST follow these rules when creating, modifying, or refactoring any feature.
---

# LexiVocab Next.js — Clean Code Rulebook

> **Mục đích**: Tài liệu này định nghĩa bộ quy tắc viết code chuẩn cho toàn bộ source Next.js webapp.
> Mọi AI Agent khi phát triển, refactor, hoặc review code **BẮT BUỘC** phải tuân thủ.

---

## 1. Kiến trúc tổng quan (Architecture Map)

```
lexivocab-webapp/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # i18n dynamic segment
│   │   ├── (admin)/              # Route group: Admin panel
│   │   │   ├── admin/            # /admin/*
│   │   │   │   ├── layout.tsx    # Admin layout (sidebar + auth guard)
│   │   │   │   └── <feature>/    # Mỗi feature 1 folder
│   │   │   │       └── page.tsx  # Page component
│   │   │   └── layout.tsx        # Route group layout
│   │   ├── (dashboard)/          # Route group: User dashboard
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx
│   │   │       └── <feature>/page.tsx
│   │   ├── (auth)/               # Route group: Authentication
│   │   │   └── auth/
│   │   ├── (client)/             # Route group: Public pages
│   │   └── layout.tsx            # Root locale layout (providers, fonts, SEO)
│   ├── api/                      # API Route Handlers
│   │   ├── auth/                 # Auth endpoints (login, register, etc.)
│   │   │   └── <action>/route.ts
│   │   └── proxy/                # Catch-all proxy to .NET backend
│   │       └── [...path]/route.ts
│   └── globals.css               # Global styles + Tailwind base
├── components/
│   ├── ui/                       # shadcn/ui primitives (DO NOT EDIT)
│   ├── dashboard/                # Dashboard-specific components
│   ├── admin/                    # Admin-specific components
│   ├── landing/                  # Landing page components
│   └── <domain>/                 # Domain-specific shared components
├── lib/
│   ├── api/
│   │   ├── api-client.ts         # HTTP client (serverFetch, clientApi, authApi, etc.)
│   │   └── types.ts              # TypeScript DTOs mirroring backend
│   ├── auth/
│   │   └── auth-context.tsx      # AuthProvider + useAuth hook
│   ├── hooks/                    # Custom hooks
│   ├── config.ts                 # App configuration constants
│   ├── i18n.ts                   # Locale definitions
│   └── utils.ts                  # Shared utilities (cn, etc.)
├── messages/                     # i18n JSON files
│   ├── en.json
│   ├── vi.json
│   ├── ja.json
│   └── zh.json
├── i18n/
│   └── request.ts               # next-intl server config
├── actions/                      # Server actions
└── proxy.ts                      # Middleware (auth redirect, i18n)
```

### Quy tắc kiến trúc

| # | Quy tắc | Chi tiết |
|---|---------|----------|
| A1 | **Tuyệt đối không import trực tiếp từ backend** | Frontend chỉ giao tiếp qua `/api/proxy/*` hoặc `/api/auth/*` |
| A2 | **Route groups phải dùng parentheses** | `(admin)`, `(dashboard)`, `(auth)`, `(client)` — KHÔNG tạo route group mới ngoài 4 nhóm này trừ khi có lý do rõ ràng |
| A3 | **Mỗi feature = 1 folder** | Mỗi tính năng nằm trong `admin/<feature>/page.tsx` hoặc `dashboard/<feature>/page.tsx` |
| A4 | **Component phải đặt đúng chỗ** | Components chung → `components/<domain>/`, UI primitives → `components/ui/` (managed by shadcn) |
| A5 | **Không tạo file utils rời rạc** | Mọi utility chung → `lib/utils.ts`. Utility chuyên biệt → file riêng trong `lib/` |

---

## 2. Quy tắc đặt tên (Naming Conventions)

### 2.1 Files & Folders
```
Files:         kebab-case       → stat-card.tsx, api-client.ts, use-permissions.ts
Folders:       kebab-case       → audit-logs/, batch-import/
Page files:    page.tsx         → LUÔN dùng tên này trong App Router
Layout files:  layout.tsx       → LUÔN dùng tên này
Route handlers: route.ts        → LUÔN dùng tên này
```

### 2.2 Components & Types
```typescript
// ✅ Components: PascalCase, named export (KHÔNG dùng default export cho component con)
export function StatCard({ ... }: StatCardProps) { ... }
export function EmptyState({ ... }: EmptyStateProps) { ... }

// ✅ Page component: default export bắt buộc
export default function AuditLogsPage() { ... }

// ✅ Props interface: <ComponentName>Props
interface StatCardProps { ... }
interface ConfirmDialogProps { ... }

// ✅ Types/DTOs: PascalCase, suffix "Dto" cho backend mirror
export interface AuditLogDto { ... }
export interface PagedResult<T> { ... }

// ✅ Hooks: camelCase, prefix "use"
export function usePermissions() { ... }
export function useAuth() { ... }

// ✅ Constants: UPPER_SNAKE_CASE
const AUDIT_ACTIONS = [...] as const;
const PAGE_SIZE_OPTIONS = [20, 50, 100];
const MAX_BODY_SIZE = 1 * 1024 * 1024;

// ✅ Helper functions: camelCase
function formatDuration(ms: number): string { ... }
function getDurationColor(ms: number): string { ... }
```

### 2.3 i18n Keys
```
Namespace pattern: "<RouteGroup>.<feature>"
Examples:
  - "Admin.auditLogs"   → Admin panel → Audit Logs feature
  - "Dashboard.home"    → Dashboard → Home page
  - "Auth.login"        → Auth → Login page

Key nesting:  dot.notation TRONG namespace, object nesting TRONG JSON
  ✅ t("table.timestamp")
  ✅ t("filters.action")
  ❌ t("Admin.auditLogs.table.timestamp")  ← namespace đã được useTranslations("Admin.auditLogs") xử lý
```

---

## 3. Cấu trúc file Page (Page Structure Pattern)

Mỗi page.tsx PHẢI tuân theo cấu trúc sau theo đúng thứ tự:

```typescript
"use client";  // 1️⃣ Directive (nếu cần)

// 2️⃣ React imports
import { useState, useEffect, useCallback, useMemo } from "react";

// 3️⃣ Framework imports  
import { useTranslations } from "next-intl";
import Link from "next/link";

// 4️⃣ Internal lib imports
import { adminApi } from "@/lib/api/api-client";
import { AuditLogDto, PagedResult } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";

// 5️⃣ UI component imports (shadcn)
import { Table, TableBody, TableCell, ... } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// 6️⃣ Domain component imports
import { StatCard } from "@/components/dashboard/stat-card";

// 7️⃣ Third-party library imports
import { format } from "date-fns";
import { motion } from "framer-motion";

// 8️⃣ Icon imports (lucide-react) — gom 1 block
import {
    Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, ...
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────
// 9️⃣ Constants & configurations
const AUDIT_ACTIONS = [...] as const;

// ─── Types ──────────────────────────────────────────────
// 🔟 Local types / interfaces (nếu cần)
type ActionCategory = "auth" | "vocab" | "review";

// ─── Helpers ────────────────────────────────────────────
// 1️⃣1️⃣ Pure helper functions
function formatDuration(ms: number): string { ... }

// ─── Sub-components ─────────────────────────────────────
// 1️⃣2️⃣ Private sub-components (CHỈ dùng trong file này)
function ActionBadge({ action, t }: { ... }) { ... }
function SkeletonRow() { ... }
function DetailDialog({ ... }) { ... }

// ─── Main Page ──────────────────────────────────────────
// 1️⃣3️⃣ Default export — Page component
export default function AuditLogsPage() { ... }
```

### Quy tắc quan trọng

| # | Quy tắc | Giải thích |
|---|---------|------------|
| P1 | **Dùng section dividers** | Dùng `// ─── Section Name ───` để chia các phần cho dễ đọc |
| P2 | **Sub-components đặt TRƯỚC main** | Các component nhỏ dùng nội bộ đặt trên `export default` |
| P3 | **Constants ở đầu file** | Mọi magic values phải khai báo thành constants |
| P4 | **Page < 500 LOC** | Nếu page > 500 dòng → tách sub-components ra file riêng |
| P5 | **1 page = 1 export default** | Chỉ có duy nhất 1 `export default function` |

---

## 4. Quy tắc viết Component (Component Rules)

### 4.1 Props Pattern
```typescript
// ✅ Tốt: Interface rõ ràng với JSDoc
interface StatCardProps {
    /** Tiêu đề hiển thị */
    title: string;
    /** Giá trị chính */
    value: string | number;
    /** Icon component */
    icon: ReactNode;  
    /** Mô tả ngắn (optional) */
    description?: string;
    /** Cho phép mở rộng className */
    className?: string;
}

// ❌ Xấu: inline type, thiếu doc
function StatCard({ title, value, ...rest }: { title: string; value: any; [key: string]: any }) {}
```

### 4.2 Component Structure
```typescript
export function MyComponent({ prop1, prop2, className }: MyComponentProps) {
    // 1. Hooks (state, effects, callbacks)
    const [state, setState] = useState(...);
    const t = useTranslations("...");
    
    // 2. Derived values / memos
    const computed = useMemo(() => ..., [dep]);
    
    // 3. Event handlers (useCallback khi truyền xuống child)
    const handleClick = useCallback(() => { ... }, [dep]);
    
    // 4. Effects
    useEffect(() => { ... }, [dep]);
    
    // 5. Early returns (loading, error, empty states)
    if (isLoading) return <Skeleton />;
    if (error) return <ErrorState />;
    
    // 6. Main render
    return (
        <div className={cn("base-classes", className)}>
            {/* JSX */}
        </div>
    );
}
```

### 4.3 Composability Rules
```
✅ Dùng cn() từ lib/utils để merge classNames
✅ Luôn nhận className? prop cho composability
✅ Dùng children pattern khi cần flexible content
✅ Dùng render props / slot pattern cho complex compositions

❌ KHÔNG hardcode colors — dùng design tokens (text-primary, bg-muted, etc.)
❌ KHÔNG dùng inline styles — LUÔN dùng Tailwind classes
❌ KHÔNG duplicate component — tách shared component ra components/<domain>/
```

---

## 5. Quy tắc API & Data Fetching

### 5.1 API Client Architecture
```
Browser ──→ /api/proxy/* ──→ .NET Backend /api/v1/*
         (Next.js proxy)    (with auto token refresh)
```

**KHÔNG BAO GIỜ** gọi trực tiếp đến backend từ client component.  
**LUÔN** đi qua proxy: `/api/proxy/admin/audit-logs` → backend `/api/v1/admin/audit-logs`

### 5.2 Data Fetching Pattern
```typescript
// ✅ Pattern chuẩn cho Client Component
export default function MyPage() {
    const [data, setData] = useState<DataDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await myApi.getData(params);
            if (res.success) {
                setData(res.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [params]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Loading → Error → Empty → Data
    if (isLoading) return <LoadingSkeleton />;
    if (!data) return <EmptyState />;
    return <DataView data={data} />;
}
```

### 5.3 API Client Extension Pattern
```typescript
// ✅ Thêm API mới vào api-client.ts
export const featureApi = {
    getItems: (page = 1, pageSize = 20, filters?: FilterType) => {
        const query = new URLSearchParams({ 
            page: page.toString(), 
            pageSize: pageSize.toString() 
        });
        if (filters?.search) query.append('search', filters.search);
        return clientApi.get<PagedResult<ItemDto>>(`/api/proxy/feature/items?${query.toString()}`);
    },
    
    createItem: (data: CreateItemRequest) =>
        clientApi.post<ItemDto>("/api/proxy/feature/items", data),
};
```

### 5.4 Type Mirroring
```typescript
// lib/api/types.ts — PHẢI mirror chính xác backend DTO
// Dùng comment sections giống backend:

// ─── Auth DTOs ───────────────────────────────────────────────
export interface LoginRequest { ... }

// ─── Vocabulary DTOs ─────────────────────────────────────────
export interface VocabularyDto { ... }

// Naming: <Entity>Dto cho response, <Action><Entity>Request cho request
```

---

## 6. Quy tắc Internationalization (i18n)

### 6.1 Setup
```
Framework:  next-intl v4
Locales:    vi (default), en, ja, zh
Messages:   messages/{locale}.json
```

### 6.2 Rules

| # | Quy tắc | Chi tiết |
|---|---------|----------|
| I1 | **KHÔNG hardcode text** | Mọi text hiển thị cho user PHẢI dùng `t("key")` |
| I2 | **Cập nhật TẤT CẢ 4 files** | Khi thêm/sửa key → update `en.json`, `vi.json`, `ja.json`, `zh.json` |
| I3 | **Namespace = route.feature** | `useTranslations("Admin.auditLogs")` |
| I4 | **Không nest quá 3 cấp** | `t("filters.action")` ✅ — `t("filters.advanced.options.type")` ❌ |
| I5 | **Dùng interpolation cho dynamic values** | `t("pagination.showing", { from: "1", to: "20", total: "100" })` |
| I6 | **Key names bằng tiếng Anh** | Keys luôn bằng tiếng Anh, values theo từng locale |

### 6.3 Message Structure Pattern
```json
{
  "Namespace.feature": {
    "title": "...",
    "subtitle": "...",
    "filters": {
      "action": "...",
      "allActions": "..."
    },
    "table": {
      "header1": "...",
      "header2": "..."
    },
    "empty": "...",
    "emptySubtitle": "..."
  }
}
```

---

## 7. Quy tắc Styling (Tailwind CSS)

### 7.1 Design Tokens (PHẢI dùng)
```
Colors:      text-foreground, text-muted-foreground, text-primary
             bg-background, bg-card, bg-muted, bg-primary
Borders:     border, border-border, border-muted-foreground/20
Shadows:     shadow-sm, shadow-md, shadow-2xl
Radius:      rounded-md, rounded-lg, rounded-xl, rounded-2xl
```

### 7.2 Best Practices
```
✅ Dùng opacity modifiers:       bg-violet-500/15, text-emerald-600
✅ Dùng dark mode variants:      text-emerald-600 dark:text-emerald-400
✅ Dùng semantic spacing:        space-y-5, gap-3, px-4 py-3
✅ Dùng responsive prefixes:     sm:flex-row, md:grid-cols-2, lg:grid-cols-4
✅ Dùng group hover:             group-hover:opacity-100
✅ Dùng animate classes:         animate-pulse, animate-spin, animate-in

❌ KHÔNG dùng arbitrary values:  w-[437px] ← thay bằng design tokens
❌ KHÔNG mix inline style + tw:  style={{ color: 'red' }} ← KHÔNG
❌ KHÔNG duplicate class chains: Tách thành component nếu lặp > 2 lần
```

### 7.3 Color Semantic Pattern (cho badges, status, etc.)
```typescript
// ✅ Chuẩn: bg + text + border cùng tone, dùng opacity
"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
"bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20"

// ✅ Status Colors Convention:
// Success:  emerald/green
// Error:    red/rose  
// Warning:  amber/yellow
// Info:     blue/sky
// Neutral:  gray/slate
```

---

## 8. Quy tắc UX Patterns

### 8.1 Loading States
```typescript
// ✅ LUÔN có skeleton loading cho table/list
function SkeletonRow() {
    return (
        <TableRow className="animate-pulse">
            <TableCell><div className="h-4 w-32 bg-muted rounded-md" /></TableCell>
            ...
        </TableRow>
    );
}

// ✅ Loading indicator cho async actions
{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}

// ❌ KHÔNG dùng loading text không có animation
// ❌ KHÔNG để trang trắng khi loading
```

### 8.2 Empty States
```typescript
// ✅ LUÔN cung cấp:
// 1. Icon minh họa
// 2. Message chính (bold)
// 3. Message phụ hướng dẫn
// 4. Action button (nếu có thể)
<div className="flex flex-col items-center justify-center py-8">
    <div className="p-4 rounded-2xl bg-muted/50 mb-4">
        <AlertCircle className="h-10 w-10 opacity-40" />
    </div>
    <p className="font-semibold">{t("empty")}</p>
    <p className="text-sm text-muted-foreground mt-1">{t("emptySubtitle")}</p>
    <Button variant="outline" className="mt-4" onClick={clearFilters}>
        {t("filters.clearFilters")}
    </Button>
</div>
```

### 8.3 Error Handling
```typescript
// ✅ LUÔN handle 3 states: loading, error, data
// ✅ Error state phải có nút retry
// ✅ Toast cho inline errors (dùng sonner)

// Pattern:
if (isLoading) return <Skeleton />;
if (error) return <ErrorState onRetry={fetchData} />;
if (!data || data.length === 0) return <EmptyState />;
return <DataView data={data} />;
```

### 8.4 Pagination Pattern
```typescript
// ✅ Phải có đầy đủ:
// 1. "Showing X-Y of Z" counter
// 2. Page size selector (20, 50, 100)
// 3. Previous / Next buttons
// 4. "Page X of Y" indicator
// 5. Disabled state khi ở trang đầu/cuối
```

### 8.5 Filter Pattern
```typescript
// ✅ Search input: debounce 300-500ms, có clear button
// ✅ Select filters: luôn có option "All" (reset), icon trong options
// ✅ Active filter count: hiển thị badge trên nút filter
// ✅ Clear all filters: 1 nút clear tất cả
// ✅ Reset page khi thay đổi filter: setPage(1)
```

---

## 9. Quy tắc TypeScript

### 9.1 Strict Typing
```typescript
// ✅ LUÔN khai báo type cho state
const [data, setData] = useState<PagedResult<AuditLogDto> | null>(null);
const [isLoading, setIsLoading] = useState(true);

// ✅ LUÔN khai báo return type cho helpers
function formatDuration(ms: number): string { ... }
function getDurationColor(ms: number): string { ... }

// ✅ Dùng `as const` cho readonly arrays/objects
const ACTIONS = ["Login", "Register", "Logout"] as const;

// ❌ KHÔNG dùng `any`
// ❌ KHÔNG dùng `// @ts-ignore`
// ❌ KHÔNG dùng `as unknown as SomeType` (trừ trường hợp đặc biệt có comment giải thích)
```

### 9.2 Type Exports
```typescript
// ✅ Export types từ lib/api/types.ts
// ✅ Import types với "type" keyword khi chỉ dùng cho type checking
import type { AuditLogDto, PagedResult } from "@/lib/api/types";

// ✅ Dùng generic types khi có thể
export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
```

---

## 10. Quy tắc Security

| # | Quy tắc | Chi tiết |
|---|---------|----------|
| S1 | **Token KHÔNG bao giờ gửi xuống client** | Access token lưu httpOnly cookie, quản lý bởi server |
| S2 | **Proxy whitelist** | Chỉ cho phép proxy đến các path đã đăng ký trong `ALLOWED_PREFIXES` |
| S3 | **Body size limit** | Max 1MB cho request body qua proxy |
| S4 | **Auto token refresh** | Proxy tự refresh token khi nhận 401, transparent với client |
| S5 | **Auth guard** | Mọi route protected dùng `<AuthGuard>` wrapper + middleware check |
| S6 | **Role-based access** | Admin routes check `user.role === "Admin"` trong layout |

---

## 11. Quy tắc Performance

| # | Quy tắc | Chi tiết |
|---|---------|----------|
| PF1 | **Debounce search input** | 300-500ms delay trước khi gọi API |
| PF2 | **useMemo cho derived data** | Filter counts, computed values, etc. |
| PF3 | **useCallback cho handlers** | Event handlers truyền xuống child components |
| PF4 | **Lazy load heavy components** | `dynamic(() => import(...), { ssr: false })` cho components lớn |
| PF5 | **Optimize imports** | `next.config.ts` đã config `optimizePackageImports` cho lucide-react, framer-motion |
| PF6 | **No N+1 queries** | Fetch all needed data in 1 call hoặc `Promise.all([...])` |

---

## 12. Checklist trước khi commit

Mọi AI Agent PHẢI kiểm tra trước khi hoàn thành task:

- [ ] **Build thành công**: `npx next build` — exit code 0
- [ ] **TypeScript clean**: `npx tsc --noEmit` — 0 errors
- [ ] **i18n đồng bộ**: Cả 4 files `en.json`, `vi.json`, `ja.json`, `zh.json` đều có đủ key mới
- [ ] **Không hardcode text**: Mọi UI text đều dùng `t("key")`
- [ ] **Loading states**: Có skeleton/spinner cho mọi async operation
- [ ] **Empty states**: Có empty state với icon + message + action
- [ ] **Error handling**: Có error state với retry button
- [ ] **Responsive**: Test giao diện trên mobile (sm), tablet (md), desktop (lg)
- [ ] **Dark mode**: Mọi màu custom đều có dark variant
- [ ] **No any**: Không có `any` type trong code mới
- [ ] **No console.log**: Xóa tất cả console.log (chỉ giữ console.error cho error handling)
- [ ] **Consistent naming**: File, component, hook, type names theo convention

---

## 13. Anti-Patterns (TUYỆT ĐỐI KHÔNG LÀM)

### ❌ God Component
```typescript
// ❌ Xấu: Component 800+ dòng với mọi thứ gom vào 1 file
export default function MegaPage() { 
    // 50 useState, 20 useEffect, 500 dòng JSX...
}

// ✅ Tốt: Tách thành sub-components
// page.tsx < 300 dòng, import từ các file con
```

### ❌ Prop Drilling
```typescript
// ❌ Xấu: Truyền prop qua 4+ levels
<Parent data={data}>
    <Child data={data}>
        <GrandChild data={data}>
            <GreatGrandChild data={data} />

// ✅ Tốt: Dùng Context hoặc composition pattern
```

### ❌ Duplicate API Calls
```typescript
// ❌ Xấu: Gọi cùng 1 API trong useEffect không có dependency tracking
useEffect(() => { fetchData(); }, []);
useEffect(() => { fetchData(); }, []);  // duplicate!

// ✅ Tốt: 1 fetch function, gọi từ 1 useEffect
const fetchData = useCallback(async () => { ... }, [deps]);
useEffect(() => { fetchData(); }, [fetchData]);
```

### ❌ Magic Numbers/Strings
```typescript
// ❌ Xấu
if (role === "Admin") { ... }
setTimeout(() => {}, 300);
const items = data.slice(0, 20);

// ✅ Tốt
const ROLES = { ADMIN: "Admin", USER: "User" } as const;
const DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 20;
```

### ❌ Mixed Concerns
```typescript
// ❌ Xấu: Formatting logic trong JSX
<span>{new Date(log.timestamp).toLocaleDateString("en-US", { ... })}</span>

// ✅ Tốt: Extract thành helper
function formatTimestamp(date: string): string { 
    return format(new Date(date), "MMM d, HH:mm:ss"); 
}
<span>{formatTimestamp(log.timestamp)}</span>
```

---

## 14. Tech Stack Reference

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | Framework |
| React | 19.2.3 | UI Library |
| TypeScript | 5.9.3 | Type Safety |
| Tailwind CSS | v4 | Styling |
| next-intl | 4.7+ | i18n |
| shadcn/ui | new-york style | UI Primitives |
| lucide-react | 0.562+ | Icons |
| framer-motion | 12.x | Animations |
| date-fns | 4.x | Date formatting |
| sonner | 2.x | Toast notifications |
| Radix UI | via shadcn | Accessible primitives |
| Backend | .NET (Clean Architecture) | API: Domain → Application → Infrastructure → API |

---

## 15. Quick Decision Tree

```
Cần thêm feature mới?
├── Feature thuộc admin? → app/[locale]/(admin)/admin/<feature>/page.tsx
├── Feature thuộc dashboard? → app/[locale]/(dashboard)/dashboard/<feature>/page.tsx
├── Feature public? → app/[locale]/(client)/<feature>/page.tsx
└── Feature auth? → app/[locale]/(auth)/auth/<feature>/page.tsx

Cần thêm component?
├── Chỉ dùng trong 1 page? → Đặt ngay trong file page.tsx (sub-component)
├── Dùng trong nhiều page cùng domain? → components/<domain>/<component>.tsx
├── Dùng cross-domain? → components/<shared-domain>/<component>.tsx
└── UI primitive? → npx shadcn@latest add <component>

Cần gọi API mới?
├── Thêm DTO vào lib/api/types.ts
├── Thêm function vào lib/api/api-client.ts (đúng namespace)
├── Nếu cần proxy path mới → thêm vào ALLOWED_PREFIXES trong route.ts
└── KHÔNG gọi trực tiếp backend URL

Cần thêm text UI?
├── Thêm key vào messages/en.json
├── Copy structure sang vi.json, ja.json, zh.json
├── Dùng useTranslations("Namespace.feature")
└── KHÔNG hardcode text
```
