import { timestamps } from "../../utils/timeStamps";
import { platoon } from "./platoon";
import { relations } from "drizzle-orm";
import { fighter } from "./fighter";
import { ID_FIELD, TEXT_REQUIERD_FIELD, TEXT_OPTIONAL_FIELD } from "@/api/utils/schemeHelper";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const team = sqliteTable("teams", {
  id: ID_FIELD("id"),
  name: TEXT_REQUIERD_FIELD("name"),
  teamNumber: TEXT_REQUIERD_FIELD("team_number"),
  description: TEXT_OPTIONAL_FIELD("description"),
  platoonId: TEXT_OPTIONAL_FIELD("platoon_id").references(()=>platoon.id),
  ...timestamps,
});
export const teamRelations = relations(team, ({ many }) => ({
  fighters: many(fighter),
}));


// Insert validator (runtime)
export const NewTeamSchema = createInsertSchema(team, {
}).omit({id: true, createdAt: true, updatedAt: true});

// Select validator (useful for output shaping)
export const teamSchema = createSelectSchema(team);


// Select validator (useful for output shaping)
export const UpdateTeamSchema = createUpdateSchema(team);


export type NewTeam = z.infer<typeof NewTeamSchema>;
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;
export type Team = z.infer<typeof teamSchema>;