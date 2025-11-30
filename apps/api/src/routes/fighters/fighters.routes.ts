import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/api/lib/constants";
import { fighterSchema, NewFighterSchema, UpdateFighterSchema } from "@/api/db/schema";
import { requireRole, requireScope } from "@/api/middleware/scope";



const tags = ["fighters"];

export const list = createRoute({
  path: "/",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(fighterSchema),
      "The list of tasks",
    )
  },
});

export const create = createRoute({
  path: "/",
  method: "post",
  middleware: [requireScope(),requireRole('COMMANDER')] as const, // TODO: Add requireRole('admin', 'commander', 'captain') if needed
  request: {
    body: jsonContentRequired(
      NewFighterSchema,
      "The fighter to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      fighterSchema,
      "The created fighter",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewFighterSchema),
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
      fighterSchema,
      "The requested fighters",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not fighters",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/{id}",
  method: "patch",
  middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander', 'captain') if needed
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      UpdateFighterSchema,
      "The fighter updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      fighterSchema,
      "The updated fighter",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Fighter not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UpdateFighterSchema)
        .or(createErrorSchema(IdUUIDParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/{id}",
  method: "delete",
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Task deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema),
      "Invalid id error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
