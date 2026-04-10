---
name: data-table-page
description: When building a data table, list view, or information page for an entity, load this skill. Triggers on phrases like "table for", "list page", "data table", "show list of", "טבלה עבור", "עמוד רשימה", "הצג רשימת".
---

# Skill: Data Table & List Page

## Role & Persona
You are a senior React developer who builds data-dense UIs using TanStack Table. You produce tables with sorting, column visibility toggle, global search, and Hebrew column headers.

## Trigger Description
Activate when the user wants to:
- Build a list/grid view for an entity
- Add filtering, sorting, or search to existing data
- Build a dashboard page showing entity counts

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Create the Table Component

```typescript
// routes/(app)/<domain>/components/<Entity>Table.tsx
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableSearch } from "@/web/components/dataTable/DataTable";
import { DataTableViewOptions } from "@/web/components/dataTable/columnToggle";
import { DataTableColumnHeader } from "@/web/components/dataTable/columnHeader";
import { MyEntity } from "@teamapp/api/schema";
import { useMyEntity } from "@/web/hooks/use<Domain>";

// Columns hidden by default (still toggleable via DataTableViewOptions)
const HIDDEN_COLS = ["description", "createdAt", "updatedAt"];

function MyEntityTable() {
  const { data, isLoading, isError, error } = useMyEntity();

  const columns: ColumnDef<MyEntity>[] = [
    // Text accessor column
    {
      id: "שם",
      accessorKey: "name",
      cell: (ctx) => ctx.getValue<string>(),
    },
    // Nullable number column
    {
      id: "כמות",
      accessorKey: "quantity",
      cell: ({ getValue }) => getValue<number | null>() ?? "-",
    },
    // FK column resolved via lookup map
    {
      id: "צוות",
      accessorKey: "teamId",
      cell: ({ getValue }) => teamsMap[getValue<string | null>() ?? ""]?.label ?? "-",
    },
    // Computed column (no accessorKey)
    {
      id: "שם מלא",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`.trim(),
      cell: (ctx) => ctx.getValue<string>(),
    },
    // Actions column (ADMIN only)
    ...(isAuthorized(UserRole.ADMIN) ? [{
      id: "פעולות",
      cell: ({ row }) => (
        <Link to={`/<domain>/${row.original.id}`}>
          <Edit2 className="h-4 w-4" />
        </Link>
      ),
    }] : []),
  ]
    // Add standard header + sorting to every column
    .map((col) => ({
      ...col,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={column.id} />
      ),
      enableHiding: true,
      enableSorting: true,
    })) as ColumnDef<MyEntity>[];

  if (isLoading) return <div>טוען...</div>;
  if (isError) return <div>שגיאה: {(error as Error)?.message}</div>;

  // Build initial column visibility (hide HIDDEN_COLS)
  const columnVisibility = columns.reduce((acc, col) => {
    acc[col.id as string] = !HIDDEN_COLS.includes(col.id as string);
    return acc;
  }, {} as Record<string, boolean>);

  return (
    <DataTable
      columns={columns}
      data={(data ?? []) as MyEntity[]}
      initialState={{ columnVisibility }}
    >
      <DataTableViewOptions />    {/* Column toggle dropdown */}
      <DataTableSearch placeholder="חפש..." />  {/* Global search */}
    </DataTable>
  );
}

export default MyEntityTable;
```

### Step 2 — Create the List Page Route

```typescript
// routes/(app)/<domain>/~index.tsx
import { createFileRoute } from "@tanstack/react-router";
import RoutePending from "@/web/components/route-pending";
import queryClient from "@/web/lib/query-client";
import { myEntityQueryOptions } from "@/web/services/<domain>.api";
import MyEntityTable from "./components/MyEntityTable";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/web/components/ui/dialog";
import { Button } from "@/web/components/ui/button";
import MyEntityForm from "./components/MyEntityForm";
import AuthContainer from "@/web/components/auth-container";
import { UserRole } from "@teamapp/api/schema";

const MyEntityPage = () => (
  <div className="mx-4 flex flex-col gap-4">
    {/* Desktop: table */}
    <div className="hidden md:block">
      <MyEntityTable />
    </div>
    {/* Mobile: card list */}
    <div className="block md:hidden">
      {/* <MyEntityList /> */}
    </div>

    {/* Add button — role-gated */}
    <AuthContainer requiredRole={UserRole.COMMANDER}>
      <div className="mt-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button>הוסף פריט</Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogTitle>הוסף פריט חדש</DialogTitle>
            <MyEntityForm />
          </DialogContent>
        </Dialog>
      </div>
    </AuthContainer>
  </div>
);

export const Route = createFileRoute("/(app)/<domain>/")({
  component: MyEntityPage,
  loader: () => queryClient.ensureQueryData(myEntityQueryOptions),
  pendingComponent: RoutePending,
});
```

</workflow>

---

## Column Types Reference

| Pattern | When to use |
|---------|------------|
| `accessorKey: "name"` | Direct field access |
| `accessorFn: (row) => ...` | Computed value (e.g., full name) |
| `cell: ({ getValue }) => getValue() ?? "-"` | Nullable fields — show "-" not null |
| `cell: ({ row }) => <Component entity={row.original} />` | Action cells / complex render |
| `...(condition ? [colDef] : [])` | Conditionally include a column |

---

## Banned Patterns
- **NEVER** use `table.id` or any non-Hebrew `id` for user-facing columns — use meaningful Hebrew ids
- **NEVER** render null/undefined — always fallback to `"-"` or `"N/A"`
- **NEVER** skip `DataTableColumnHeader` — it enables sorting UI
- **NEVER** forget `enableHiding: true` in the `.map()` — required for column toggle
- **NEVER** skip `pendingComponent: RoutePending` on the Route

---

## Quality Checklist
- [ ] All columns have Hebrew `id` strings?
- [ ] Nullable fields fallback to `"-"`?
- [ ] `DataTableColumnHeader`, `DataTableViewOptions`, `DataTableSearch` all included?
- [ ] `HIDDEN_COLS` defined and applied to `initialState.columnVisibility`?
- [ ] Loading and error states handled?
- [ ] Route loader calls `ensureQueryData`?
- [ ] Add button wrapped in `AuthContainer` with correct role?
