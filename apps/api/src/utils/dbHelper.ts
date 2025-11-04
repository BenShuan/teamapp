import { NewFighterSchema, NewTeamSchema, NewAttendanceSchema, UpdateFighterSchema, UpdateTeamSchema, AttendanceSchema } from "../db/schema";




export const schemaNewSwitch = {
  fighter: NewFighterSchema,
  team: NewTeamSchema,
  // platoon: PlatoonSchema,
  attendance:NewAttendanceSchema
};
export const schemaUpdateSwitch = {
  fighter: UpdateFighterSchema,
  team: UpdateTeamSchema,
  // platoon: PlatoonSchema,
  attendance:AttendanceSchema
};
