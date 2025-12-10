import type { OpenAPIHono, RouteConfig, RouteHandler } from "@hono/zod-openapi";

import type { BASE_PATH } from "./constants";
import { models } from "../db";
import { UserScope } from "./auth-scope";

export type AppEnv = {
  Bindings: {
    AUTH_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    ASSETS: Fetcher;
    DB: D1Database;
  };
  Variables: {
    authToken: string;
    scope: UserScope | null;
    userId: string | null;
  }

};

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
export type tModel = keyof typeof models