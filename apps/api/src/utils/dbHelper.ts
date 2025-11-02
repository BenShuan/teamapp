
import { NewAttendanceSchema, AttendanceSchema } from "../types/attendance";
import { NewFighterSchema, UpdateFighterSchema } from "../types/fighter";
import { PlatoonSchema } from "../types/platoon";
import { NewTeamSchema, UpdateTeamSchema } from "../types/team";


export const schemaNewSwitch = {
  fighter: NewFighterSchema,
  team: NewTeamSchema,
  platoon: PlatoonSchema,
  attendance:NewAttendanceSchema
};
export const schemaUpdateSwitch = {
  fighter: UpdateFighterSchema,
  team: UpdateTeamSchema,
  platoon: PlatoonSchema,
  attendance:AttendanceSchema
};
