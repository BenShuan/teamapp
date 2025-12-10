import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/api/lib/types";

import { createDb } from "@/api/db";
import {  users } from "@/api/db/schema";
import { userTeamMembership, userPlatoonMembership } from "@/api/db/schema/membership";

import type { CreateUserRoute, GetUserRoute, ListUsersRoute, PatchUserRoute, RemoveUserRoute, SetTeamsRoute, SetPlatoonsRoute } from "./users.routes";

export const list: AppRouteHandler<ListUsersRoute> = async (c) => {
  const db = createDb(c.env);
  const rows = await db.query.users.findMany({
    with:{
      userTeamMembership:true,
      userPlatoonMembership:true
    }
  }) ; // Include all (soft-deleted for admin view)
  return c.json(rows);
};

export const create: AppRouteHandler<CreateUserRoute> = async (c) => {
  const db = createDb(c.env);
  const payload = c.req.valid("json");
  const [inserted] = await db.insert(users).values(payload).returning();
  return c.json(inserted, HttpStatusCodes.CREATED);
};

export const getOne: AppRouteHandler<GetUserRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const row = await db.query.users.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });
  if (!row) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return c.json(row, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchUserRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");
  const [row] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  if (!row) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return c.json(row, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveUserRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  // Soft delete by setting deletedAt
  const [updated] = await db.update(users).set({ deletedAt: new Date().toISOString() }).where(eq(users.id, id)).returning();
  if (!updated) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const setTeams: AppRouteHandler<SetTeamsRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const assignments = c.req.valid("json"); // [{ userId, teamId }]

  // Clear existing memberships
  await db.delete(userTeamMembership).where(eq(userTeamMembership.userId, id));

  // Insert new ones
  const inserted = await Promise.all(
    assignments.map((a: { userId: string; teamId: string }) => db.insert(userTeamMembership).values({ userId: id, teamId: a.teamId }))
  );
  if (inserted.length !== assignments.length) {
    return c.json({ message: "Failed to assign all teams" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  // Return updated list
  const rows = await db.select().from(userTeamMembership).where(eq(userTeamMembership.userId, id));
  return c.json(rows, HttpStatusCodes.OK);
};

export const setPlatoons: AppRouteHandler<SetPlatoonsRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const assignments = c.req.valid("json"); // [{ userId, platoonId }]

  await db.delete(userPlatoonMembership).where(eq(userPlatoonMembership.userId, id));
  const inserted = await Promise.all(
    assignments.map((a: { userId: string; platoonId: string }) => db.insert(userPlatoonMembership).values({ userId: id, platoonId: a.platoonId }))
  );
  if (inserted.length !== assignments.length) {
    return c.json({ message: "Failed to assign all platoons" }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
  const rows = await db.select().from(userPlatoonMembership).where(eq(userPlatoonMembership.userId, id));
  return c.json(rows, HttpStatusCodes.OK);
};
