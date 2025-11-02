import { sqliteTable } from "drizzle-orm/sqlite-core";
import { timestamps } from "../../utils/timeStamps";
import { ID_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIERD_FIELD } from "@/api/utils/schemeHelper";

export const platoon = sqliteTable("platoons", {
    id: ID_FIELD("id"),
    name: TEXT_REQUIERD_FIELD("name"),
    codeName: TEXT_REQUIERD_FIELD("code_name"),
    description: TEXT_OPTIONAL_FIELD("description"),
  ...timestamps,
});
