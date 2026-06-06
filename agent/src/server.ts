import { serve, upgradeWebSocket } from "@hono/node-server";
import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono } from "hono";
import { WebSocketServer } from "ws";

import { promptCodexThread } from "./codex.js";

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

app.get("/thread/:threadId/prompt", upgradeWebSocket((c) => {
  const threadId = c.req.param("threadId");
  const input = c.req.query("input");
  console.log(`Received prompt for thread ${threadId}: ${input}`);

  return {
    onOpen: async (event, ws) => {
      console.log(`WebSocket opened for thread ${threadId}`);

      if (!threadId) {
        ws.send(JSON.stringify({ error: "Missing threadId" }));
        ws.close();
        return;
      } else if (!input) {
        ws.send(JSON.stringify({ error: "Missing input" }));
        ws.close();
        return;
      }

      const events = promptCodexThread({ threadId, input });
      for await (const event of events) {
        ws.send(JSON.stringify(event));
      }
      ws.close();
    },
    onError: (event, ws) => {
      console.error(`WebSocket error for thread ${threadId}:`, event);
    },
    onClose: (event, ws) => {
      console.log(`WebSocket closed for thread ${threadId}`);
    },
  }
}));

app.use("*", async (c) => {
  return c.text("Not found", 404);
});


const wss = new WebSocketServer({ noServer: true });

serve({
  fetch: app.fetch,
  websocket: {
    server: wss,
  },
  port: 80,
}, info => {
  console.log(`Server running on port ${info.port}`);
});