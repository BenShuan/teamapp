import { sqliteTable } from "drizzle-orm/sqlite-core";
import { timestamps } from "../../utils/timeStamps";
import { ID_FIELD, INTEGER_TIMESTEMP_OPTIONAL_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIERD_FIELD } from "../../utils/schemeHelper";
import { fighter } from "./fighter";

// Attendance table (uses fighter instead of employee)
export const attendance = sqliteTable("attendance", {
  // id: primary key (uuid via helper)
  id: ID_FIELD("id"),

  // fighterId: references fighters(id)
  fighterId: TEXT_REQUIERD_FIELD("fighter_id").references(() => fighter.id, {
    onDelete: "cascade",
  }),

  // check-in/out as timestamps
  checkIn: INTEGER_TIMESTEMP_OPTIONAL_FIELD("check_in"),
  checkOut: INTEGER_TIMESTEMP_OPTIONAL_FIELD("check_out"),

  // work_date stored as text (YYYY-MM-DD)
  workDate: TEXT_REQUIERD_FIELD("work_date"),

  // notes as optional text
  notes: TEXT_OPTIONAL_FIELD("notes"),

  ...timestamps,
});
