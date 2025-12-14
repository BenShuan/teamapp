import { integer, sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { fighter } from "./fighter";
import { timestamps } from "../../utils/timeStamps";
import {
  ID_FIELD,
  TEXT_OPTIONAL_FIELD,
  TEXT_REQUIERD_FIELD,
} from "../../utils/schemeHelper";

export const gearTypes = ["אמרל", "קשר", "נשק", "כללי", "נפיצה", "חבלה"] as const;

// Gear catalog - defines types of gear (e.g., "Google", type: "כללי")
export const serializedGear = sqliteTable(
  "serialized_gear",
  {
    id: ID_FIELD("id"),
    name: TEXT_REQUIERD_FIELD("name"),
    type: TEXT_REQUIERD_FIELD("type", { enum: gearTypes }),
    ...timestamps,
  },
  (table) => [unique("gear_name_un").on(table.name)],
);

// Gear assignment - many-to-many between fighter and gear with instance data
export const serializedGearFighter = sqliteTable(
  "serialized_gear_fighter",
  {
    id: ID_FIELD("id"),
    serializedGearId: TEXT_REQUIERD_FIELD("serialized_gear_id").references(
      () => serializedGear.id,
      { onDelete: "cascade" },
    ),
    fighterId: TEXT_REQUIERD_FIELD("fighter_id").references(() => fighter.id, {
      onDelete: "cascade",
    }),
    fightersTeamId: TEXT_REQUIERD_FIELD("fighters_team_id").references(() => fighter.teamId, { onDelete: "cascade" }),
    serialNumber: TEXT_OPTIONAL_FIELD("serial_number"),
    issuedDate: TEXT_OPTIONAL_FIELD("issued_date"),
    lastCheckDate: TEXT_OPTIONAL_FIELD("last_check_date"),
    location: TEXT_OPTIONAL_FIELD("location"),
    ...timestamps,
  },
  (table) => [
    unique("serial_gear_un").on(table.serialNumber, table.serializedGearId),
  ],
);

export const serializedGearCheck = sqliteTable(
  "serialized_gear_check",
  {
    id: ID_FIELD("id"),
    serializedGearFighterId: TEXT_REQUIERD_FIELD("serialized_gear_fighter_id").references(
      () => serializedGearFighter.id,
      { onDelete: "cascade" },
    ),
    date: TEXT_REQUIERD_FIELD("date"),
    isCheck: integer("is_check", { mode: "boolean" }).notNull().default(false),
    ...timestamps,
  },
  (table) => [unique("gear_fighter_date_un").on(table.serializedGearFighterId, table.date)],
);

export const serializedGearRelations = relations(serializedGear, ({ many }) => ({
  assignments: many(serializedGearFighter),
}));

export const serializedGearFighterRelations = relations(serializedGearFighter, ({ one, many }) => ({
  gear: one(serializedGear, {
    fields: [serializedGearFighter.serializedGearId],
    references: [serializedGear.id],
  }),
  fighter: one(fighter, {
    fields: [serializedGearFighter.fighterId],
    references: [fighter.id],
  }),
  checks: many(serializedGearCheck),
}));

export const serializedGearCheckRelations = relations(
  serializedGearCheck,
  ({ one }) => ({
    assignment: one(serializedGearFighter, {
      fields: [serializedGearCheck.serializedGearFighterId],
      references: [serializedGearFighter.id],
    }),
  }),
);

// Gear catalog schemas
export const NewSerializedGearSchema = createInsertSchema(serializedGear).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const SerializedGearSchema = createSelectSchema(serializedGear);

export const UpdateSerializedGearSchema = createUpdateSchema(serializedGear)
  .omit({ createdAt: true, updatedAt: true })
  .partial();

// Gear assignment schemas
export const NewSerializedGearFighterSchema = createInsertSchema(serializedGearFighter).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const SerializedGearFighterSchema = createSelectSchema(serializedGearFighter).extend({
  checks: z.array(createSelectSchema(serializedGearCheck)).optional(),
});

export const UpdateSerializedGearFighterSchema = createUpdateSchema(serializedGearFighter)
  .omit({ createdAt: true, updatedAt: true })
  .partial();

// Check schemas
export const NewSerializedGearCheckSchema = createInsertSchema(serializedGearCheck).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const SerializedGearCheckSchema = createSelectSchema(serializedGearCheck);

export const UpdateSerializedGearCheckSchema = createUpdateSchema(serializedGearCheck)
  .omit({ createdAt: true, updatedAt: true })
  .partial();

// Types
export type SerializedGear = z.infer<typeof SerializedGearSchema>;
export type NewSerializedGear = z.infer<typeof NewSerializedGearSchema>;
export type UpdateSerializedGear = z.infer<typeof UpdateSerializedGearSchema>;

export type SerializedGearFighter = z.infer<typeof SerializedGearFighterSchema>;
export type NewSerializedGearFighter = z.infer<typeof NewSerializedGearFighterSchema>;
export type UpdateSerializedGearFighter = z.infer<typeof UpdateSerializedGearFighterSchema>;

export type SerializedGearCheck = z.infer<typeof SerializedGearCheckSchema>;
export type NewSerializedGearCheck = z.infer<typeof NewSerializedGearCheckSchema>;
export type UpdateSerializedGearCheck = z.infer<typeof UpdateSerializedGearCheckSchema>;
