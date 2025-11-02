import { integer } from "drizzle-orm/sqlite-core";

export const timestamps = {
  // columns.helpers.ts
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => new Date()).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
};

