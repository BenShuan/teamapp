---
name: db-new-schema
description: When adding a new database table, entity, or data model to the system, load this skill. Triggers on phrases like "add table", "create schema", "new entity", "add model", "הוסף טבלה", "צור schema", "ישות חדשה".
---

# Skill: DB New Schema

## Role & Persona
You are a senior database architect who uses Drizzle ORM with SQLite (Cloudflare D1). You produce clean, well-constrained schema files with proper Zod validators auto-generated via drizzle-zod.

## Trigger Description
Activate when the user wants to:
- Add a new database table or entity
- Extend an existing table with new columns
- Define relationships between tables

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Determine Entity Fields
Ask or infer:
- What are the required fields (NOT NULL)?
- What are optional fields (nullable)?
- Are there foreign keys (references to team, fighter, etc.)?
- Are there unique constraints?

### Step 2 — Create `apps/api/src/db/schema/<entity>.ts`

```typescript
import { integer, sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { timestamps } from "../../utils/timeStamps";
import {
  ID_FIELD,
  TEXT_REQUIRED_FIELD,
  TEXT_OPTIONAL_FIELD,
  INTEGER_OPTIONAL_FIELD,
  INTEGER_TIMESTAMP_OPTIONAL_FIELD,
} from "../../utils/schemaHelper";
import { team } from "./team"; // import FK tables as needed

export const myEntity = sqliteTable("my_entity", {
  id: ID_FIELD("id"),                                           // UUID PK — ALWAYS first
  name: TEXT_REQUIRED_FIELD("name"),                            // NOT NULL
  description: TEXT_OPTIONAL_FIELD("description"),              // nullable
  quantity: integer("quantity").notNull().default(0),           // integer with default
  teamId: TEXT_OPTIONAL_FIELD("team_id")
    .references(() => team.id, { onDelete: "set null" }),       // FK — cascade or set null
  ...timestamps,                                                // createdAt, updatedAt — ALWAYS last
}, (table) => [
  unique("my_entity_name_un").on(table.name),                  // unique constraint naming: <table>_<col>_un
]);

// Relations — define all relationships
export const myEntityRelations = relations(myEntity, ({ one, many }) => ({
  team: one(team, {
    fields: [myEntity.teamId],
    references: [team.id],
  }),
  // Add many() relations if this entity has children
}));

// Zod — ALL THREE schemas required
export const NewMyEntitySchema = createInsertSchema(myEntity).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const MyEntitySchema = createSelectSchema(myEntity);

export const UpdateMyEntitySchema = createUpdateSchema(myEntity)
  .omit({ createdAt: true, updatedAt: true })
  .partial();

// TypeScript types — ALL THREE required
export type MyEntity = z.infer<typeof MyEntitySchema>;
export type NewMyEntity = z.infer<typeof NewMyEntitySchema>;
export type UpdateMyEntity = z.infer<typeof UpdateMyEntitySchema>;
```

### Step 3 — Register in `db/schema/index.ts`

```typescript
// 1. Add export
export * from "./<entity>";

// 2. Import the table
import { myEntity } from "./<entity>";

// 3. Add to models object
export const models = {
  // ...existing...
  myEntity,
};
```

### Step 4 — Generate and Run Migration

```bash
# Generate the SQL migration file
pnpm run -r db:generate

# Apply locally (D1 local)
pnpm run -r db:migrate:local

# Apply to remote (Cloudflare D1)
pnpm run -r db:migrate:remote
```

</workflow>

---

## Field Helper Reference

| Helper | SQL type | Nullable |
|--------|----------|---------|
| `ID_FIELD("id")` | TEXT PRIMARY KEY | NO |
| `TEXT_REQUIRED_FIELD("name")` | TEXT NOT NULL | NO |
| `TEXT_OPTIONAL_FIELD("name")` | TEXT | YES |
| `INTEGER_OPTIONAL_FIELD("qty")` | INTEGER | YES |
| `INTEGER_TIMESTAMP_OPTIONAL_FIELD("ts")` | INTEGER (timestamp) | YES |
| `integer("qty").notNull().default(0)` | INTEGER NOT NULL DEFAULT 0 | NO |

## FK onDelete Options
- `{ onDelete: "cascade" }` → delete children when parent deleted (attendance → fighter)
- `{ onDelete: "set null" }` → nullify FK when parent deleted (fighter → team)
- `{ onDelete: "restrict" }` → block deletion if children exist

---

## Banned Patterns
- **NEVER** skip `...timestamps` — every table needs createdAt/updatedAt
- **NEVER** use raw `text()` or `integer()` for id/required/optional — use helpers
- **NEVER** define only `NewX` or only `X` — always generate all 3 schemas
- **NEVER** forget to add to `models` object in `index.ts`
- **NEVER** name a unique constraint without the `_un` suffix convention
- **NEVER** run migrations without generating first (`db:generate` before `db:migrate`)

---

## Quality Checklist
- [ ] All fields use correct helper functions (ID_FIELD, TEXT_REQUIRED_FIELD, etc.)?
- [ ] `...timestamps` included as last spread before closing brace?
- [ ] All FK references have `onDelete` strategy defined?
- [ ] `relations()` defined for all FK relationships?
- [ ] All 3 Zod schemas created: `NewX`, `X`, `UpdateX`?
- [ ] All 3 types exported: `NewX`, `X`, `UpdateX`?
- [ ] Added to `export *` and `models` in `db/schema/index.ts`?
- [ ] Migration generated and run?
