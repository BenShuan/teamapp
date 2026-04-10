# CLAUDE.md — TeamApp Project Rules

## What Is This Project
TeamApp is a military reserve management system (מילואים) — a pnpm monorepo with 2 apps and 3 shared packages deployed on Cloudflare.

## Monorepo Structure
```
teamapp/
├── apps/api/        ← Hono API → Cloudflare Workers + D1 (SQLite)
├── apps/web/        ← React 19 + Vite + TanStack Router → Cloudflare Pages
├── packages/api-client/   ← Hono RPC type-safe client
├── packages/shared/       ← Shared utils/validators
└── packages/eslint-config/ ← Shared ESLint config
```

## Tech Stack (Do Not Deviate)
- **API**: Hono + @hono/zod-openapi + stoker + Drizzle ORM + Cloudflare D1
- **Auth**: Auth.js (@auth/core) + @hono/auth-js
- **Frontend**: React 19 + Vite 6 + TanStack Router + TanStack Query
- **UI**: shadcn/ui (Radix) + TailwindCSS 4
- **Forms**: react-hook-form + @hookform/resolvers
- **Validation**: Zod + drizzle-zod
- **DnD**: @dnd-kit/core + @dnd-kit/sortable

## Path Aliases
- `@/api/*` → `apps/api/src/*`
- `@/web/*` → `apps/web/src/*`
- `@teamapp/api/schema` → `apps/api/src/db/schema/index.ts`
- `@teamapp/api/routes` → `apps/api/src/routes/index.ts`
- `@teamapp/api-client` → `packages/api-client/src/index.ts`
- `@teamapp/shared` → `packages/shared/src/index.ts`

## Critical Architecture Rules

### Rule 1 — Route File Trinity (NEVER break this pattern)
Every API domain MUST have exactly 3 files:
```
routes/<domain>/
  <domain>.routes.ts    ← createRoute() definitions only
  <domain>.handlers.ts  ← Business logic only (AppRouteHandler<T>)
  <domain>.index.ts     ← Wiring routes to handlers + export router
```

### Rule 2 — Scope Filtering (ALWAYS filter by user scope)
All list and getOne handlers MUST use `teamScopeWhere(scope)` for D1 queries.
ADMIN users have `scope.unrestricted = true` and see everything.
Non-admin users are filtered by `scope.teamIds`.

### Rule 3 — Zod Schema Chain (NEVER define schemas twice)
```
drizzle-zod generates → NewXSchema, XSchema, UpdateXSchema in apps/api/src/db/schema/
                        ↓ imported by
apps/web imports types → from "@teamapp/api/schema"
```
Never redefine types in the frontend. Always import from `@teamapp/api/schema`.

### Rule 4 — Query Keys (ALWAYS use lib/queries.ts)
Never hardcode query keys inline. Always define in `apps/web/src/lib/queries.ts` and reference via `queryKeys.*`.

### Rule 5 — Auth Guard Pattern
- `requireScope()` → throws 401 if not authenticated
- `requireRole('COMMANDER')` → throws 403 if role is below threshold
- Role hierarchy: `FIGHTER < COMMANDER < CAPTAIN < ADMIN`

### Rule 6 — Toast Notifications
- `toast.success()` → on every successful mutation (in service layer)
- `toast.error()` → on mutation error (in hook `onError`)
- NEVER show toast in components directly

### Rule 7 — Field Helpers (ALWAYS use schemaHelper.ts)
```typescript
// DO:
id: ID_FIELD("id"),
name: TEXT_REQUIRED_FIELD("name"),
description: TEXT_OPTIONAL_FIELD("description"),

// DON'T:
id: text("id").primaryKey(),
name: text("name").notNull(),
```

## Build Commands
```bash
pnpm run dev              # Run all apps in parallel
pnpm run build            # Build all
pnpm run deploy           # Build + deploy to Cloudflare
pnpm run -r db:migrate:local   # Run D1 migrations locally
pnpm run -r db:migrate:remote  # Run D1 migrations remote
pnpm run -r db:generate        # Generate new Drizzle migration
pnpm run test             # Run Vitest
pnpm run lint             # ESLint all
```

## Language Convention
- UI text (labels, messages) → Hebrew (עברית)
- Code (variables, functions, files) → English
- Comments → English or Hebrew (consistent per file)

## Rules Index
Always-active rules are in `.claude/rules/`. Load the relevant rule file when working in that area:

| Area | Rule File |
|------|-----------|
| Authentication, sessions, scope, RBAC | `.claude/rules/auth-and-scope.md` |
| API route design, OpenAPI, handlers | `.claude/rules/api-design.md` |
| DB schema, migrations, Drizzle patterns | `.claude/rules/database.md` |
| React, hooks, forms, routing, components | `.claude/rules/frontend-patterns.md` |
| TypeScript, naming, error handling, env | `.claude/rules/code-quality.md` |
| Multi-file / multi-layer feature tasks | `.claude/rules/orchestrator-protocol.md` |

---

## Skill Index
Load the relevant SKILL when the task matches:
| Task | Skill File |
|------|-----------|
| Add API endpoint | `.claude/skills/api-new-route/SKILL.md` |
| Add DB table | `.claude/skills/db-new-schema/SKILL.md` |
| Add API service | `.claude/skills/api-service-layer/SKILL.md` |
| Add React Query hook | `.claude/skills/react-query-hook/SKILL.md` |
| Build data table / list page | `.claude/skills/data-table-page/SKILL.md` |
| Build create/edit form | `.claude/skills/form-pattern/SKILL.md` |
| Add new page (route) | `.claude/skills/tanstack-router-page/SKILL.md` |
| Add drag-and-drop | `.claude/skills/dnd-kit-pattern/SKILL.md` |
| Manage query cache | `.claude/skills/query-cache-management/SKILL.md` |
