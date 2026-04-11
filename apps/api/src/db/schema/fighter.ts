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
    id: ID_FIELD("id"), // uuid
    idNumber: TEXT_OPTIONAL_FIELD("id_number"), // char(10)
    firstName: TEXT_REQUIRED_FIELD("first_name"), // varchar(50)
    lastName: TEXT_REQUIRED_FIELD("last_name"), // varchar(50)
    email: TEXT_OPTIONAL_FIELD("email"), // varchar(100)
    personalNumber: TEXT_REQUIRED_FIELD("personal_number"), // char(8)
    address: INTEGER_OPTIONAL_FIELD("address"),
    phoneNumber: TEXT_OPTIONAL_FIELD("phone_number"), // char(10)
    shoesSize: INTEGER_OPTIONAL_FIELD("shoes_size"), // tinyint
    shirtSize: TEXT_OPTIONAL_FIELD("shirt_size"), // varchar(5)
    pantsSize: TEXT_OPTIONAL_FIELD("pants_size"), // varchar(5)
    professional: TEXT_OPTIONAL_FIELD("professional"), // varchar(50)
    teamId: TEXT_OPTIONAL_FIELD("team_id").references(() => team.id, {
      onDelete: "set null",
    }), // references team(id) if available
    ironNumber: TEXT_OPTIONAL_FIELD("iron_number"), // tinyint
    class: TEXT_OPTIONAL_FIELD("class"), // varchar(1)
    kit: TEXT_OPTIONAL_FIELD("kit"), // varchar(10)
    currentStatus: TEXT_REQUIRED_ENUM_FIELD("current_status", currentStatus).default(currentStatusEnum.פעיל), // varchar(20)
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
export const fighterSchema = createSelectSchema(fighter,{});


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
export type Fighter = z.infer<typeof fighterSchema>;
