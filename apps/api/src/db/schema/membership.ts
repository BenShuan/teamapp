import { sqliteTable } from "drizzle-orm/sqlite-core";
import { ID_FIELD, TEXT_REQUIRED_FIELD, TEXT_REQUIRED_ENUM_FIELD } from "../../utils/schemaHelper";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./auth";
import { team } from "./team";
import { platoon } from "./platoon";
import { timestamps } from "../../utils/timeStamps";
import { relations } from "drizzle-orm";

export const permissions = ["VIEWER", "EDITOR", "MANAGER", "ADMIN"] as const;
export type Permission = typeof permissions[number];

// User <-> Team membership with per-team role override
export const userTeamMembership = sqliteTable("user_team_membership", {
  id: ID_FIELD("id"),
  userId: TEXT_REQUIRED_FIELD("user_id").references(() => users.id, { onDelete: "cascade" }),
  teamId: TEXT_REQUIRED_FIELD("team_id").references(() => team.id, { onDelete: "cascade" }),
  teamRole: TEXT_REQUIRED_ENUM_FIELD("team_role", permissions).default("VIEWER"),
  ...timestamps,
});

export const userPlatoonMembership = sqliteTable("user_platoon_membership", {
  id: ID_FIELD("id"),
  userId: TEXT_REQUIRED_FIELD("user_id").references(() => users.id, { onDelete: "cascade" }),
  platoonId: TEXT_REQUIRED_FIELD("platoon_id").references(() => platoon.id, { onDelete: "cascade" }),
  platoonRole: TEXT_REQUIRED_ENUM_FIELD("platoon_role", permissions).default("VIEWER"),
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
export type UserTeamMembership = typeof userTeamMembership.$inferSelect;
export type NewUserPlatoonMembership = z.infer<typeof NewUserPlatoonMembershipSchema>;
export type UserPlatoonMembership = typeof userPlatoonMembership.$inferSelect;
