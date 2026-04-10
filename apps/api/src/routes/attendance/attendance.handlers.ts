import { and, between, eq, inArray } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { formatShortDate } from "@teamapp/shared"

import type { AppRouteHandler } from "@/api/lib/types";
import type { DutyPeriod } from "@/api/db/schema";

import { createDb } from "@/api/db";
import { attendance, dutyPeriod } from "@/api/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./attendance.routes";
import { teamScopeWhere } from "@/api/lib/auth-scope";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = c.get("scope");
  const { dutyPeriodId, startDate, endDate } = c.req.valid("query");

  const period = await db.query.dutyPeriod.findFirst({
    where: (fields, ops) => ops.eq(fields.id, dutyPeriodId),
  });
  if (!period) {
    return c.json({ message: "תקופת צו לא נמצאה" }, HttpStatusCodes.NOT_FOUND);
  }

  const effectiveStart = startDate && startDate > period.startDate ? startDate : period.startDate;
  const effectiveEnd = endDate && endDate < period.endDate ? endDate : period.endDate;

  const rows = await db.query.fighter.findMany({
    columns: { id: true, firstName: true, lastName: true, personalNumber: true },
    with: {
      attendances: {
        where: and(
          eq(attendance.dutyPeriodId, dutyPeriodId),
          between(attendance.workDate, formatShortDate(effectiveStart), formatShortDate(effectiveEnd)),
        ),
      },
    },
    where: teamScopeWhere(scope),
    orderBy(fields, operators) {
      return operators.desc(fields.firstName);
    },
  });
  return c.json(rows, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const body = c.req.valid("json");

  // Pre-fetch: resolve open period once (for rows without explicit dutyPeriodId)
  const needsOpenPeriod = body.some((r) => r.dutyPeriodId === undefined);
  let openPeriod: DutyPeriod | undefined;

  if (needsOpenPeriod) {
    const openPeriods = await db
      .select()
      .from(dutyPeriod)
      .where(eq(dutyPeriod.isOpen, true));
    if (openPeriods.length !== 1) {
      return c.json(
        {
          message:
            openPeriods.length === 0
              ? "אין תקופת צו פתוחה — יש לפתוח תקופה או לציין dutyPeriodId"
              : "יש יותר מתקופת צו פתוחה אחת — יש לציין dutyPeriodId",
        },
        HttpStatusCodes.UNPROCESSABLE_ENTITY,
      );
    }
    openPeriod = openPeriods[0];
  }

  // Pre-fetch: bulk-load all explicitly referenced duty periods
  const explicitIds = [...new Set(body.map((r) => r.dutyPeriodId).filter(Boolean))] as string[];
  const explicitPeriods = new Map<string, DutyPeriod>();
  if (explicitIds.length > 0) {
    const rows = await db.select().from(dutyPeriod).where(inArray(dutyPeriod.id, explicitIds));
    for (const r of rows) explicitPeriods.set(r.id, r);
  }

  const rowsToInsert = [];
  for (let i = 0; i < body.length; i++) {
    const row = body[i];
    const periodRow = row.dutyPeriodId !== undefined
      ? explicitPeriods.get(row.dutyPeriodId)
      : openPeriod;

    if (!periodRow) {
      return c.json(
        { message: `שורה ${i + 1} (לוחם ${row.fighterId}): תקופת צו לא נמצאה` },
        HttpStatusCodes.UNPROCESSABLE_ENTITY,
      );
    }
    if (!periodRow.isOpen) {
      return c.json(
        { message: `שורה ${i + 1} (לוחם ${row.fighterId}): תקופת הצו סגורה לרישום נוכחות` },
        HttpStatusCodes.UNPROCESSABLE_ENTITY,
      );
    }
    if (row.workDate < periodRow.startDate || row.workDate > periodRow.endDate) {
      return c.json(
        { message: `שורה ${i + 1} (לוחם ${row.fighterId}): התאריך ${row.workDate} מחוץ לטווח תקופת הצו (${periodRow.startDate} – ${periodRow.endDate})` },
        HttpStatusCodes.UNPROCESSABLE_ENTITY,
      );
    }

    rowsToInsert.push({ ...row, dutyPeriodId: periodRow.id });
  }

  const inserted = await db.insert(attendance).values(rowsToInsert).onConflictDoNothing().returning();
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
    .set(updates as Record<string, unknown>)
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
