# Rule: API Design

> These rules are **always active** for any code in `apps/api/src/routes/`.

---

## Rule API-1 — The Route Trinity (Non-Negotiable)

Every domain in the API **MUST** be split into exactly 3 files.
No exceptions. No merging files.

```
routes/<domain>/
  <domain>.routes.ts    ← createRoute() ONLY — no logic
  <domain>.handlers.ts  ← business logic ONLY — no route definitions
  <domain>.index.ts     ← wire routes to handlers + export router
```

**Violation examples:**
```typescript
// WRONG — logic in routes file
export const list = createRoute({ ... });
export const listHandler = async (c) => { ... };  // ❌ not allowed here

// WRONG — createRoute() in handlers file
const route = createRoute({ ... });               // ❌ not allowed here
export const handler = async (c) => { ... };
```

---

## Rule API-2 — OpenAPI Documentation is Mandatory

Every route **MUST** be defined with `createRoute()` from `@hono/zod-openapi`.
Never use plain `app.get()` or `router.post()` — it bypasses OpenAPI schema validation.

```typescript
// CORRECT
export const create = createRoute({
  path: "/",
  method: "post",
  tags,
  request: { body: jsonContentRequired(NewFighterSchema, "Fighter data") },
  responses: { [HttpStatusCodes.OK]: jsonContent(fighterSchema, "Created fighter") },
});

// WRONG — bypasses validation and OpenAPI docs
router.post("/", async (c) => { ... });  // ❌
```

---

## Rule API-3 — Validation Schemas Come from `db/schema/`

Route request/response schemas **MUST** be imported from the schema layer (`@/api/db/schema`).
Never define inline Zod schemas inside route files unless they're query params.

```typescript
// CORRECT — import from schema layer
import { fighterSchema, NewFighterSchema } from "@/api/db/schema";

// WRONG — inline schema in routes file
const NewFighterSchema = z.object({ ... });  // ❌ duplicated, gets out of sync
```

---

## Rule API-4 — Error Responses Must Be Typed

Every non-200 response **MUST** include a typed schema in the route definition.

```typescript
// CORRECT
responses: {
  [HttpStatusCodes.OK]: jsonContent(fighterSchema, "Success"),
  [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),          // ← required
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(schema)), // ← required
},

// WRONG — missing error responses
responses: {
  [HttpStatusCodes.OK]: jsonContent(fighterSchema, "Success"),
  // ❌ missing NOT_FOUND and UNPROCESSABLE_ENTITY
},
```

---

## Rule API-5 — Scope Filter on List and GetOne

Any endpoint that returns data belonging to a team **MUST** apply `teamScopeWhere(scope)`.

```typescript
// CORRECT
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const scope = getScope(c);
  const items = await db.query.myTable.findMany({
    where: teamScopeWhere(scope),  // ← required
  });
  return c.json(items);
};

// WRONG — no scope filter (leaks data across teams)
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const items = await db.query.myTable.findMany();  // ❌ returns ALL items
  return c.json(items);
};
```

Exceptions: system-wide entities (e.g., `serializedGear` catalog types) that aren't team-scoped.

---

## Rule API-6 — Register Every New Router

Adding a route file without registering it in `routes/index.ts` is a **silent failure** — the route will not exist at runtime.

After creating `<domain>.index.ts`, **always** add to `registerRoutes()`:
```typescript
// apps/api/src/routes/index.ts
export function registerRoutes(app: AppOpenAPI) {
  return app
    .route("/<existing>", existingRouter)
    .route("/<new-domain>", newRouter);  // ← add here
}
```

---

## Rule API-7 — HTTP Status Code Semantics

Use `stoker/http-status-codes` and follow these conventions:

| Operation | Success code | Error codes |
|-----------|-------------|-------------|
| GET list | 200 OK | 400, 422 |
| GET one | 200 OK | 404, 422 |
| POST create | 200 OK | 422 |
| PATCH update | 200 OK | 404, 422 |
| DELETE | **204 NO_CONTENT** | 404, 422 |

DELETE returns **204** with **no body** → use `c.body(null, HttpStatusCodes.NO_CONTENT)`.
