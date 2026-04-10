---
name: tanstack-router-page
description: When adding a new page, route, or screen to the web application, load this skill. Triggers on phrases like "add page", "new route", "create page for", "add screen", "הוסף דף", "דף חדש", "צור עמוד".
---

# Skill: TanStack Router Page

## Role & Persona
You are a senior React developer who builds file-based routes using TanStack Router. You always pre-fetch data in loaders and use proper file naming conventions.

## Trigger Description
Activate when the user wants to:
- Add a new page to the web application
- Add a detail/edit page for an entity
- Add a nested route or sub-page

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Determine Route Location

All app pages live under `apps/web/src/routes/`:
```
~(app)/      ← Protected routes (requires auth)
~auth/       ← Public auth pages (login, register)
~admin/      ← Admin-only pages
```

### Step 2 — File Naming Convention

| File name | URL | Purpose |
|-----------|-----|---------|
| `~index.tsx` | `/<domain>/` | List page |
| `~$id.tsx` | `/<domain>/:id` | Detail/edit page |
| `~route.tsx` | parent layout | Shared layout (sidebar, etc.) |

### Step 3 — Create List Page `~index.tsx`

```typescript
// routes/(app)/<domain>/~index.tsx
import { createFileRoute } from "@tanstack/react-router";
import RoutePending from "@/web/components/route-pending";
import queryClient from "@/web/lib/query-client";
import { myEntityQueryOptions } from "@/web/services/<domain>.api";
import MyEntityPage from "./components/MyEntityPage";

const MyDomainIndexPage = () => (
  <div className="mx-4 flex flex-col gap-4">
    {/* Page content here */}
    <MyEntityPage />
  </div>
);

export const Route = createFileRoute("/(app)/<domain>/")({
  component: MyDomainIndexPage,
  loader: () => queryClient.ensureQueryData(myEntityQueryOptions),
  pendingComponent: RoutePending,
});
```

### Step 4 — Create Detail/Edit Page `~$id.tsx`

```typescript
// routes/(app)/<domain>/~$id.tsx
import { createFileRoute } from "@tanstack/react-router";
import queryClient from "@/web/lib/query-client";
import { myEntityItemQueryOptions } from "@/web/services/<domain>.api";
import { useMyEntity } from "@/web/hooks/use<Domain>";
import MyEntityForm from "./components/MyEntityForm";
import RoutePending from "@/web/components/route-pending";

const MyEntityDetailPage = () => {
  const { id } = Route.useParams();
  const { data: entity, isLoading } = useMyEntity(id);

  if (isLoading) return <div>טוען...</div>;
  if (!entity || "message" in entity) return <div>לא נמצא</div>;

  return (
    <div className="mx-4">
      <MyEntityForm entity={entity as any} />
    </div>
  );
};

export const Route = createFileRoute("/(app)/<domain>/$id")({
  component: MyEntityDetailPage,
  loader: ({ params }) =>
    queryClient.ensureQueryData(myEntityItemQueryOptions(params.id)),
  pendingComponent: RoutePending,
});
```

### Step 5 — Create Shared Layout `~route.tsx` (optional)

```typescript
// routes/(app)/<domain>/~route.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

const DomainLayout = () => (
  <div className="flex flex-col gap-4">
    {/* Shared header, tabs, etc. */}
    <Outlet />
  </div>
);

export const Route = createFileRoute("/(app)/<domain>")({
  component: DomainLayout,
});
```

### Step 6 — Add to Navigation (if needed)

```typescript
// apps/web/src/components/app-sidebar.tsx or nav-main.tsx
// Add route entry to the navItems array:
{
  title: "שם הדף",
  url: "/<domain>",
  icon: SomeIcon,
  requiresRole: [UserRole.COMMANDER, UserRole.ADMIN],  // optional role gate
}
```

</workflow>

---

## Loader Patterns

```typescript
// Single query
loader: () => queryClient.ensureQueryData(myEntityQueryOptions)

// Parameterized query
loader: ({ params }) => queryClient.ensureQueryData(myEntityItemQueryOptions(params.id))

// Multiple queries in parallel
loader: () => Promise.all([
  queryClient.ensureQueryData(fighterQueryOptions),
  queryClient.ensureQueryData(teamQueryOptions),
])

// With date params
loader: () => {
  const today = new Date();
  return queryClient.ensureQueryData(attendanceQueryOptions(today, today));
}
```

---

## Banned Patterns
- **NEVER** use `const navigate = useNavigate()` for loaders — loaders are outside React
- **NEVER** skip `pendingComponent: RoutePending` — it prevents layout shift
- **NEVER** fetch data inside the component if it should be pre-fetched in loader
- **NEVER** name files without the `~` prefix — TanStack Router requires it
- **NEVER** use `Route.useParams()` outside the component of that specific route file

---

## Quality Checklist
- [ ] File name starts with `~`?
- [ ] `createFileRoute` path matches the file location exactly?
- [ ] `loader` calls `ensureQueryData` for all required data?
- [ ] `pendingComponent: RoutePending` set?
- [ ] For `$id` routes: `Route.useParams()` used (not `useParams()` from router)?
- [ ] Navigation item added to sidebar if this is a main section?
