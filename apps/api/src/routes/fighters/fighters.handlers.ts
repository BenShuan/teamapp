import { eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/api/lib/types";

import { createDb } from "@/api/db";
import { fighter } from "@/api/db/schema";
import { getScope } from "@/api/middleware/scope";
import {  teamScopeWhere } from "@/api/lib/auth-scope";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./fighters.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);

  // Build conditional where clause based on scope
  const fighters = await db.query.fighter.findMany({
    where: teamScopeWhere(scope),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
  });
  // If scoped and no memberships, return empty array
  if (scope && !scope.unrestricted && scope.teamIds.length === 0) {
    return c.json([]);
  }
  return c.json(fighters);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const task = c.req.valid("json")
  
  const [inserted] = await db.insert(fighter).values(task).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const task = await db.query.fighter.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id) && teamScopeWhere(getScope(c))?.(fields, operators);
    },
  });

  if (!task) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [task] = await db.update(fighter)
    .set(updates)
    .where(eq(fighter.id, id))
    .returning();

  if (!task) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(task, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const result: D1Response = await db.delete(fighter)
    .where(eq(fighter.id, id));

  if (result.meta.changes === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
