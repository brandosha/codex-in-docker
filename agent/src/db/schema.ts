import { index, int, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const threadsTable = sqliteTable("threads", {
  id: text("id").primaryKey(),
  codexThreadId: text("codex_thread_id"),
});

