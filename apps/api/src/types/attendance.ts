import type { z } from "zod";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { attendance } from "../db/schema/attendance";


// Insert validator (runtime)
export const NewAttendanceSchema = createInsertSchema(attendance, {});

// Select validator (useful for output shaping)
export const AttendanceSchema = createSelectSchema(attendance);


// Select validator (useful for output shaping)
export const UpdateAttendanceSchema = createUpdateSchema(attendance);


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
