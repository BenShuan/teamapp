import { sqliteTable } from "drizzle-orm/sqlite-core";
import { ID_FIELD, TEXT_REQUIERD_FIELD } from "../../utils/schemeHelper";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { team } from "./team";
import { platoon } from "./platoon";
import { timestamps } from "../../utils/timeStamps";
import { relations } from "drizzle-orm";

export enum Permissions {
  "VIEWER" ,
  "EDITOR" ,
  "MANAGER" ,
  "ADMIN" 
}

// User <-> Team membership with per-team role override
export const userTeamMembership = sqliteTable("user_team_membership", {
  id: ID_FIELD("id"),
  userId: TEXT_REQUIERD_FIELD("user_id").references(() => users.id, { onDelete: "cascade" }),
  teamId: TEXT_REQUIERD_FIELD("team_id").references(() => team.id, { onDelete: "cascade" }),
  teamRole: TEXT_REQUIERD_FIELD("team_role", { enum: Permissions }).default(Permissions[0]),
  ...timestamps,
});

export const userPlatoonMembership = sqliteTable("user_platoon_membership", {
  id: ID_FIELD("id"),
  userId: TEXT_REQUIERD_FIELD("user_id").references(() => users.id, { onDelete: "cascade" }),
  platoonId: TEXT_REQUIERD_FIELD("platoon_id").references(() => platoon.id, { onDelete: "cascade" }),
  platoonRole: TEXT_REQUIERD_FIELD("platoon_role", { enum: Permissions }).default(Permissions[0]),
  ...timestamps,
});

export const userTeamMembershipRelations = relations(userTeamMembership, ({ one }) => ({
  user: one(users, { fields: [userTeamMembership.userId], references: [users.id] }),
  team: one(team, { fields: [userTeamMembership.teamId], references: [team.id] }),
}));

export const userPlatoonMembershipRelations = relations(userPlatoonMembership, ({ one }) => ({
  user: one(users, { fields: [userPlatoonMembership.userId], references: [users.id] }),
  platoon: one(platoon, { fields: [userPlatoonMembership.platoonId], references: [platoon.id] }),
}));

// Zod schemas
export const NewUserTeamMembershipSchema = createInsertSchema(userTeamMembership).omit({ id: true });
export const UserTeamMembershipSchema = createSelectSchema(userTeamMembership);
export const NewUserPlatoonMembershipSchema = createInsertSchema(userPlatoonMembership).omit({ id: true });
export const UserPlatoonMembershipSchema = createSelectSchema(userPlatoonMembership);

export type NewUserTeamMembership = z.infer<typeof NewUserTeamMembershipSchema>;
export type UserTeamMembership = z.infer<typeof UserTeamMembershipSchema>;
export type NewUserPlatoonMembership = z.infer<typeof NewUserPlatoonMembershipSchema>;
export type UserPlatoonMembership = z.infer<typeof UserPlatoonMembershipSchema>;
