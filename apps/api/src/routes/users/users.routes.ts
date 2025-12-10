import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createErrorSchema, IdUUIDParamsSchema } from "stoker/openapi/schemas";

import { internalServerErrorSchema, notFoundSchema } from "@/api/lib/constants";
import { userSchema, createUserSchema, usersRoles } from "@/api/db/schema";
import { NewUserTeamMembershipSchema, NewUserPlatoonMembershipSchema, UserTeamMembershipSchema, UserPlatoonMembershipSchema } from "@/api/db/schema/membership";
import { requireRole } from "@/api/middleware/scope";

const tags = ["users"];

export const list = createRoute({
  path: "/",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(userSchema),
      "The list of users",
    ),
  },
});

export const create = createRoute({
  path: "/",
  method: "post",
  middleware: [requireRole('ADMIN')] as const,
  request: {
    body: jsonContentRequired(
      createUserSchema.pick({ name: true, email: true, password: true, role: true }),
      "The user to create",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      userSchema,
      "The created user",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(createUserSchema),
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
      userSchema,
      "The requested user",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
  },
});

export const patch = createRoute({
  path: "/{id}",
  method: "patch",
  middleware: [requireRole("ADMIN")] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      z.object({
        role: z.enum(usersRoles as [string, ...string[]]).optional(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        deletedAt: z.string().nullable().optional()
      }),
      "The user updates",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      userSchema,
      "The updated user",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
  },
});

export const remove = createRoute({
  path: "/{id}",
  method: "delete",
  middleware: [requireRole("ADMIN")] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: "User deleted",
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "User not found",
    ),
  },
});

// Membership management
export const setTeams = createRoute({
  path: "/{id}/teams",
  method: "put",
  middleware: [requireRole("ADMIN")] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      z.array(NewUserTeamMembershipSchema.pick({ teamId: true }).extend({ userId: z.string().uuid() })),
      "Teams to assign",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(UserTeamMembershipSchema),
      "Assigned team memberships",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UserTeamMembershipSchema),
      "The validation error(s)",
    ), [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Error assigning teams",
    ),
  },

});

export const setPlatoons = createRoute({
  path: "/{id}/platoons",
  method: "put",
  middleware: [requireRole("ADMIN")] as const,
  request: {
    params: IdUUIDParamsSchema,
    body: jsonContentRequired(
      z.array(NewUserPlatoonMembershipSchema.pick({ platoonId: true }).extend({ userId: z.string().uuid() })),
      "Platoons to assign",
    ),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(UserPlatoonMembershipSchema),
      "Assigned platoon memberships",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(UserPlatoonMembershipSchema),
      "The validation error(s)",
    ), [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Error assigning teams",
    ),
  },
});

export type ListUsersRoute = typeof list;
export type CreateUserRoute = typeof create;
export type GetUserRoute = typeof getOne;
export type PatchUserRoute = typeof patch;
export type RemoveUserRoute = typeof remove;
export type SetTeamsRoute = typeof setTeams;
export type SetPlatoonsRoute = typeof setPlatoons;
