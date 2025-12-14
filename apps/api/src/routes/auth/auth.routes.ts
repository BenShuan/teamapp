import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema } from "stoker/openapi/schemas";

import { createUserSchema, userSchema } from "@/api/db/schema/auth";
import { attachScope } from "@/api/middleware/scope";

const tags = ["auth"];

export const register = createRoute({
  path: "/register",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      createUserSchema,
      "Registration payload",
    ),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      userSchema,
      "Registered user summary",
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      z.object({ message: z.string() }),
      "Email already exists",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createUserSchema),
      "Validation error(s)",
    ),
  },
});

export type RegisterRoute = typeof register;

// User scope route (requires authenticated user) - returns resolved authorization scope
export const meScope = createRoute({
  path: "/scope",
  method: "get",
  tags,
  middleware: [attachScope()] as const,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        role: z.string(),
        unrestricted: z.boolean(),
        teamIds: z.array(z.string()).nullable(),
        platoonIds: z.array(z.string()).nullable(),
      }),
      "User authorization scope",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      z.object({ message: z.string() }),
      "Unauthorized",
    ),
  },
});

export type MeScopeRoute = typeof meScope;
