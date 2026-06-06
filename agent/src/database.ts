import path from "path";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { appDir, dataDir } from "./paths.js";
import { ThreadInfo, threadsTable } from "./db/schema.js";

const DB_PATH = path.join(dataDir, "db.sqlite");
export const db = drizzle(DB_PATH);
migrate(db, { migrationsFolder: path.join(appDir, "drizzle") });

export function getThreadInfo(threadId: string): ThreadInfo | undefined {
  return db.select()
    .from(threadsTable)
    .where(eq(threadsTable.id, threadId))
    .get();
}

export function saveThreadInfo(threadInfo: ThreadInfo) {
  db.insert(threadsTable)
    .values(threadInfo)
    .onConflictDoUpdate({
      target: threadsTable.id,
      set: {
        codexThreadId: threadInfo.codexThreadId
      },
    })
    .run();
}