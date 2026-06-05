import fs from "fs/promises";

import { serve, upgradeWebSocket } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono } from "hono";

const app = new Hono();

// Block any local server access so that untrusted agents can't access other threads or the agent manager server itself.
app.use("*", async (c, next) => {
  const connInfo = getConnInfo(c);
  const remoteAddr = connInfo.remote.address;

  if (["localhost", "127.0.0.1", "::1", undefined].includes(remoteAddr)) {
    return c.text("Forbidden", 403);
  }
  return next();
});

app.get("/thread/:threadId/prompt", upgradeWebSocket(async (c) => {
  const threadId = c.req.param("threadId");
  const prompt = c.req.query("prompt");
  return {
    onOpen: async (ws) => {
      console.log(`WebSocket opened for thread ${threadId}`);
    },
  }
}));

app.use("*", async (c) => {
  return c.text("Not found", 404);
});

serve({
  fetch: app.fetch,
  port: 80,
}, info => {
  console.log(`Server running on port ${info.port}`);
});