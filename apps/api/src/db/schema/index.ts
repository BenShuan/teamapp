
export * from "./auth";
export * from "./fighter";
export * from "./platoon";
export * from "./team";
export * from "./attendance";
export * from "./platoon";
export * from "./membership";
export * from "./serializedGear";
export * from "./logisticGear";

import { fighter } from "./fighter";
import { team } from "./team";
import { platoon } from "./platoon";
import { attendance } from "./attendance";
import { userTeamMembership, userPlatoonMembership } from "./membership";
import { serializedGear, serializedGearFighter } from "./serializedGear";
import { logisticGear } from "./logisticGear";


export const models = {
  fighter,
  team,
  platoon,
  attendance,
  serializedGear,
  serializedGearFighter,
  userTeamMembership,
  userPlatoonMembership,
  logisticGear,
}
