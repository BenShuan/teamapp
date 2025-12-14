import { drizzle } from "drizzle-orm/d1";

import type { AppEnv } from "../lib/types";

import * as schema from "./schema";



export const models = {
  fighter: schema.fighter,
  team: schema.team,
  platoon: schema.platoon,
  attendance: schema.attendance,
  serializedGear: schema.serializedGear,
  user: schema.users,
  serializedGearFighter: schema.serializedGearFighter,
  serializedGearCheck: schema.serializedGearCheck,
  logisticGear: schema.logisticGear,
  userTeamMembership: schema.userTeamMembership,
  userPlatoonMembership: schema.userPlatoonMembership,
};


export function createDb(env: AppEnv["Bindings"]) {
  return drizzle(env.DB, {
    schema,
  });
}
