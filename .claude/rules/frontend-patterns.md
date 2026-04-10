# Rule: Frontend Patterns

> These rules are **always active** for any code in `apps/web/src/`.

---

## Rule FE-1 — Types Always Come from `@teamapp/api/schema`

**NEVER** redefine types that already exist in the schema layer.
The `@teamapp/api` package exposes all DB types via the `schema` export.

```typescript
// CORRECT
import { Fighter, NewFighter, Team } from "@teamapp/api/schema";

// WRONG — duplicated type definition
type Fighter = {              // ❌ will drift out of sync
  id: string;
  firstName: string;
  ...
};
```

---

## Rule FE-2 — API Calls Only Through `api-client`

All HTTP requests **MUST** go through the Hono RPC client.
Never use `fetch()` directly or `axios`.

```typescript
// CORRECT
import apiClient from "@/web/lib/api-client";
const res = await apiClient.api.fighters.$get();

// WRONG
const res = await fetch("/api/fighters");  // ❌ loses type safety
```

---

## Rule FE-3 — Service Layer is the Only Place for API Calls

API calls belong in `services/<domain>.api.ts`.
Hooks call service functions. Components call hooks. Period.

```
Component → Hook → Service → apiClient
```

```typescript
// CORRECT — component uses hook
function FighterList() {
  const { data } = useFighters();  // ← hook
  ...
}

// WRONG — component calls API directly
function FighterList() {
  const { data } = useQuery({ queryFn: () => apiClient.api.fighters.$get() }); // ❌
  ...
}
```

---

## Rule FE-4 — Query Keys Live Only in `lib/queries.ts`

**NEVER** hardcode query key strings anywhere except `lib/queries.ts`.
All invalidation and cache reads must reference `queryKeys.*`.

```typescript
// CORRECT
import { queryKeys } from "@/web/lib/queries";
queryClient.invalidateQueries({ queryKey: queryKeys.fighters.queryKey });

// WRONG
queryClient.invalidateQueries({ queryKey: ["fighter"] });  // ❌ magic string
```

---

## Rule FE-5 — Route Loaders Must Prefetch Data

Every route that needs data **MUST** prefetch it in the loader using `ensureQueryData`.
This prevents loading spinners on navigation (data is ready before component renders).

```typescript
// CORRECT
export const Route = createFileRoute("/(app)/fighter/")({
  component: FightersPage,
  loader: () => queryClient.ensureQueryData(fighterQueryOptions),  // ← prefetch
  pendingComponent: RoutePending,
});

// WRONG — no loader, data fetches after render
export const Route = createFileRoute("/(app)/fighter/")({
  component: FightersPage,  // ❌ no loader = loading spinner on every nav
});
```

---

## Rule FE-6 — `FormProvider` Is Required for All Forms

Every form **MUST** use `FormProvider` from react-hook-form.
This allows Field components to auto-connect without receiving `control` as a prop.

```typescript
// CORRECT
const methods = useForm<Fighter>();
return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <TextField name="firstName" label="שם פרטי" />  {/* auto-connects */}
    </form>
  </FormProvider>
);

// WRONG — manual control passing
<TextField name="firstName" control={methods.control} />  // ❌ verbose, avoidable
```

---

## Rule FE-7 — `useMemo` Dependency Must Be `dataUpdatedAt`

When deriving lookup maps from query data, always use `dataUpdatedAt` as the memo dependency.
Using `data` directly causes unnecessary re-renders on every render cycle.

```typescript
// CORRECT
const entityMap = useMemo(() => buildMap(query.data), [query.dataUpdatedAt]);

// WRONG — re-runs every render even when data hasn't changed
const entityMap = useMemo(() => buildMap(query.data), [query.data]);  // ❌
```

---

## Rule FE-8 — Toast Notifications Belong in Services and Hooks

`toast.success()` → in service functions (after successful mutation)
`toast.error()` → in hook `onError` callbacks

**NEVER** call toast inside a React component or JSX.

```typescript
// CORRECT — in service function
export const createFighter = async (data) => {
  const res = await apiClient.api.fighters.$post({ json: data });
  toast.success("לוחם נוצר בהצלחה");  // ← service layer
  return res.json();
};

// WRONG — in component
const handleSubmit = async () => {
  await createFighter(data);
  toast.success("...");  // ❌ component should not know about toast
};
```

---

## Rule FE-9 — RTL Layout Convention

All dialog content and forms must have `dir="rtl"`.
Hebrew UI text is right-to-left. Missing `dir` causes misaligned layouts.

```typescript
// CORRECT
<DialogContent dir="rtl" className="max-w-2xl">
  ...
</DialogContent>

// WRONG
<DialogContent className="max-w-2xl">  {/* ❌ missing dir */}
  ...
</DialogContent>
```

---

## Rule FE-10 — File Naming for TanStack Router

TanStack Router requires specific file naming conventions:

| Convention | Meaning |
|-----------|---------|
| `~index.tsx` | Index route for the path |
| `~$id.tsx` | Dynamic segment (`:id`) |
| `~route.tsx` | Layout wrapper for children |
| `~__root.tsx` | Root layout (only one, at the top) |
| `~(group)/` | Grouped routes (don't add to URL path) |

**NEVER** use plain `index.tsx` or `App.tsx` inside routes — the `~` prefix is required.

---

## Rule FE-11 — shadcn/ui Components Are in `components/ui/`

Never install raw Radix UI components directly. Always use the shadcn/ui wrappers in `components/ui/`.
If a component doesn't exist, add it via `npx shadcn@latest add <component>`.

```typescript
// CORRECT
import { Button } from "@/web/components/ui/button";
import { Dialog } from "@/web/components/ui/dialog";

// WRONG
import * as Dialog from "@radix-ui/react-dialog";  // ❌ bypass shadcn wrapper
```
