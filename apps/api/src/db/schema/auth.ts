import { relations } from "drizzle-orm";
import { ID_FIELD, INTEGER_TIMESTEMP_OPTIONAL_FIELD, TEXT_OPTIONAL_FIELD, TEXT_REQUIERD_FIELD } from "../../utils/schemeHelper";
import type { AdapterAccountType } from "@auth/core/adapters";

import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userPlatoonMembership, UserPlatoonMembershipSchema, userTeamMembership, UserTeamMembershipSchema } from "./membership";


export enum UserRole {
  FIGHTER="FIGHTER",
  COMMANDER="COMMANDER",
  CAPTAIN="CAPTAIN",
  ADMIN="ADMIN"
}

export const usersRoles = Object.values(UserRole);


export const users = sqliteTable("user", {
  id: ID_FIELD('id'),
  name: TEXT_REQUIERD_FIELD("name"),
  email: TEXT_REQUIERD_FIELD("email").unique(),
  emailVerified: INTEGER_TIMESTEMP_OPTIONAL_FIELD("emailVerified"),
  image: TEXT_OPTIONAL_FIELD("image"),
  password: TEXT_REQUIERD_FIELD("password"),
  role: TEXT_REQUIERD_FIELD('role', { enum: usersRoles }).default(UserRole.FIGHTER),
  deletedAt: TEXT_OPTIONAL_FIELD('deleted_at'),
});

export const userRelations = relations(users, ({ many }) => ({
  userTeamMembership: many(userTeamMembership),
  userPlatoonMembership: many(userPlatoonMembership),
}));
export const loginSchema = z.object({
  name: z.string(),
  password: z.string()
})
export const userSchema = createSelectSchema(users).omit({
  password: true,
  emailVerified:true
}).extend({

  userTeamMembership: z.array(UserTeamMembershipSchema).optional(),
  userPlatoonMembership: z.array(UserPlatoonMembershipSchema).optional()

})
export const createUserSchema = createInsertSchema(users)
export type NewUser = z.infer<typeof createUserSchema>;
export type User = z.infer<typeof userSchema>;

export const accounts = sqliteTable(
  "account",
  {
    userId: TEXT_REQUIERD_FIELD("userId")
      .references(() => users.id, { onDelete: "cascade" }),
    type: TEXT_OPTIONAL_FIELD("type").$type<AdapterAccountType>().notNull(),
    provider: TEXT_REQUIERD_FIELD("provider"),
    providerAccountId: TEXT_REQUIERD_FIELD("providerAccountId"),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  account => [primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
  ]
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  verificationToken => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  }),
);

export const authenticators = sqliteTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: integer("credentialBackedUp", {
      mode: "boolean",
    }).notNull(),
    transports: text("transports"),
  },
  authenticator => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  }),
);
