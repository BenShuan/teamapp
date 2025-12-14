import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/api/lib/types";
import { createDb } from "@/api/db";
import { logisticGear } from "@/api/db/schema";
import { teamScopeWhere } from "@/api/lib/auth-scope";
import { getScope } from "@/api/middleware/scope";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./logisticGear.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);

  const rows = await db.query.logisticGear.findMany({
    where: teamScopeWhere(scope, "teamId") ?? undefined,
  });

  return c.json(rows, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const payload = c.req.valid("json");

  // Scope guard
  if (scope && !scope.unrestricted && !scope.teamIds.includes(payload.teamId)) {
    return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
  }

  const [inserted] = await db.insert(logisticGear).values(payload).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { id } = c.req.valid("param");

  const row = await db.query.logisticGear.findFirst({
    where(fields, operators) {
      const clauses = [operators.eq(fields.id, id)];
      const scopeWhere = teamScopeWhere(scope, "teamId");
      if (scopeWhere) clauses.push(scopeWhere(fields, operators));
      return clauses.length === 1 ? clauses[0] : operators.and(...clauses);
    },
  });

  if (!row) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(row, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  // Fetch existing to scope-check
  const existing = await db.query.logisticGear.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!existing) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  if (scope && !scope.unrestricted && !scope.teamIds.includes(existing.teamId)) {
    return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
  }

  const [updated] = await db
    .update(logisticGear)
    .set({ ...updates, updatedAt: new Date().toISOString() })
    .where(eq(logisticGear.id, id))
    .returning();

  return c.json(updated, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { id } = c.req.valid("param");

  const existing = await db.query.logisticGear.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!existing) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  if (scope && !scope.unrestricted && !scope.teamIds.includes(existing.teamId)) {
    return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
  }

  await db.delete(logisticGear).where(eq(logisticGear.id, id));
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
