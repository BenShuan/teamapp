/* eslint-disable ts/no-redeclare */
import createRouter from "@/api/lib/create-router";

import type { AppOpenAPI } from "../lib/types";

import { BASE_PATH } from "../lib/constants";
import index from "./index.route";
import fighter from "./fighters/fighters.index"
import team from "./teams/teams.index"
import attendance from "./attendance/attendance.index"

export function registerRoutes(app: AppOpenAPI) {
  return app
    .route("/", index)
    .route("/", fighter)
    .route("/", team)
    .route("/", attendance)
}

// stand alone router type used for api client
export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);
export type router = typeof router;
