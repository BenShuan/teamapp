import { sqliteTable } from "drizzle-orm/sqlite-core";
import { timestamps } from "../../utils/timeStamps";
import { ID_FIELD, INTEGER_TIMESTEMP_OPTIONAL_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIERD_FIELD } from "../../utils/schemeHelper";
import { fighter } from "./fighter";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

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




// Insert validator (runtime)
export const NewAttendanceSchema = createInsertSchema(attendance, {});

// Select validator (useful for output shaping)
export const AttendanceSchema = createSelectSchema(attendance);


// Select validator (useful for output shaping)
export const UpdateAttendanceSchema = createUpdateSchema(attendance).partial();


export type NewAttendance = z.infer<typeof NewAttendanceSchema>;
export type UpdateAttendance = z.infer<typeof UpdateAttendanceSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;



// export const selectTasksSchema = createSelectSchema(tasks);
// export type selectTasksSchema = z.infer<typeof selectTasksSchema>;

// export const insertTasksSchema = createInsertSchema(
//   tasks,
//   {
//     name: schema => schema.min(1).max(500),
//   },
// ).required({
//   done: true,
// }).omit({
//   id: true,
//   createdAt: true,
//   updatedAt: true,
// });
// export type insertTasksSchema = z.infer<typeof insertTasksSchema>;

// export const patchTasksSchema = insertTasksSchema.partial();
// export type patchTasksSchema = z.infer<typeof patchTasksSchema>;