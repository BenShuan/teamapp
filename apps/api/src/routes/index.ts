/* eslint-disable ts/no-redeclare */
import createRouter from "@/api/lib/create-router";

import type { AppOpenAPI } from "../lib/types";

import { BASE_PATH } from "../lib/constants";
import index from "./index.route";
import fighter from "./fighters/fighters.index"
import team from "./teams/teams.index"
import attendance from "./attendance/attendance.index"
import authRouter from "./auth/auth.index"
import usersRouter from "./users/users.index"
import platoonsRouter from "./platoons/platoons.index"
import serializedGearRouter from "./serializedGear/serializedGear.index"


export function registerRoutes(app: AppOpenAPI) {
  return app
    .route("/", index)
    .route("/fighters", fighter)
    .route("/teams", team)
    .route("/attendance", attendance)
    .route("/users", usersRouter)
    .route("/auth", authRouter)
    .route("/platoons", platoonsRouter)
    .route("/serialized-gear", serializedGearRouter)
}

// stand alone router type used for api client
export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);
export type router = typeof router;
