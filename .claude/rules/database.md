# Rule: Database

> These rules are **always active** for any code in `apps/api/src/db/`.

---

## Rule DB-1 — Always Use Field Helpers

Field definitions **MUST** use the helper functions from `utils/schemaHelper.ts`.
Never use raw Drizzle column functions for standard fields.

```typescript
// CORRECT
import { ID_FIELD, TEXT_REQUIRED_FIELD, TEXT_OPTIONAL_FIELD, INTEGER_OPTIONAL_FIELD } from "../../utils/schemaHelper";

export const myTable = sqliteTable("my_table", {
  id: ID_FIELD("id"),
  name: TEXT_REQUIRED_FIELD("name"),
  description: TEXT_OPTIONAL_FIELD("description"),
  count: INTEGER_OPTIONAL_FIELD("count"),
  ...timestamps,
});

// WRONG — raw Drizzle (misses UUID generation, inconsistent nullability)
export const myTable = sqliteTable("my_table", {
  id: text("id").primaryKey(),           // ❌ no UUID default
  name: text("name").notNull(),          // ❌ wrong helper
  description: text("description"),      // ❌ wrong helper
});
```

---

## Rule DB-2 — Timestamps Are Mandatory

Every table **MUST** include `...timestamps` as the last spread.
The `timestamps` helper adds `createdAt` and `updatedAt` automatically.

```typescript
// CORRECT
export const myTable = sqliteTable("my_table", {
  id: ID_FIELD("id"),
  name: TEXT_REQUIRED_FIELD("name"),
  ...timestamps,  // ← always last, always present
});

// WRONG
export const myTable = sqliteTable("my_table", {
  id: ID_FIELD("id"),
  name: TEXT_REQUIRED_FIELD("name"),
  // ❌ missing timestamps
});
```

---

## Rule DB-3 — Three Zod Schemas Per Table

Every table **MUST** have exactly three drizzle-zod schemas:

| Schema | Purpose | Omits |
|--------|---------|-------|
| `NewXSchema` | Validate insert payload | `id`, `createdAt`, `updatedAt` |
| `XSchema` | Validate select output / response | nothing |
| `UpdateXSchema` | Validate patch payload (all optional) | `createdAt`, `updatedAt` + `.partial()` |

```typescript
export const NewMyEntitySchema = createInsertSchema(myEntity).omit({
  id: true, createdAt: true, updatedAt: true,
});
export const MyEntitySchema = createSelectSchema(myEntity);
export const UpdateMyEntitySchema = createUpdateSchema(myEntity)
  .omit({ createdAt: true, updatedAt: true })
  .partial();

export type MyEntity = z.infer<typeof MyEntitySchema>;
export type NewMyEntity = z.infer<typeof NewMyEntitySchema>;
export type UpdateMyEntity = z.infer<typeof UpdateMyEntitySchema>;
```

---

## Rule DB-4 — Relations Must Match FKs

Every foreign key **MUST** have a corresponding `relations()` definition.
Relations are required for `db.query.*` to work (Drizzle relational queries).

```typescript
// FK defined:
teamId: TEXT_OPTIONAL_FIELD("team_id").references(() => team.id)

// Matching relation REQUIRED:
export const myEntityRelations = relations(myEntity, ({ one }) => ({
  team: one(team, {
    fields: [myEntity.teamId],
    references: [team.id],
  }),
}));
```

---

## Rule DB-5 — Unique Constraint Naming

Unique constraints **MUST** follow the naming convention: `<table>_<column>_un`

```typescript
// CORRECT
unique("fighters_personal_number_un").on(table.personalNumber)
unique("serial_gear_un").on(table.serialNumber, table.serializedGearId)

// WRONG — unnamed or wrong suffix
unique().on(table.personalNumber)                        // ❌ no name
unique("personalNumberConstraint").on(table.personalNumber) // ❌ wrong convention
```

---

## Rule DB-6 — FK `onDelete` is Required

Every `.references()` call **MUST** include `{ onDelete: ... }`.
Omitting it defaults to `RESTRICT` which may cause unexpected errors.

| Strategy | When to use |
|----------|-------------|
| `"cascade"` | Children must be deleted with parent (e.g., attendance → fighter) |
| `"set null"` | FK becomes null when parent deleted (e.g., fighter → team) |
| `"restrict"` | Block deletion if children exist (explicit, not default) |

---

## Rule DB-7 — Always Export from `db/schema/index.ts`

After creating a new schema file:
1. Add `export * from "./<entity>"` to the exports section
2. Import the table and add it to the `models` object

```typescript
// db/schema/index.ts
export * from "./<entity>";             // ← step 1

import { myEntity } from "./<entity>"; // ← step 2
export const models = {
  // ...existing...
  myEntity,                            // ← step 2
};
```

Without this, the relational query layer (`db.query.myEntity`) won't work.

---

## Rule DB-8 — Migration Workflow (Order Matters)

```bash
# 1. Edit schema file(s)
# 2. Generate SQL migration
pnpm run -r db:generate

# 3. Inspect the generated SQL in src/db/migrations/ — verify it's correct

# 4. Apply locally first
pnpm run -r db:migrate:local

# 5. Only after local succeeds — apply remote
pnpm run -r db:migrate:remote
```

**NEVER** apply remote before testing locally.
**NEVER** manually edit the generated migration SQL.
