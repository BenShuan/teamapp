---
name: api-new-route
description: When adding a new API endpoint, domain, or CRUD resource to the backend, load this skill. Triggers on phrases like "add route", "create endpoint", "add API for", "הוסף route", "הוסף endpoint", "צור API ל".
---

# Skill: API New Route

## Role & Persona
You are a senior Hono backend engineer who follows the TeamApp Route Trinity pattern strictly. You always write type-safe, scope-filtered, OpenAPI-documented endpoints.

## Trigger Description
Activate when the user wants to:
- Add a new API route or domain
- Add a new CRUD endpoint to an existing domain
- Extend the backend with new functionality

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Identify the Domain
- Determine the domain name (e.g., `notifications`, `reports`)
- Confirm: does this domain already exist or is it new?
- If new: create folder `apps/api/src/routes/<domain>/`

### Step 2 — Verify Schema Exists
- Check `apps/api/src/db/schema/<domain>.ts` exists
- If not → run **db-new-schema** skill FIRST before this skill
- Import needed schemas: `import { XSchema, NewXSchema, UpdateXSchema } from "@/api/db/schema"`

### Step 3 — Write `<domain>.routes.ts`
Create the route definitions using `createRoute` from `@hono/zod-openapi`.

```typescript
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";
import { notFoundSchema } from "@/api/lib/constants";
import { XSchema, NewXSchema, UpdateXSchema } from "@/api/db/schema";
import { requireScope, requireRole } from "@/api/middleware/scope";

const tags = ["<domain>"];

export const list = createRoute({
  path: "/", method: "get", tags,
  responses: { [HttpStatusCodes.OK]: jsonContent(z.array(XSchema), "List") },
});

export const create = createRoute({
  path: "/", method: "post", tags,
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: { body: jsonContentRequired(NewXSchema, "New item") },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(XSchema, "Created"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(NewXSchema), "Validation"),
  },
});

export const getOne = createRoute({
  path: "/{id}", method: "get", tags,
  request: { params: IdUUIDParamsSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(XSchema, "Item"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdUUIDParamsSchema), "Invalid id"),
  },
});

export const patch = createRoute({
  path: "/{id}", method: "patch", tags,
  middleware: [requireScope()] as const,
  request: { params: IdUUIDParamsSchema, body: jsonContentRequired(UpdateXSchema, "Updates") },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(XSchema, "Updated"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UpdateXSchema).or(createErrorSchema(IdUUIDParamsSchema)), "Validation"
    ),
  },
});

export const remove = createRoute({
  path: "/{id}", method: "delete", tags,
  middleware: [requireScope()] as const,
  request: { params: IdUUIDParamsSchema },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(IdUUIDParamsSchema), "Invalid id"),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
```

### Step 4 — Write `<domain>.handlers.ts`
Implement the business logic. ALWAYS filter by scope.

```typescript
import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import type { AppRouteHandler } from "@/api/lib/types";
import { createDb } from "@/api/db";
import { myTable } from "@/api/db/schema";
import { getScope } from "@/api/middleware/scope";
import { teamScopeWhere } from "@/api/lib/auth-scope";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";
import type { ListRoute, CreateRoute, GetOneRoute, PatchRoute, RemoveRoute } from "./<domain>.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const items = await db.query.myTable.findMany({
    where: teamScopeWhere(scope),
    orderBy: (fields, ops) => ops.desc(fields.createdAt),
  });
  return c.json(items);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const body = c.req.valid("json");
  const [inserted] = await db.insert(myTable).values(body).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const item = await db.query.myTable.findFirst({
    where: (fields, ops) => ops.and(
      ops.eq(fields.id, id),
      teamScopeWhere(getScope(c))?.(fields, ops)
    ),
  });
  if (!item) return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  return c.json(item, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  if (Object.keys(updates).length === 0) {
    return c.json({
      success: false,
      error: { issues: [{ code: ZOD_ERROR_CODES.INVALID_UPDATES, path: [], message: ZOD_ERROR_MESSAGES.NO_UPDATES }], name: "ZodError" }
    }, HttpStatusCodes.UNPROCESSABLE_ENTITY);
  }
  const [item] = await db.update(myTable).set(updates).where(eq(myTable.id, id)).returning();
  if (!item) return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  return c.json(item, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const scope = getScope(c);
  // Verify ownership before deletion
  const item = await db.query.myTable.findFirst({
    where: (fields, ops) => ops.and(
      ops.eq(fields.id, id),
      teamScopeWhere(scope)?.(fields, ops)
    ),
  });
  if (!item) return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  await db.delete(myTable).where(eq(myTable.id, id));
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
```

### Step 5 — Write `<domain>.index.ts`

```typescript
import createRouter from "@/api/lib/create-router";
import * as handlers from "./<domain>.handlers";
import * as routes from "./<domain>.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
```

### Step 6 — Register in `routes/index.ts`

```typescript
import myRouter from "./<domain>/<domain>.index";

export function registerRoutes(app: AppOpenAPI) {
  return app
    // ... existing ...
    .route("/<domain>", myRouter);
}
```

</workflow>

---

## Banned Patterns
- **NEVER** put business logic in `.routes.ts` — routes are declarations only
- **NEVER** skip `teamScopeWhere(scope)` on list/getOne for scoped entities
- **NEVER** use `any` in handler signatures — use `AppRouteHandler<RouteType>`
- **NEVER** add a route without registering it in `routes/index.ts`
- **NEVER** define middleware inline in handlers — use `middleware/scope.ts`

---

## Quality Checklist
Before delivering, verify:
- [ ] All 3 files created: `.routes.ts`, `.handlers.ts`, `.index.ts`?
- [ ] `list` and `getOne` handlers use `teamScopeWhere(scope)`?
- [ ] Protected routes have `requireScope()` or `requireRole()` middleware?
- [ ] Route registered in `apps/api/src/routes/index.ts`?
- [ ] All route type exports at bottom of `.routes.ts`?
