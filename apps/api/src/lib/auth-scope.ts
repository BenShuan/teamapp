import { inArray, eq } from "drizzle-orm";
import { users, userTeamMembership, userPlatoonMembership, team, UserRole } from "@/api/db/schema";
import { createDb } from "@/api/db";

export interface UserScope {
  role: keyof typeof UserRole;
  unrestricted: boolean;
  teamIds: string[];
  platoonIds: string[];
}

export async function getUserScope(env: any, userId: string): Promise<UserScope | null> {
  const db = createDb(env);
  const userRow = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userRow[0];
  if (!user) return null;

  if (  UserRole[user.role as keyof typeof UserRole] === UserRole.ADMIN) {
    return { role: user.role as keyof typeof UserRole, unrestricted: true, teamIds: [], platoonIds: [] };
  }

  // Team memberships
  const teamMembershipRows = await db
    .select({ teamId: userTeamMembership.teamId })
    .from(userTeamMembership)
    .where(eq(userTeamMembership.userId, userId));
  const teamIds = teamMembershipRows.map(r => r.teamId);

  // Derive platoonIds from teams or direct memberships
  let platoonIds: string[] = [];
  if (teamIds.length) {
    const platoonRows = await db.select({ platoonId: team.platoonId }).from(team).where(inArray(team.id, teamIds));
    platoonIds.push(
      ...platoonRows
        .map(r => r.platoonId)
        .filter((id): id is string => !!id),
    );
  }
  const directPlatoons = await db
    .select({ platoonId: userPlatoonMembership.platoonId })
    .from(userPlatoonMembership)
    .where(eq(userPlatoonMembership.userId, userId));
  platoonIds.push(...directPlatoons.map(r => r.platoonId));
  platoonIds = [...new Set(platoonIds)];

  return { role: user.role as keyof typeof UserRole, unrestricted: false, teamIds, platoonIds };
}

export function canManageTeam(scope: UserScope, teamId: string) {
  if (scope.unrestricted) return true;
  return scope.teamIds.includes(teamId);
}

export function canAccessPlatoon(scope: UserScope, platoonId: string) {
  if (scope.unrestricted) return true;
  return scope.platoonIds.includes(platoonId);
}

// Helper to build a Drizzle where predicate restricting by teamIds from scope
export function teamScopeWhere(scope: UserScope | null | undefined,teamIdKey:any="teamId") {
  console.log('scope', scope)
  if (!scope) return undefined;
  if (scope.unrestricted) return (_: any, operators: any)=>operators.eq(1, 1);
  if (scope.teamIds.length === 0) return undefined;
  return (fields: any, operators: any) => operators.inArray(fields[teamIdKey], scope.teamIds);
}
