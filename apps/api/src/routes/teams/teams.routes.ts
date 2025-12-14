import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/api/lib/constants";
import { teamSchema, NewTeamSchema, UpdateTeamSchema } from "@/api/db/schema";
import { requireScope } from "@/api/middleware/scope";



const tags = ["teams"];

export const list = createRoute({
  path: "/",
  method: "get",
  middleware: [requireScope()] as const,
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(teamSchema),
      "The list of teams",
    ),
  },
});

export const create = createRoute({
  path: "/",
  method: "post",
  middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed
  request: {
    body: jsonContentRequired(
      NewTeamSchema,
      "The team to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      teamSchema,
      "The created team",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewTeamSchema),
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
      teamSchema,
      "The requested team",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not team",
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
  middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      UpdateTeamSchema,
      "The fighter updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      teamSchema,
      "The updated team",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Team not found",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(teamSchema)
        .or(createErrorSchema(IdUUIDParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/{id}",
  method: "delete",
  middleware: [requireScope()] as const, // TODO: Add requireRole('admin', 'commander') if needed
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "team deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Team not found",
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
