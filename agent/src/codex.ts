import path from "path";

import { Codex, CodexOptions, ThreadOptions } from "@openai/codex-sdk";
import { getThreadInfo, saveThreadInfo } from "./database.js";

interface PromptCodexThreadParams {
  threadId: string;
  input: string;
  options?: {
    codex?: CodexOptions;
    thread?: ThreadOptions;
  }
}

function startTurn({ threadId, input, options }: PromptCodexThreadParams) {
  options = {
    codex: {
      ...options?.codex,
    },
    thread: {
      sandboxMode: 'workspace-write',
      skipGitRepoCheck: true,
      ...options?.thread,
      workingDirectory: path.resolve("/root/workspaces", options?.thread?.workingDirectory || ""),
    },
  }

  const codex = new Codex(options?.codex);
  const threadInfo = getThreadInfo(threadId);

  let thread;
  const codexThreadId = threadInfo?.codexThreadId;
  if (codexThreadId) {
    thread = codex.resumeThread(codexThreadId, options.thread);
  } else {
    thread = codex.startThread(options.thread);
  }

  return thread.runStreamed(input);
}

export async function* promptCodexThread(params: PromptCodexThreadParams) {
  const { events } = await startTurn(params);

  for await (const event of events) {
    if (event.type === "thread.started") {
      // Save the mapping of our internal thread ID to the Codex thread ID so we can resume it later.
      // We have to wait to save this until the thread starts successfully, since if the thread fails to start
      // then we don't want to save an invalid mapping.
      const codexThreadId = event.thread_id;

      saveThreadInfo({
        id: params.threadId,
        codexThreadId
      });
    }
    
    yield event;
  }
}