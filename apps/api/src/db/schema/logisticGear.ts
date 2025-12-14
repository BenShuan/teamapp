import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { team } from "./team";
import { timestamps } from "../../utils/timeStamps";
import { ID_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIERD_FIELD } from "../../utils/schemeHelper";

export const logisticGear = sqliteTable("logistic_gear", {
  id: ID_FIELD("id"),
  name: TEXT_REQUIERD_FIELD("name"),
  description: TEXT_OPTIONAL_FIELD("description"),
  quantity: integer("quantity").notNull().default(0),
  location: TEXT_OPTIONAL_FIELD("location"),
  teamId: TEXT_REQUIERD_FIELD("team_id").references(() => team.id, { onDelete: "cascade" }),
  timeOfIssue: TEXT_OPTIONAL_FIELD("time_of_issue"),
  ...timestamps,
});

export const logisticGearRelations = relations(logisticGear, ({ one }) => ({
  team: one(team, {
    fields: [logisticGear.teamId],
    references: [team.id],
  }),
}));

export const NewLogisticGearSchema = createInsertSchema(logisticGear).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const LogisticGearSchema = createSelectSchema(logisticGear);

export const UpdateLogisticGearSchema = createUpdateSchema(logisticGear)
  .omit({ createdAt: true, updatedAt: true })
  .partial();

export type LogisticGear = z.infer<typeof LogisticGearSchema>;
export type NewLogisticGear = z.infer<typeof NewLogisticGearSchema>;
export type UpdateLogisticGear = z.infer<typeof UpdateLogisticGearSchema>;
