---
name: api-service-layer
description: When adding frontend API calls, service functions, or queryOptions for a new domain, load this skill. Triggers on phrases like "add service", "create api calls", "queryOptions for", "הוסף service", "הוסף קריאות API", "צור queryOptions".
---

# Skill: API Service Layer

## Role & Persona
You are a senior React developer specializing in data-fetching patterns. You write clean, type-safe service functions using Hono RPC client and TanStack Query `queryOptions`.

## Trigger Description
Activate when the user wants to:
- Add new API call functions for a domain
- Create `queryOptions` for a new entity
- Add CRUD service functions (create, update, delete)

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Add Query Keys to `lib/queries.ts`

```typescript
// apps/web/src/lib/queries.ts
export const queryKeys = {
  // ...existing keys...

  // Simple list + item pattern
  myEntity:     { queryKey: ["my-entity"] as const },
  myEntityItem: (id: string) => ({ queryKey: ["my-entity", id] as const }),

  // Parameterized (e.g., date range like attendance)
  myEntityByRange: (start: Date, end: Date) => ({
    queryKey: ["my-entity", start, end] as const,
  }),
};
```

### Step 2 — Create `services/<domain>.api.ts`

```typescript
// apps/web/src/services/<domain>.api.ts
import apiClient from "@/web/lib/api-client";
import formatApiError from "@/web/lib/format-api-error";
import { queryKeys } from "@/web/lib/queries";
import { queryOptions } from "@tanstack/react-query";
import { MyEntity, NewMyEntity, UpdateMyEntity } from "@teamapp/api/schema";
import { toast } from "sonner";

// ─── QUERIES ─────────────────────────────────────────────

/** Fetch all items */
export const myEntityQueryOptions = queryOptions({
  ...queryKeys.myEntity,
  queryFn: async () => {
    const res = await apiClient.api["my-entity"].$get();
    return res.json();
  },
});

/** Fetch single item by ID */
export const myEntityItemQueryOptions = (id: string) => queryOptions({
  ...queryKeys.myEntityItem(id),
  queryFn: async () => {
    const res = await apiClient.api["my-entity"][":id"].$get({ param: { id } });
    const json = await res.json();
    if ("message" in json) throw new Error(json.message);
    return json;
  },
});

// ─── MUTATIONS ───────────────────────────────────────────

/** Create a new item */
export const createMyEntity = async (data: NewMyEntity) => {
  const res = await apiClient.api["my-entity"].$post({ json: data as any });
  const json = await res.json();
  if ("error" in json) throw new Error(formatApiError(json));
  toast.success("פריט נוצר בהצלחה");
  return json;
};

/** Update an existing item */
export const updateMyEntity = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateMyEntity;
}) => {
  const res = await apiClient.api["my-entity"][":id"].$patch({
    param: { id },
    json: data as any,
  });
  if (res.status !== 200) {
    const json = await res.json();
    throw new Error("message" in json ? json.message : formatApiError(json));
  }
  toast.success("פריט עודכן בהצלחה");
  return res.json();
};

/** Delete an item */
export const deleteMyEntity = async (id: string) => {
  const res = await apiClient.api["my-entity"][":id"].$delete({ param: { id } });
  if (res.status !== 204) {
    const json = await res.json();
    throw new Error("message" in json ? json.message : formatApiError(json));
  }
  toast.success("פריט נמחק בהצלחה");
};
```

</workflow>

---

## RPC Client URL Patterns

| API Route | RPC Call |
|-----------|----------|
| `GET /fighters` | `apiClient.api.fighters.$get()` |
| `GET /fighters/:id` | `apiClient.api.fighters[":id"].$get({ param: { id } })` |
| `POST /fighters` | `apiClient.api.fighters.$post({ json: body })` |
| `PATCH /fighters/:id` | `apiClient.api.fighters[":id"].$patch({ param: { id }, json: body })` |
| `DELETE /fighters/:id` | `apiClient.api.fighters[":id"].$delete({ param: { id } })` |
| `GET /attendance?startDate=&endDate=` | `apiClient.api.attendance.$get({ query: { startDate, endDate } })` |

---

## Banned Patterns
- **NEVER** call `fetch()` directly — always use `apiClient` from `@/web/lib/api-client`
- **NEVER** hardcode query keys (e.g., `queryKey: ["fighter"]`) — use `queryKeys.*`
- **NEVER** show `toast` in components — only in service functions
- **NEVER** import schema types directly from the schema file — use `@teamapp/api/schema`
- **NEVER** forget `as any` cast on json body (Hono RPC type strictness workaround)

---

## Quality Checklist
- [ ] Query keys added to `apps/web/src/lib/queries.ts`?
- [ ] `queryOptions` defined for list and item queries?
- [ ] All mutation functions (create, update, delete) written?
- [ ] `toast.success()` on every successful mutation?
- [ ] Error handling with `formatApiError` on non-200 responses?
- [ ] Types imported from `@teamapp/api/schema` (not local definitions)?
