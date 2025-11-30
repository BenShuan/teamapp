
export * from "./auth";
export * from "./fighter";
export * from "./platoon";
export * from "./team";
export * from "./attendance";
export * from "./platoon";
export * from "./membership";

import { fighter } from "./fighter";
import { team } from "./team";
import { platoon } from "./platoon";
import { attendance } from "./attendance";
import { userTeamMembership, userPlatoonMembership } from "./membership";


export const models = {
  fighter,
  team,
  platoon,
  attendance
  , userTeamMembership
  , userPlatoonMembership
}
