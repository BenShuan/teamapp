import {  text } from "drizzle-orm/sqlite-core";

export const timestamps = {
  // columns.helpers.ts
  updatedAt: text("updated_at"),
  createdAt: text("created_at").$default(() => new Date().toISOString()).notNull(),
  deletedAt: text("deleted_at"),
};

