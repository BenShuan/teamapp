import { drizzle } from "drizzle-orm/d1";

import type { AppEnv } from "../lib/types";

import * as schema from "./schema";
import { fighter } from "./schema/fighter";
import { team } from "./schema/team";
import { platoon } from "./schema/platoon";
import { attendance } from "./schema/attendance";


export const models = {
  fighter,
  team,
  platoon,
  attendance
}

export function createDb(env: AppEnv["Bindings"]) {
  return drizzle(env.DB, {
    schema,
  });
}
