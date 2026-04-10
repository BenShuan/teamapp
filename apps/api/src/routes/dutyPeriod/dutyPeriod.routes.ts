import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { notFoundSchema } from "@/api/lib/constants";
import {
  DutyPeriodSchema,
  NewDutyPeriodSchema,
  UpdateDutyPeriodSchema,
} from "@/api/db/schema";
import { requireRole, requireScope } from "@/api/middleware/scope";

const tags = ["duty-periods"];

/** Business-rule errors (e.g. date range, FK usage) */
const dutyPeriodMessageErrorSchema = z.object({ message: z.string() });

const emptyPatchErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    issues: z.array(
      z.object({
        code: z.string(),
        path: z.array(z.union([z.string(), z.number()])),
        message: z.string().optional(),
      }),
    ),
    name: z.string(),
  }),
});

export const list = createRoute({
  path: "/",
  method: "get",
  tags,
  middleware: [requireScope()] as const,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(DutyPeriodSchema),
      "Global duty periods (מילואים)",
    ),
  },
});

export const create = createRoute({
  path: "/",
  method: "post",
  tags,
  middleware: [requireScope(), requireRole("ADMIN")] as const,
  request: {
    body: jsonContentRequired(NewDutyPeriodSchema, "New duty period"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(DutyPeriodSchema, "Created duty period"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(NewDutyPeriodSchema).or(dutyPeriodMessageErrorSchema),
      "Validation or invalid date range",
    ),
  },
});

export const getOne = createRoute({
  path: "/{id}",
  method: "get",
  tags,
  middleware: [requireScope()] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(DutyPeriodSchema, "Duty period"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema),
      "Invalid id",
    ),
  },
});

export const patch = createRoute({
  path: "/{id}",
  method: "patch",
  tags,
  middleware: [requireScope(), requireRole("ADMIN")] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(UpdateDutyPeriodSchema, "Updates"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(DutyPeriodSchema, "Updated duty period"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UpdateDutyPeriodSchema)
        .or(createErrorSchema(IdUUIDParamsSchema))
        .or(dutyPeriodMessageErrorSchema)
        .or(emptyPatchErrorSchema),
      "Validation or business rule",
    ),
  },
});

export const remove = createRoute({
  path: "/{id}",
  method: "delete",
  tags,
  middleware: [requireScope(), requireRole("ADMIN")] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "Duty period deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Not found"),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdUUIDParamsSchema).or(dutyPeriodMessageErrorSchema),
      "Invalid id or period still has attendance",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
