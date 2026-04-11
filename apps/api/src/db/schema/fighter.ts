import { sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { timestamps } from "../../utils/timeStamps";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { team } from "./team";
import { relations } from "drizzle-orm";
import { ID_FIELD, INTEGER_OPTIONAL_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIRED_FIELD, TEXT_REQUIRED_ENUM_FIELD } from "../../utils/schemaHelper";
import { attendance } from "./attendance";

export const currentStatus = [
  "פעיל",
  "לא פעיל",
  "פצוע",
  "פרישה"
] as const;
export type currentStatusType = typeof currentStatus[number];
export const currentStatusEnum = Object.fromEntries(currentStatus.map(loc => [loc, loc])) as { [key in currentStatusType]: key };


// Fighters table based on the FighterSchema fields
export const fighter = sqliteTable(
  "fighters",
  {
    id: ID_FIELD("id"),
    idNumber: TEXT_OPTIONAL_FIELD("id_number"),
    firstName: TEXT_REQUIRED_FIELD("first_name"),
    lastName: TEXT_REQUIRED_FIELD("last_name"),
    email: TEXT_OPTIONAL_FIELD("email"),
    personalNumber: TEXT_REQUIRED_FIELD("personal_number"),
    address: INTEGER_OPTIONAL_FIELD("address"),
    phoneNumber: TEXT_OPTIONAL_FIELD("phone_number"),
    shoesSize: INTEGER_OPTIONAL_FIELD("shoes_size"),
    shirtSize: TEXT_OPTIONAL_FIELD("shirt_size"),
    pantsSize: TEXT_OPTIONAL_FIELD("pants_size"),
    professional: TEXT_OPTIONAL_FIELD("professional"),
    teamId: TEXT_OPTIONAL_FIELD("team_id").references(() => team.id, {
      onDelete: "set null",
    }),
    ironNumber: TEXT_OPTIONAL_FIELD("iron_number"),
    class: TEXT_OPTIONAL_FIELD("class"),
    kit: TEXT_OPTIONAL_FIELD("kit"),
    currentStatus: TEXT_REQUIRED_ENUM_FIELD("current_status", currentStatus).default(currentStatusEnum.פעיל),
    ...timestamps,
  },
  (t) => [
    unique().on(t.idNumber),
    unique().on(t.personalNumber),
    unique().on(t.ironNumber, t.teamId),
  ]
);

export const fighterTeamRelations = relations(fighter, ({ one, many }) => ({
  team: one(team, {
    fields: [fighter.teamId],
    references: [team.id],
  }),
  attendances: many(attendance),
}));


// Insert validator (runtime)
export const NewFighterSchema = createInsertSchema(fighter).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Select validator (useful for output shaping)
export const fighterSchema = createSelectSchema(fighter);


// Select validator (useful for output shaping)
export const UpdateFighterSchema = createUpdateSchema(fighter, {
  createdAt: (schema) => schema.transform((str) => new Date(str)),
}).omit({
  createdAt: true,
  updatedAt: true,
}).required({
  id: true
});


export type NewFighter = z.infer<typeof NewFighterSchema>;
export type UpdateFighter = z.infer<typeof UpdateFighterSchema>;
export type Fighter = typeof fighter.$inferSelect;
