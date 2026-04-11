import {  sqliteTable, unique } from "drizzle-orm/sqlite-core";
import { timestamps } from "../../utils/timeStamps";
import { ID_FIELD, INTEGER_TIMESTAMP_OPTIONAL_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIRED_FIELD } from "../../utils/schemaHelper";
import {  fighter } from "./fighter";
import { dutyPeriod } from "./dutyPeriod";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

export const statusLocations = ['נוכח', 'בבית', 'יוצא', 'מגיע'] as const;
export type StatusLocation = typeof statusLocations[number];
export const StatusLocationEnum = Object.fromEntries(statusLocations.map(loc => [loc, loc])) as {[key in StatusLocation]: key};


// Attendance table (uses fighter instead of employee)
export const attendance = sqliteTable("attendance", {
  // id: primary key (uuid via helper)
  id: ID_FIELD("id"),

  // fighterId: references fighters(id)
  fighterId: TEXT_REQUIRED_FIELD("fighter_id").references(() => fighter.id, {
    onDelete: "cascade",
  }),
  location: TEXT_REQUIRED_FIELD('location', { enum: statusLocations, default: StatusLocationEnum.נוכח }),
  // check-in/out as timestamps
  checkIn: INTEGER_TIMESTAMP_OPTIONAL_FIELD("check_in"),
  checkOut: INTEGER_TIMESTAMP_OPTIONAL_FIELD("check_out"),

  // work_date stored as text (YYYY-MM-DD)
  workDate: TEXT_REQUIRED_FIELD("work_date"),

  dutyPeriodId: TEXT_REQUIRED_FIELD("duty_period_id").references(() => dutyPeriod.id, {
    onDelete: "restrict",
  }),

  // notes as optional text
  notes: TEXT_OPTIONAL_FIELD("notes"),

  ...timestamps,
}, (table) => {
  return [
    unique("fighter_duty_period_date_UN").on(
      table.fighterId,
      table.dutyPeriodId,
      table.workDate,
    ),
  ];
});

export const attendaceRelations = relations(attendance, ({ one }) => ({
  fighter: one(fighter,{
    fields: [attendance.fighterId],
    references: [fighter.id],
  }),
  dutyPeriod: one(dutyPeriod, {
    fields: [attendance.dutyPeriodId],
    references: [dutyPeriod.id],
  }),
}));



// Insert validator (runtime)
export const NewAttendanceSchema = createInsertSchema(attendance);

// Select validator (useful for output shaping)
export const AttendanceSchema = createSelectSchema(attendance).extend({
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
});


// Select validator (useful for output shaping)
export const UpdateAttendanceSchema = createUpdateSchema(attendance).extend({
  checkIn: z.string().nullable().optional(),
  checkOut: z.string().nullable().optional(),
});

// Build a minimal fighter-with-attendances schema here to avoid a circular
// runtime dependency on `fighterSchema` (which can be undefined due to
// module init order). We only need a few fields from the fighter plus the
// attendances array, so construct the Zod schema directly.

export const FighterAttendanceSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  personalNumber: z.string(),
  attendances: z.array(AttendanceSchema),
});


export type FightersAttendance = z.infer<typeof FighterAttendanceSchema>;
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