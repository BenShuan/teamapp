import { sqliteTable } from "drizzle-orm/sqlite-core";
import { timestamps } from "../../utils/timeStamps";
import { ID_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIERD_FIELD } from "../../utils/schemeHelper";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

export const platoon = sqliteTable("platoons", {
  id: ID_FIELD("id"),
  name: TEXT_REQUIERD_FIELD("name"),
  codeName: TEXT_REQUIERD_FIELD("code_name"),
  description: TEXT_OPTIONAL_FIELD("description"),
  ...timestamps,
});

export const NewPlatoonSchema = createInsertSchema(platoon);
export const PlatoonSchema = createSelectSchema(platoon).required({ id: true });
export const UpdatePlatoonSchema = createUpdateSchema(platoon).omit({
  createdAt: true,
  updatedAt: true,
}).partial();

export type NewPlatoon = z.infer<typeof NewPlatoonSchema>;
export type UpdatePlatoon = z.infer<typeof UpdatePlatoonSchema>;
export type Platoon = z.infer<typeof PlatoonSchema>;
