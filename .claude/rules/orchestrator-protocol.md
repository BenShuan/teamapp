# Orchestrator Protocol

> This protocol activates automatically for any task that requires changes across multiple files or layers of the stack.

---

## When This Protocol Applies

Activate for tasks that touch:
- More than **2 files** in different layers (e.g., schema + route + frontend)
- A **full feature** (new domain, new page, new CRUD flow)
- A **breaking change** (schema migration, type rename, API restructure)
- Any request that starts with: "add X feature", "build the Y page", "create a system for Z"

---

## Phase 1: ANALYZE before writing code

Before touching any file:

```
1. Identify all layers affected:
   - DB Schema?  → apps/api/src/db/schema/
   - API Routes? → apps/api/src/routes/
   - Service?    → apps/web/src/services/
   - Hook?       → apps/web/src/hooks/
   - Component?  → apps/web/src/components/ or routes/(app)/
   - Route/Page? → apps/web/src/routes/

2. Check if each dependency already exists:
   - Does the DB table exist? (check schema/index.ts)
   - Does the route exist? (check routes/index.ts)
   - Does the service exist? (check services/)
   - Does the hook exist? (check hooks/)
   - Do the query keys exist? (check lib/queries.ts)

3. Declare the execution order (always bottom-up):
   DB Schema → API Route → Service Layer → Hook → Component → Page
```

---

## Phase 2: PLAN — Declare the work

State the plan explicitly before executing:

```
## Plan: [Feature Name]

### Files to CREATE:
- [ ] apps/api/src/db/schema/<entity>.ts
- [ ] apps/api/src/routes/<domain>/<domain>.routes.ts
- [ ] apps/api/src/routes/<domain>/<domain>.handlers.ts
- [ ] apps/api/src/routes/<domain>/<domain>.index.ts
- [ ] apps/web/src/services/<domain>.api.ts
- [ ] apps/web/src/hooks/use<Domain>.ts
- [ ] apps/web/src/routes/(app)/<domain>/~index.tsx
- [ ] apps/web/src/routes/(app)/<domain>/components/<Entity>Table.tsx
- [ ] apps/web/src/routes/(app)/<domain>/components/<Entity>Form.tsx

### Files to MODIFY:
- [ ] apps/api/src/db/schema/index.ts  (add export + models entry)
- [ ] apps/api/src/routes/index.ts     (register new router)
- [ ] apps/web/src/lib/queries.ts      (add query keys)

### Commands to run:
- [ ] pnpm run -r db:generate
- [ ] pnpm run -r db:migrate:local
- [ ] pnpm run typecheck (in apps/api)
```

---

## Phase 3: EXECUTE — Layer by layer

Execute in strict bottom-up order. **Complete each layer before moving to the next.**

### Order:
```
1. DB Schema       (SKILL: db-new-schema)
2. Run Migration   (db:generate → db:migrate:local)
3. API Routes      (SKILL: api-new-route)
4. Register Router (routes/index.ts)
5. Query Keys      (lib/queries.ts)
6. API Service     (SKILL: api-service-layer)
7. React Query Hook(SKILL: react-query-hook)
8. Table Component (SKILL: data-table-page)
9. Form Component  (SKILL: form-pattern)
10. Route/Page     (SKILL: tanstack-router-page)
```

Do **not** skip layers even if they seem trivial.
Do **not** jump ahead to the frontend before the backend compiles.

---

## Phase 4: VERIFY — Quality gates

After completing all files, run these checks in order:

### Gate 1 — TypeScript (Backend)
```bash
pnpm run typecheck   # in apps/api — must exit 0
```

### Gate 2 — TypeScript (Frontend)
```bash
pnpm run typecheck   # in apps/web — must exit 0
```

### Gate 3 — Build (Optional, for risky changes)
```bash
pnpm run build       # in root — must succeed
```

### Gate 4 — Rules Checklist
Before declaring done, verify against each relevant SKILL's checklist:
- [ ] DB: all 3 schemas? timestamps? relations? registered in index.ts?
- [ ] API: all 3 files? scope filter on list/getOne/delete? router registered?
- [ ] API: appropriate middleware on routes? (requireScope + requireRole where needed)
- [ ] Service: queryOptions? create/update/delete? toast on mutations?
- [ ] Hook: entityMap with dataUpdatedAt? invalidateQueries in onSuccess?
- [ ] Table: Hebrew column ids? DataTableColumnHeader? hidden cols?
- [ ] Form: FormProvider? defaultValues guard? reset after submit?
- [ ] Route: loader? pendingComponent? correct route path?

---

## Orchestrator Anti-Patterns

- **NEVER** start writing code before declaring the plan
- **NEVER** work on the frontend before the backend types are compiled
- **NEVER** skip the typecheck gate after completion
- **NEVER** create a route without registering it (silent failure)
- **NEVER** create a service without adding its query keys to `lib/queries.ts`
- **NEVER** declare "done" with unresolved TypeScript errors
