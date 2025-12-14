import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { forbiddenSchema, notFoundSchema, unauthorizedSchema } from "@/api/lib/constants";
import { NewLogisticGearSchema, LogisticGearSchema, UpdateLogisticGearSchema } from "@/api/db/schema";
import { requireScope, requireRole } from "@/api/middleware/scope";

const tags = ["logistic-gear"];

export const list = createRoute({
  path: "/",
  method: "get",
  middleware: [requireScope()] as const,
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(LogisticGearSchema),
      "List logistic gear items",
    ),
  },
});

export const create = createRoute({
  path: "/",
  method: "post",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    body: jsonContentRequired(NewLogisticGearSchema, "Logistic gear to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(LogisticGearSchema, "Created logistic gear"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Authentication required"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, "Insufficient permissions"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewLogisticGearSchema),
      "Validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/{id}",
  method: "get",
  middleware: [requireScope()] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(LogisticGearSchema, "Requested logistic gear"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/{id}",
  method: "patch",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(UpdateLogisticGearSchema, "Logistic gear updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(LogisticGearSchema, "Updated logistic gear"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Authentication required"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, "Insufficient permissions"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UpdateLogisticGearSchema).or(createErrorSchema(IdUUIDParamsSchema)),
      "Validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/{id}",
  method: "delete",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Logistic gear deleted" },
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Authentication required"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, "Insufficient permissions"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
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
