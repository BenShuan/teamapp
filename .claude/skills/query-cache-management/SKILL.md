---
name: query-cache-management
description: When managing TanStack Query cache, invalidating queries, prefetching, or defining query keys for a new domain, load this skill. Triggers on phrases like "query cache", "invalidate", "prefetch", "queryKey", "ניהול cache", "מפתח שאילתה".
---

# Skill: Query Cache Management

## Role & Persona
You are a senior React architect who designs clean, predictable query cache strategies using TanStack Query v5. You understand cache hierarchy, invalidation scopes, and when to prefetch vs. lazy-load.

## Trigger Description
Activate when the user wants to:
- Add query keys for a new entity
- Understand when/how to invalidate queries
- Set up route loaders for prefetching
- Optimize cache reuse between pages

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Define Query Keys in `lib/queries.ts`

ALL query keys for the project live in ONE place:

```typescript
// apps/web/src/lib/queries.ts

export type queriesMap<T> = Record<string, { label: string; value: T }>;

export const queryKeys = {
  // ── Auth ──────────────────────────────
  me: ["me"] as const,

  // ── Fighters ──────────────────────────
  fighters: { queryKey: ["fighter"] as const },
  fighterItem: (id: string) => ({ queryKey: ["fighter", id] as const }),

  // ── Teams ─────────────────────────────
  teams: { queryKey: ["team"] as const },
  teamItem: (id: string) => ({ queryKey: ["team", id] as const }),

  // ── Parameterized ─────────────────────
  // Use when query depends on filters/dates
  attendance: (startDate: Date, endDate: Date) => ({
    queryKey: ["attendance", startDate, endDate] as const,
  }),

  // ── New Domain (add here) ──────────────
  myEntity: { queryKey: ["my-entity"] as const },
  myEntityItem: (id: string) => ({ queryKey: ["my-entity", id] as const }),
};
```

### Step 2 — Invalidation Strategy

```typescript
// Invalidation hierarchy — wider key = more aggressive invalidation:

// Invalidate ALL queries for a domain (use after create/delete)
queryClient.invalidateQueries({ queryKey: ["my-entity"] });
// Invalidates: ["my-entity"], ["my-entity", "abc-123"], ["my-entity", date1, date2]

// Invalidate ONLY a specific item (use after update)
queryClient.invalidateQueries({ queryKey: ["my-entity", id] });
// Invalidates only: ["my-entity", "abc-123"]

// Invalidate EXACT match only (use rarely)
queryClient.invalidateQueries({
  queryKey: ["my-entity"],
  exact: true
});
// Invalidates only: ["my-entity"] — NOT item queries
```

### Step 3 — Prefetching in Route Loaders

```typescript
// Single entity prefetch
export const Route = createFileRoute("/(app)/my-entity/")({
  loader: () => queryClient.ensureQueryData(myEntityQueryOptions),
  pendingComponent: RoutePending,
});

// Parameterized prefetch
export const Route = createFileRoute("/(app)/my-entity/$id")({
  loader: ({ params }) =>
    queryClient.ensureQueryData(myEntityItemQueryOptions(params.id)),
  pendingComponent: RoutePending,
});

// Multiple parallel prefetches (home page pattern)
export const Route = createFileRoute("/(app)/home")({
  loader: () => {
    const today = new Date();
    return Promise.all([
      queryClient.ensureQueryData(fighterQueryOptions),
      queryClient.ensureQueryData(teamQueryOptions),
      queryClient.ensureQueryData(attendanceQueryOptions(today, today)),
    ]);
  },
  pendingComponent: RoutePending,
});
```

### Step 4 — Mutation Invalidation in Hooks

```typescript
// Standard pattern for all mutation hooks:
const useCreateX = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createX,
    onSuccess: () => {
      // Invalidate the list (triggers refetch of all X)
      qc.invalidateQueries({ queryKey: ["x"] });
    },
  });
};

const useUpdateX = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateX,
    onSuccess: (_, variables) => {
      // Invalidate just the updated item + the list
      qc.invalidateQueries({ queryKey: ["x"] });
    },
  });
};

const useDeleteX = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteX,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["x"] });
    },
  });
};
```

### Step 5 — The `dataUpdatedAt` Pattern for Derived State

```typescript
// WRONG — re-computes on every render even if data hasn't changed:
const map = useMemo(() => buildMap(query.data), [query.data]);

// CORRECT — only re-computes when data actually changes:
const map = useMemo(() => buildMap(query.data), [query.dataUpdatedAt]);
```

</workflow>

---

## Cache Behavior Reference

| Method | Description |
|--------|------------|
| `ensureQueryData()` | Fetches if not cached; returns cached if fresh |
| `prefetchQuery()` | Fetches in background; doesn't block |
| `invalidateQueries()` | Marks as stale; triggers refetch on next use |
| `setQueryData()` | Optimistically update cache (skip refetch) |
| `removeQueries()` | Clear cache for a key |

---

## Banned Patterns
- **NEVER** hardcode strings as query keys in hooks/services (e.g., `queryKey: ["fighter"]`) — always reference `queryKeys.*`
- **NEVER** call `refetch()` manually — use `invalidateQueries` instead
- **NEVER** use `query.data` as a `useMemo` dependency — use `query.dataUpdatedAt`
- **NEVER** skip a loader on a route that needs data — undefined data = runtime errors
- **NEVER** invalidate a parent key when you only changed a child — be precise

---

## Quality Checklist
- [ ] New query keys added to `lib/queries.ts`?
- [ ] All mutations call `invalidateQueries` in `onSuccess`?
- [ ] Route loaders call `ensureQueryData` (not `prefetchQuery`) for blocking?
- [ ] Multiple loaders use `Promise.all` for parallel loading?
- [ ] Derived maps use `dataUpdatedAt` dependency in `useMemo`?
