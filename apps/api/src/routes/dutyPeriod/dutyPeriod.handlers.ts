import { count, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/api/lib/types";

import { createDb } from "@/api/db";
import { attendance, dutyPeriod } from "@/api/db/schema";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";

import type {
  CreateRoute,
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
} from "./dutyPeriod.routes";

function assertDateRange(start: string, end: string): boolean {
  return start <= end;
}

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);
  const rows = await db.query.dutyPeriod.findMany({
    orderBy(fields, operators) {
      return operators.desc(fields.startDate);
    },
  });
  return c.json(rows, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const body = c.req.valid("json");

  if (!assertDateRange(body.startDate, body.endDate)) {
    return c.json(
      { message: "תאריך התחלה חייב להיות לפני או שווה לתאריך הסיום" },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [inserted] = await db.insert(dutyPeriod).values(body).returning();
  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const row = await db.query.dutyPeriod.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!row) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
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

  const existing = await db.query.dutyPeriod.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!existing) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const start = updates.startDate ?? existing.startDate;
  const end = updates.endDate ?? existing.endDate;
  if (!assertDateRange(start, end)) {
    return c.json(
      { message: "תאריך התחלה חייב להיות לפני או שווה לתאריך הסיום" },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  const [updated] = await db
    .update(dutyPeriod)
    .set(updates)
    .where(eq(dutyPeriod.id, id))
    .returning();

  if (!updated) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  return c.json(updated, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");

  const existing = await db.query.dutyPeriod.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id);
    },
  });

  if (!existing) {
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const [usage] = await db
    .select({ n: count() })
    .from(attendance)
    .where(eq(attendance.dutyPeriodId, id));

  if (usage.n > 0) {
    return c.json(
      {
        message:
          "לא ניתן למחוק תקופת צו שיש לה רשומות נוכחות — מחקו או העבירו נוכחות תחילה",
      },
      HttpStatusCodes.UNPROCESSABLE_ENTITY,
    );
  }

  await db.delete(dutyPeriod).where(eq(dutyPeriod.id, id));
  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
