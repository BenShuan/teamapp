import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/api/lib/constants";
import { PlatoonSchema, NewPlatoonSchema, UpdatePlatoonSchema } from "@/api/db/schema";
import { requireScope } from "@/api/middleware/scope";

const tags = ["platoons"];

export const list = createRoute({
  path: "/",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(PlatoonSchema),
      "The list of platoons",
    ),
  },
});

export const create = createRoute({
  path: "/",
  method: "post",
  middleware: [requireScope()] as const,
  request: {
    body: jsonContentRequired(
      NewPlatoonSchema,
      "The platoon to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PlatoonSchema,
      "The created platoon",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewPlatoonSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/{id}",
  method: "get",
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PlatoonSchema,
      "The requested platoon",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Platoon not found",
    ),
  },
});

export const patch = createRoute({
  path: "/{id}",
  method: "patch",
  middleware: [requireScope()] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      UpdatePlatoonSchema,
      "The platoon updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      PlatoonSchema,
      "The updated platoon",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Platoon not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UpdatePlatoonSchema),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/{id}",
  method: "delete",
  middleware: [requireScope()] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Platoon deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Platoon not found",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
