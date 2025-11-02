import { timestamps } from "../../utils/timeStamps";
import { platoon } from "./platoon";
import { relations } from "drizzle-orm";
import { fighter } from "./fighter";
import { ID_FIELD, TEXT_REQUIERD_FIELD, TEXT_OPTIONAL_FIELD } from "@/api/utils/schemeHelper";
import { sqliteTable } from "drizzle-orm/sqlite-core";

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