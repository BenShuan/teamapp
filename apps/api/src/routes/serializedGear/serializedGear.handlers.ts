import { and, desc, eq, inArray } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

import type { AppRouteHandler } from "@/api/lib/types";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";
import { createDb } from "@/api/db";
import {
  fighter,
  serializedGear,
  serializedGearFighter,
  serializedGearCheck,
  type SerializedGearFighter,
  type UpdateSerializedGearFighter,
} from "@/api/db/schema";
import { type UserScope } from "@/api/lib/auth-scope";
import { getScope } from "@/api/middleware/scope";

import type {
  BulkCheckRoute,
  CreateCheckRoute,
  CreateRoute,
  CreateGearRoute,
  GetGearRoute,
  GetOneRoute,
  ListRoute,
  ListGearRoute,
  PatchGearRoute,
  PatchRoute,
  RemoveGearRoute,
  RemoveRoute,
} from "./serializedGear.routes";

const nowIso = () => new Date().toISOString();
const notFoundMessage = HttpStatusPhrases.NOT_FOUND; 
const todayDate = () => new Date().toISOString().slice(0, 10);

function gearAssignmentScopeFilter(scope: UserScope | null | undefined) {
  if (!scope) return undefined;
  if (scope.unrestricted) return undefined;
  if (scope.teamIds.length === 0) return null;
  return inArray(serializedGearFighter.fightersTeamId, scope.teamIds);
}

async function assertFighterInScope(db: ReturnType<typeof createDb>, scope: UserScope, fighterId: string) {
  if (scope.unrestricted) return;
  const [fighterRow] = await db
    .select({ teamId: fighter.teamId })
    .from(fighter)
    .where(eq(fighter.id, fighterId));
  if (!fighterRow || !fighterRow.teamId || !scope.teamIds.includes(fighterRow.teamId)) {
    throw new Error("FORBIDDEN_SCOPE");
  }
}

async function fetchScopedGearAssignment(
  db: ReturnType<typeof createDb>,
  scope: UserScope | null,
  id: string,
): Promise<SerializedGearFighter | null> {
  const scopeFilter = gearAssignmentScopeFilter(scope);
  if (scopeFilter === null) return null;

  const row = await db
    .select({ assignment: serializedGearFighter })
    .from(serializedGearFighter)
    .innerJoin(fighter, eq(serializedGearFighter.fighterId, fighter.id))
    .where(scopeFilter ? and(eq(serializedGearFighter.id, id), scopeFilter) : eq(serializedGearFighter.id, id))
    .limit(1);

  return row?.[0]?.assignment ?? null;
}

// Gear catalog handlers
export const listGear: AppRouteHandler<ListGearRoute> = async (c) => {
  const db = createDb(c.env);

  const rows = await db
    .select()
    .from(serializedGear)
    .orderBy(desc(serializedGear.createdAt));

  return c.json(rows, HttpStatusCodes.OK);
};

export const createGear: AppRouteHandler<CreateGearRoute> = async (c) => {
  const db = createDb(c.env);
  const payload = c.req.valid("json");

  const now = nowIso();
  const [inserted] = await db
    .insert(serializedGear)
    .values({ ...payload, updatedAt: now })
    .returning();

  return c.json(inserted, HttpStatusCodes.OK);
};

export const getGear: AppRouteHandler<GetGearRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");

  const [row] = await db
    .select()
    .from(serializedGear)
    .where(eq(serializedGear.id, id))
    .limit(1);

  if (!row) {
    return c.json({ message: notFoundMessage }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(row, HttpStatusCodes.OK);
};

export const patchGear: AppRouteHandler<PatchGearRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");
  const payload = c.req.valid("json");

  const now = nowIso();
  const [updated] = await db
    .update(serializedGear)
    .set({ ...payload, updatedAt: now })
    .where(eq(serializedGear.id, id))
    .returning();

  if (!updated) {
    return c.json({ message: notFoundMessage }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updated, HttpStatusCodes.OK);
};

export const removeGear: AppRouteHandler<RemoveGearRoute> = async (c) => {
  const db = createDb(c.env);
  const { id } = c.req.valid("param");

  const result = await db
    .delete(serializedGear)
    .where(eq(serializedGear.id, id))
    .returning({ id: serializedGear.id });

  if (result.length === 0) {
    return c.json({ message: notFoundMessage }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

// Gear assignment handlers
export const list: AppRouteHandler<ListRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);

  if (scope && !scope.unrestricted && scope.teamIds.length === 0) {
    return c.json([]);
  }

  const whereClause = gearAssignmentScopeFilter(scope);

  const assignments = await db.query.serializedGearFighter.findMany({
    where: whereClause ?? undefined,
    orderBy: desc(serializedGearFighter.createdAt),
    with: {
      checks: true,
    },
  });

  return c.json(assignments, HttpStatusCodes.OK);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const payload = c.req.valid("json");

  if (!scope) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }

  // try {
  //   await assertFighterInScope(db, scope, payload.fighterId);
  // } catch {
  //   return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
  // }

  const now = nowIso();
  const [inserted] = await db
    .insert(serializedGearFighter)
    .values({ ...payload, updatedAt: now })
    .returning();

  return c.json(inserted, HttpStatusCodes.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { id } = c.req.valid("param");

  const row = await fetchScopedGearAssignment(db, scope, id);

  if (!row) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(row, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json") as UpdateSerializedGearFighter;

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

  const existing = await fetchScopedGearAssignment(db, scope, id);
  if (!existing) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  if (updates.fighterId) {
    try {
      await assertFighterInScope(db, scope as UserScope, updates.fighterId);
    } catch {
      return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
    }
  }

  const now = nowIso();
  const [row] = await db
    .update(serializedGearFighter)
    .set({ ...updates, updatedAt: now })
    .where(eq(serializedGearFighter.id, id))
    .returning();

  if (!row) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(row, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { id } = c.req.valid("param");

  const existing = await fetchScopedGearAssignment(db, scope, id);
  if (!existing) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  const result: D1Response = await db.delete(serializedGearFighter).where(eq(serializedGearFighter.id, id));

  if (result.meta.changes === 0) {
    return c.json({ message: HttpStatusPhrases.NOT_FOUND }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const bulkCheck: AppRouteHandler<BulkCheckRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { teamId, date } = c.req.valid("json");

  if (!scope) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }
  if (!scope.unrestricted && !scope.teamIds.includes(teamId)) {
    return c.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN);
  }

  const effectiveDate = date ?? todayDate();
  const now = nowIso();

  const gearRows = await db
    .select({
      assignmentId: serializedGearFighter.id,
      fighterId: serializedGearFighter.fighterId,
      teamId: fighter.teamId,
    })
    .from(serializedGearFighter)
    .innerJoin(fighter, eq(serializedGearFighter.fighterId, fighter.id))
    .where(eq(fighter.teamId, teamId));

  if (!gearRows.length) {
    return c.json({ checkedCount: 0, failedCount: 0 }, HttpStatusCodes.OK);
  }

  const { checked, failed } = await db.transaction(async (tx) => {
    let checkedCount = 0;
    let failedCount = 0;

    for (const row of gearRows) {
      try {
        await tx
          .insert(serializedGearCheck)
          .values({
            serializedGearFighterId: row.assignmentId,
            date: effectiveDate,
            isCheck: true,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [serializedGearCheck.serializedGearFighterId, serializedGearCheck.date],
            set: { isCheck: true, updatedAt: now },
          });

        await tx
          .update(serializedGearFighter)
          .set({ lastCheckDate: effectiveDate, updatedAt: now })
          .where(eq(serializedGearFighter.id, row.assignmentId));

        checkedCount += 1;
      } catch (err) {
        console.error("bulkCheck failure", err);
        failedCount += 1;
      }
    }

    return { checked: checkedCount, failed: failedCount };
  });

  return c.json({ checkedCount: checked, failedCount: failed }, HttpStatusCodes.OK);
};

export const createCheck: AppRouteHandler<CreateCheckRoute> = async (c) => {
  const db = createDb(c.env);
  const scope = getScope(c);
  const { id } = c.req.valid("param");
  const { date, isCheck } = c.req.valid("json");

  if (!scope) {
    return c.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED);
  }

  // Verify assignment exists and is in scope
  const whereClause = gearAssignmentScopeFilter(scope);
  const [assignment] = await db
    .select()
    .from(serializedGearFighter)
    .innerJoin(fighter, eq(serializedGearFighter.fighterId, fighter.id))
    .where(and(eq(serializedGearFighter.id, id), whereClause ?? undefined))
    .limit(1);

  if (!assignment) {
    return c.json({ message: notFoundMessage }, HttpStatusCodes.NOT_FOUND);
  }

  const now = nowIso();

  await db
    .insert(serializedGearCheck)
    .values({
      serializedGearFighterId: id,
      date,
      isCheck,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [serializedGearCheck.serializedGearFighterId, serializedGearCheck.date],
      set: { isCheck, updatedAt: now },
    });

  // Update lastCheckDate if checked
  if (isCheck) {
    await db
      .update(serializedGearFighter)
      .set({ lastCheckDate: date, updatedAt: now })
      .where(eq(serializedGearFighter.id, id));
  }

  return c.json({ success: true }, HttpStatusCodes.OK);
};
