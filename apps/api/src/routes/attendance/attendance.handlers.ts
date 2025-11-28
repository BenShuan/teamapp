import {  between, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { formatShortDate } from "@teamapp/shared"

import type { AppRouteHandler } from "@/api/lib/types";

import { createDb } from "@/api/db";
import { attendance } from "@/api/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./attendance.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);

  const { startDate, endDate } = c.req.valid("query");

  const query = {
    where: between(
      attendance.workDate,
      formatShortDate( startDate??""),
      formatShortDate( endDate??"")
    ),
  }
  
  const rows = await db.query.fighter.findMany({
    columns: { id: true, firstName: true, lastName: true, personalNumber: true },
    with: {
      attendances: query
    },
    orderBy(fields, operators) {
      return operators.desc(fields.firstName);
    },
  });
  return c.json(rows);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const body = c.req.valid("json");

  const inserted = await db.insert(attendance).values(body).onConflictDoNothing().returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const row = await db.query.attendance.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!row) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(row, HttpStatusCodes.OK);
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

  const rows = await db.update(attendance)
    .set(updates)
    .where(eq(attendance.id, id))
    .returning();

  if (!rows || rows.length === 0) {
    return c.json(
      {
        message: HttpStatusPhrases.NOT_FOUND,
      },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(rows[0], HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const result: D1Response = await db.delete(attendance)
    .where(eq(attendance.id, id));

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
