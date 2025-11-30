import { authHandler } from "@hono/auth-js";
import { notFound, onError } from "stoker/middlewares";

import type { AppOpenAPI } from "./types";

import { BASE_PATH } from "./constants";
import createAuthConfig from "./create-auth-config";
import createRouter from "./create-router";
import authRouter from "../routes/auth/auth.index";
import { attachScope } from "../middleware/scope";
import { createAuthErrorHandler } from "../middleware/auth-errors";

export default function createApp() {
  const app = createRouter()
    .use("*", async (c, next) => {
      if (c.req.path.startsWith(BASE_PATH)) {
        return next();
      }
      // SPA redirect to /index.html
      const requestUrl = new URL(c.req.raw.url);

      let response = await c.env.ASSETS.fetch(new URL("/index.html", requestUrl.origin));


      // If not found, fallback to index.html
      if (response.status === 404) {
        response = await c.env.ASSETS.fetch(new Request('http://dummy/index.html'))
      }
      return response
    })
    .basePath(BASE_PATH) as AppOpenAPI;
  ``
  app
    .use(
      "*",
      async (c, next) => {
        console.log('c.url', c.req.url)
        c.set("authConfig", createAuthConfig(c.env));
        return next();
      },
    )
    .use("/auth/*", authHandler())
    .use("*", attachScope())
    .route('auth', authRouter)
    .notFound(notFound)
    .onError(createAuthErrorHandler());

  return app;
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route("/", router);
}
