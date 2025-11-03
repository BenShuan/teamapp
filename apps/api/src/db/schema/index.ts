
export * from "./auth";
export * from "./fighter";
export * from "./platoon";
export * from "./team";
export * from "./attendance";
export * from "./platoon";

import { fighter } from "./fighter";
import { team } from "./team";
import { platoon } from "./platoon";
import { attendance } from "./attendance";


export const models = {
  fighter,
  team,
  platoon,
  attendance
}
