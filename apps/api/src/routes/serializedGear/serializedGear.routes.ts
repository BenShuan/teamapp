import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { forbiddenSchema, notFoundSchema, unauthorizedSchema } from "@/api/lib/constants";
import {
  NewSerializedGearSchema,
  SerializedGearSchema,
  NewSerializedGearFighterSchema,
  SerializedGearFighterSchema,
  UpdateSerializedGearFighterSchema,
} from "@/api/db/schema";
import { requireRole, requireScope } from "@/api/middleware/scope";

const tags = ["serialized-gear"];
const messageSchema = z.object({ message: z.string() });

// Gear catalog routes
export const listGear = createRoute({
  path: "/catalog",
  method: "get",
  middleware: [requireScope()] as const,
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(SerializedGearSchema),
      "The list of gear catalog items",
    ),
  },
});

export const createGear = createRoute({
  path: "/catalog",
  method: "post",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    body: jsonContentRequired(NewSerializedGearSchema, "The gear catalog item to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SerializedGearSchema, "The created gear catalog item"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewSerializedGearSchema),
      "The validation error(s)",
    ),
  },
});

export const getGear = createRoute({
  path: "/catalog/{id}",
  method: "get",
  middleware: [requireScope()] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SerializedGearSchema, "The requested gear catalog item"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Gear catalog item not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema),
      "Invalid id error",
    ),
  },
});

export const patchGear = createRoute({
  path: "/catalog/{id}",
  method: "patch",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(NewSerializedGearSchema, "The gear catalog item updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SerializedGearSchema, "The updated gear catalog item"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Gear catalog item not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewSerializedGearSchema)
        .or(createErrorSchema(IdUUIDParamsSchema)),
      "The validation error(s)",
    ),
  },
});

export const removeGear = createRoute({
  path: "/catalog/{id}",
  method: "delete",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: "Gear catalog item deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Gear catalog item not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema),
      "Invalid id error",
    ),
  },
});

// Gear assignment routes
export const list = createRoute({
  path: "/",
  method: "get",
  middleware: [requireScope()] as const,
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(SerializedGearFighterSchema),
      "The list of gear assignments",
    ),
  },
});

export const create = createRoute({
  path: "/",
  method: "post",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    body: jsonContentRequired(NewSerializedGearFighterSchema, "The gear assignment to create"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SerializedGearFighterSchema, "The created gear assignment"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(messageSchema, "Authentication required"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(messageSchema, "Insufficient permissions"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewSerializedGearFighterSchema),
      "The validation error(s)",
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
    [HttpStatusCodes.OK]: jsonContent(SerializedGearFighterSchema, "The requested gear assignment"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Gear assignment not found"),
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
    body: jsonContentRequired(UpdateSerializedGearFighterSchema, "The gear assignment updates"),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(SerializedGearFighterSchema, "The updated gear assignment"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Authentication required"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, "Insufficient permissions"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Gear assignment not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UpdateSerializedGearFighterSchema)
        .or(createErrorSchema(IdUUIDParamsSchema)),
      "The validation error(s)",
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
    [HttpStatusCodes.NO_CONTENT]: { description: "Gear assignment deleted" },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Gear assignment not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema),
      "Invalid id error",
    ),
  },
});

export const bulkCheck = createRoute({
  path: "/bulk-check",
  method: "post",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    body: jsonContentRequired(
      z.object({
        teamId: z.string().uuid(),
        date: z.string().optional(),
      }),
      "Perform bulk daily checks for all gear in a team",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        checkedCount: z.number(),
        failedCount: z.number(),
      }),
      "Bulk check results",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Authentication required"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, "Insufficient permissions"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        z.object({
          teamId: z.string().uuid(),
          date: z.string().optional(),
        }),
      ),
      "The validation error(s)",
    ),
  },
});

export const createCheck = createRoute({
  path: "/{id}/check",
  method: "post",
  middleware: [requireScope(), requireRole("COMMANDER")] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      z.object({
        date: z.string(),
        isCheck: z.boolean(),
      }),
      "Create or update a gear check record",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ success: z.boolean() ,message: z.string().optional() }),
      "Check created/updated",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(unauthorizedSchema, "Authentication required"),
    [HttpStatusCodes.FORBIDDEN]: jsonContent(forbiddenSchema, "Insufficient permissions"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Gear assignment not found"),
  },
});

export type ListGearRoute = typeof listGear;
export type CreateGearRoute = typeof createGear;
export type GetGearRoute = typeof getGear;
export type PatchGearRoute = typeof patchGear;
export type RemoveGearRoute = typeof removeGear;
export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type BulkCheckRoute = typeof bulkCheck;
export type CreateCheckRoute = typeof createCheck;
