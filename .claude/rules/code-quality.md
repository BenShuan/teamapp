# Rule: Code Quality

> These rules are **always active** across the entire codebase.

---

## Rule CQ-1 — TypeScript Strictness: No `any` Without Justification

`any` is allowed **only** in cases where Hono/Drizzle type systems conflict internally.
Document every `any` usage with a short comment explaining why.

```typescript
// ACCEPTABLE — known Hono RPC limitation with json body types
const res = await apiClient.api.fighters.$post({ json: data as any });

// ACCEPTABLE — Drizzle internal type vs Zod extended type mismatch
await db.update(attendance).set(updates as any).where(...);

// NOT ACCEPTABLE — laziness
const user = c.get("authUser") as any;  // ❌ should be typed via AppEnv.Variables
const data: any = await fetchSomething();  // ❌ defeats TypeScript
```

---

## Rule CQ-2 — No Console Logs in Production Code

`console.log`, `console.debug` are for temporary debugging only.
Before committing, **remove all debug logs**.

```typescript
// WRONG — left in production
const scope = getScope(c);
console.log('scope', scope);  // ❌ remove before commit

// CORRECT — use @logtape/logtape if you need structured logging
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["api", "fighters"]);
logger.info("Fetching fighters for scope {teamIds}", { teamIds: scope?.teamIds });
```

---

## Rule CQ-3 — Import Aliases Only

Never use relative path imports that go more than 1 level up.
Use the registered path aliases instead.

```typescript
// CORRECT — use aliases
import { createDb } from "@/api/db";
import { fighter } from "@/api/db/schema";
import apiClient from "@/web/lib/api-client";
import { Button } from "@/web/components/ui/button";

// WRONG — brittle relative paths
import { createDb } from "../../../db";           // ❌
import { Button } from "../../components/ui/button"; // ❌
```

Available aliases:
- `@/api/*` → `apps/api/src/*`
- `@/web/*` → `apps/web/src/*`
- `@teamapp/api/schema` → API schema barrel
- `@teamapp/api/routes` → API router type
- `@teamapp/api-client` → Hono RPC client factory
- `@teamapp/shared` → Shared utilities

---

## Rule CQ-4 — Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Files (routes) | `<domain>.<type>.ts` | `fighters.routes.ts` |
| Files (hooks) | `use<Domain>.ts` | `useFighter.ts` |
| Files (services) | `<domain>.api.ts` | `fighter.api.ts` |
| DB table names | `snake_case` strings | `"serialized_gear"` |
| DB column names | `snake_case` strings | `"team_id"` |
| TypeScript types | `PascalCase` | `Fighter`, `NewFighter` |
| Zod schemas | `PascalCase + Schema` | `NewFighterSchema` |
| Functions | `camelCase` | `createFighter`, `getScope` |
| React components | `PascalCase` | `FighterTable`, `AdminPanel` |
| Route handlers | match route export name | `list`, `create`, `getOne`, `patch`, `remove` |

---

## Rule CQ-5 — Error Handling Patterns

**Backend:**
```typescript
// Pattern for safe handler errors
if (!item) {
  return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
}

// Pattern for auth errors (use typed errors, NOT raw Error)
throw new UnauthorizedError("Authentication required");
throw new ForbiddenError("Insufficient permissions");
```

**Frontend:**
```typescript
// Pattern in service functions
if ("error" in json) throw new Error(formatApiError(json));
if (res.status !== 200) {
  const json = await res.json();
  throw new Error("message" in json ? json.message : formatApiError(json));
}

// Pattern in hooks
onError: (error: Error) => toast.error(error.message),
```

---

## Rule CQ-6 — Comments: When and How

**DO** comment:
- Complex business logic (attendance scope filtering, serial gear assignment)
- Non-obvious `as any` casts (explain why)
- TODO items with context: `// TODO: add requireRole('ADMIN') when admin panel is built`

**DO NOT** comment:
- Obvious code (`// set the name` before `const name = ...`)
- Commented-out code — delete it, git has history
- Auto-generated sections — leave them as-is with their own comments

---

## Rule CQ-7 — Environment Variables

Backend env vars are typed in `AppEnv.Bindings` in `lib/types.ts`.
**NEVER** access `process.env` in Cloudflare Workers — use `c.env.*`.

```typescript
// CORRECT — in Cloudflare Workers handler
const authSecret = c.env.AUTH_SECRET;
const db = createDb(c.env);  // env includes DB binding

// WRONG — process.env doesn't exist in CF Workers
const authSecret = process.env.AUTH_SECRET;  // ❌
```

Frontend env vars must be prefixed with `VITE_` and accessed via `import.meta.env.*`.

```typescript
// CORRECT — frontend
const apiBase = import.meta.env.VITE_API_URL;

// WRONG
const apiBase = process.env.VITE_API_URL;  // ❌
```
