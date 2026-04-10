---
name: react-query-hook
description: When creating a custom React hook that wraps TanStack Query for data fetching or mutations, load this skill. Triggers on phrases like "add hook", "create useX hook", "query hook for", "הוסף hook", "צור hook ל", "useX".
---

# Skill: React Query Hook

## Role & Persona
You are a senior React developer who writes clean, composable custom hooks using TanStack Query v5. You always separate concerns: service layer (how to fetch) from hooks (when to fetch + derived data).

## Trigger Description
Activate when the user wants to:
- Create a `useX()` hook for data fetching
- Create mutation hooks (create, update, delete)
- Build a combined form hook (create/edit in one)

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Verify Service Layer Exists
Check `apps/web/src/services/<domain>.api.ts` exists with:
- `queryOptions` for list and item
- `createX`, `updateX`, `deleteX` functions
If missing → run **api-service-layer** skill first.

### Step 2 — Create `hooks/use<Domain>.ts`

```typescript
// apps/web/src/hooks/use<Domain>.ts
"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  myEntityQueryOptions,
  myEntityItemQueryOptions,
  createMyEntity,
  updateMyEntity,
  deleteMyEntity,
} from "@/web/services/<domain>.api";
import { MyEntity, NewMyEntity, UpdateMyEntity } from "@teamapp/api/schema";
import { queryKeys, type queriesMap } from "@/web/lib/queries";
import { toast } from "sonner";

// ─── QUERY HOOK ──────────────────────────────────────────────────────

/**
 * useMyEntity(id?) — fetches list or single item
 * Returns spread query + entityMap for use in Autocomplete / lookups
 */
export function useMyEntity(id?: string) {
  if (id) {
    return useQuery(myEntityItemQueryOptions(id));
  }

  const query = useQuery(myEntityQueryOptions);

  // Derived map: id -> { label, value } — use in AutocompleteField options
  const entityMap: queriesMap<MyEntity> = useMemo(() => {
    if (!Array.isArray(query.data)) return {};
    const map: queriesMap<MyEntity> = {};
    (query.data as MyEntity[]).forEach((item) => {
      if (item?.id) {
        map[item.id] = {
          label: item.name,   // ← change to display field
          value: item,
        };
      }
    });
    return map;
  }, [query.dataUpdatedAt]); // ← MUST use dataUpdatedAt, not data

  return { ...query, entityMap };
}

// ─── MUTATION HOOKS ──────────────────────────────────────────────────

export const useCreateMyEntity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: NewMyEntity) => createMyEntity(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myEntity.queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useUpdateMyEntity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMyEntity }) =>
      updateMyEntity({ id, data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myEntity.queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

export const useDeleteMyEntity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMyEntity(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myEntity.queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};

// ─── FORM HOOK (CREATE/EDIT COMBINED) ────────────────────────────────

/**
 * useMyEntityForm(isNew, id?) — single hook for both create and edit forms
 * Usage: const { mutateAsync, isPending } = useMyEntityForm(isNew, fighter?.id)
 */
export const useMyEntityForm = (isNew: boolean, id?: string | null) => {
  const qc = useQueryClient();
  const action = isNew
    ? (data: MyEntity) => createMyEntity(data as any)
    : (data: MyEntity) => updateMyEntity({ id: data.id, data });

  return useMutation<unknown, Error, MyEntity>({
    mutationFn: action,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.myEntity.queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });
};
```

</workflow>

---

## The `queriesMap<T>` Pattern

Used when components need a lookup map (e.g., for `AutocompleteField` or joining data):

```typescript
// type from lib/queries.ts:
export type queriesMap<T> = Record<string, { label: string; value: T }>;

// Usage in component:
const options = Object.values(entityMap).map(({ label, value }) => ({
  label,
  value: value.id,
}));
```

---

## Banned Patterns
- **NEVER** use `query.data` as useMemo dependency — use `query.dataUpdatedAt`
- **NEVER** call `toast` inside a component — only in hooks (`onError`) or services (`onSuccess`)
- **NEVER** skip `invalidateQueries` in `onSuccess` — stale data is a bug
- **NEVER** use the same hook for both list and detail without the `if (id)` guard
- **NEVER** hardcode query keys — use the string from `queryKeys.*`

---

## Quality Checklist
- [ ] Query hook returns `{ ...query, entityMap }` for lists?
- [ ] `useMemo` on `dataUpdatedAt` (not `data`) for derived maps?
- [ ] All 3 mutation hooks: create, update, delete?
- [ ] `onError` with `toast.error` on every mutation?
- [ ] `onSuccess` with `invalidateQueries` on every mutation?
- [ ] Form hook handles both isNew and edit cases?
