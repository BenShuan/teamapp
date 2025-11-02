import { sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { timestamps } from "../../utils/timeStamps";

import { team } from "./team";
import { relations } from "drizzle-orm";
import { ID_FIELD, INTEGER_OPTIONAL_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIERD_FIELD } from "@/api/utils/schemeHelper";

// Fighters table based on the FighterSchema fields
export const fighter = sqliteTable(
  "fighters",
  {
    id: ID_FIELD("id"), // uuid
    idNumber: TEXT_REQUIERD_FIELD("id_number"), // char(10)
    firstName: TEXT_REQUIERD_FIELD("first_name"), // varchar(50)
    lastName: TEXT_REQUIERD_FIELD("last_name"), // varchar(50)
    email: TEXT_OPTIONAL_FIELD("email"), // varchar(100)
    personalNumber: TEXT_REQUIERD_FIELD("personal_number"), // char(8)
    address: INTEGER_OPTIONAL_FIELD("address"),
    phoneNumber: TEXT_OPTIONAL_FIELD("phone_number"), // char(10)
    shoesSize: INTEGER_OPTIONAL_FIELD("shoes_size"), // tinyint
    shirtSize: TEXT_OPTIONAL_FIELD("shirt_size"), // varchar(5)
    pantsSize: TEXT_OPTIONAL_FIELD("pants_size"), // varchar(5)
    professional: TEXT_OPTIONAL_FIELD("professional"), // varchar(50)
    teamId: TEXT_OPTIONAL_FIELD("team_id").references(() => team.id, {
      onDelete: "set null",
    }), // references team(id) if available
    ironNumber: INTEGER_OPTIONAL_FIELD("iron_number"), // tinyint
    class: TEXT_OPTIONAL_FIELD("class"), // varchar(1)
    kit: TEXT_OPTIONAL_FIELD("kit"), // varchar(10)
    ...timestamps,
  },
  (t) => [
    unique().on(t.idNumber),
    unique().on(t.personalNumber),
    unique().on(t.ironNumber, t.teamId),
  ]
);

export const fighterTeamRelations = relations(fighter, ({ one }) => ({
  team: one(team),
}));