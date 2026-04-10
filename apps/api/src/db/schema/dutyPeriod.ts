import { integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

import { timestamps } from "../../utils/timeStamps";
import { ID_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIRED_FIELD } from "../../utils/schemaHelper";
import { attendance } from "./attendance";

export const dutyPeriod = sqliteTable("duty_period", {
  id: ID_FIELD("id"),
  name: TEXT_OPTIONAL_FIELD("name"),
  startDate: TEXT_REQUIRED_FIELD("start_date"),
  endDate: TEXT_REQUIRED_FIELD("end_date"),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const dutyPeriodRelations = relations(dutyPeriod, ({ many }) => ({
  attendances: many(attendance),
}));

export const NewDutyPeriodSchema = createInsertSchema(dutyPeriod).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const DutyPeriodSchema = createSelectSchema(dutyPeriod);
export const UpdateDutyPeriodSchema = createUpdateSchema(dutyPeriod)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();

export type NewDutyPeriod = z.infer<typeof NewDutyPeriodSchema>;
export type DutyPeriod = z.infer<typeof DutyPeriodSchema>;
export type UpdateDutyPeriod = z.infer<typeof UpdateDutyPeriodSchema>;
