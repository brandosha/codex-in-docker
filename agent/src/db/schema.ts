import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const threadsTable = sqliteTable("threads", {
  id: text("id").primaryKey(),
  codexThreadId: text("codex_thread_id"),
});

export type ThreadInfo = typeof threadsTable.$inferSelect;