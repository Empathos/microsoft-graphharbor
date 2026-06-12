import { loadConfig } from "./config.js";
import { pollOnceFromState, primeState } from "./bridgeLoop.js";
import { listRecentMessages, sendChatMessage } from "./graphClient.js";
import type { GraphChatMessage } from "./graphClient.js";
import { runInterpreterCommand } from "./interpreter.js";
import { getAccessToken } from "./tokenStore.js";

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8").trim();
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function messageText(message: GraphChatMessage): string {
  return stripHtml(message.body?.content ?? "");
}

async function replyForMessage(params: {
  prefix: string;
  interpreterCommand?: string;
  message: GraphChatMessage;
}): Promise<string | undefined> {
  const { prefix, interpreterCommand, message } = params;
  const text = messageText(message);

  if (!text || text.startsWith(prefix)) {
    return undefined;
  }

  const from = message.from?.user?.displayName ?? message.from?.application?.displayName ?? "unknown";
  if (!interpreterCommand) {
    console.warn(`No INTERPRETER_COMMAND configured; skipping message ${message.id} from ${from}`);
    return undefined;
  }

  return await runInterpreterCommand({
    command: interpreterCommand,
    input: { message, text, from },
  });
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? "poll-once";

  if (command === "send-message") {
    const rawArgs = process.argv.slice(3);
    const dryRun = rawArgs.includes("--dry-run");
    const messageArgs = rawArgs.filter((arg) => arg !== "--dry-run");
    const content = messageArgs.join(" ").trim() || (await readStdin());
    if (!content) {
      throw new Error("send-message requires message text as arguments or stdin");
    }

    if (dryRun) {
      console.log(
        JSON.stringify(
          {
            status: "dry-run",
            messageLength: content.length,
          },
          null,
          2,
        ),
      );
      return;
    }

    const config = loadConfig();
    const accessToken = await getAccessToken(config.tokenFile);
    const sent = await sendChatMessage({
      accessToken,
      chatId: config.chatId,
      content,
    });
    console.log(
      JSON.stringify(
        {
          status: "sent",
          id: sent.id,
          createdDateTime: sent.createdDateTime ?? null,
        },
        null,
        2,
      ),
    );
    return;
  }

  const config = loadConfig();
  const accessToken = await getAccessToken(config.tokenFile);

  if (command === "prime") {
    const result = await primeState({
      accessToken,
      chatId: config.chatId,
      stateFile: config.stateFile,
    });
    console.log(JSON.stringify({ status: "primed", ...result }, null, 2));
    return;
  }

  if (command === "read-smoke") {
    const messages = await listRecentMessages({
      accessToken,
      chatId: config.chatId,
      top: 5,
    });
    console.log(
      JSON.stringify(
        {
          status: "read-smoke-ok",
          messagesReturned: messages.length,
          newestCreatedDateTime: messages[0]?.createdDateTime ?? null,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (command === "poll-once") {
    const result = await pollOnceFromState({
      accessToken,
      chatId: config.chatId,
      stateFile: config.stateFile,
      reply: async (message) =>
        await replyForMessage({
          prefix: config.replyPrefix,
          interpreterCommand: config.interpreterCommand,
          message,
        }),
    });
    console.log(JSON.stringify({ status: "polled", ...result }, null, 2));
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
